import { generateArc } from "@/lib/claude";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

// This tells Next.js to run this route as a standard
// Node.js serverless function rather than the Edge runtime.
// We need Node.js here because Prisma requires it —
// the Edge runtime is a stripped-down environment that
// doesn't support Prisma's native database drivers.
// Our OG image route (/api/og) uses Edge because @vercel/og
// is specifically built for it. Different tools, different runtimes.

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://arcforge.me";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // -- Step 1: Extract the IP address --
    // Vercel sets the real client IP in the x-forwarded-for header. In development this will be ::1 (IPv6 localhost)
    // which is fine - rate limiting just won't do much locally.
    // We fall back to "unknown" rather than crashing if the header is somehow absent.
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "unknown";

    // -- Step 2: Parse and validate the request body --
    // We explicitly type the destructured values so TypeScript
    // enforces our expectations. If the client sends malformed
    // JSON or missing fields, the catch block handles it cleanly.
    const body = await req.json();
    const { answers, fingerprint } = body as {
      answers: Record<string, string>;
      fingerprint: string | null;
    };

    // Basic validation - we need exactly 8 answers.
    // We check the count rather than individual keys so the validation stays resilient if we rename questions later.
    if (!answers || Object.keys(answers).length !== 8) {
      return NextResponse.json(
        { error: "All 8 questions must be answered." },
        { status: 400 },
      );
    }

    // -- Step 3: Rate limit check --
    const allowed = await checkRateLimit(ip, fingerprint ?? null);

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "You've already forged your arc today. Come back tomorrow.",
          // We send a retry-friendly message rather than a
          // generic "rate limited" error because this text
          // might actually appear in the UI. It should feel
          // like part of the product, not an error page.
        },
        { status: 429 },
      );
    }

    // -- Step 4: Call Claude --
    const { arc, usage } = await generateArc(answers);

    // console.log("ARC Data:", arc);

    // -- Step 5: Calculate cost before the transaction --
    // We calculate cost here, outside the transaction, because
    // it's pure arithmetic - no DB calls needed. Keeping pure logic outside transactions makes them shorter,
    // which reduces the window where a lock could be held.
    // Current Claude Sonnet pricing: $3/M input, $15/M output.
    // centralised in lib/cost.ts - so a pricing change means editing exactly one file.
    const COST_PER_INPUT_TOKEN = 3 / 1_000_000;
    const COST_PER_OUTPUT_TOKEN = 15 / 1_000_000;
    const costUsd =
      usage.input_tokens * COST_PER_INPUT_TOKEN +
      usage.output_tokens * COST_PER_OUTPUT_TOKEN;

    // -- Step 6: Atomic transaction --
    // This is the critical section. Both writes
    // must succeed together or neither succeeds. If the
    // apiUsageLog write fails after the arc is written.
    // Prisma automatically rolls back the arc insert too.
    // The user gets a 500 error and can try again - no money
    // is silently lost, no arc exists without a cost record.
    // NanoID is generated before the transaction so both
    // writes can reference it without a callback-style
    // interactive transaction (which has a short connection-
    // start timeout that the long Claude call can exhaust).
    const arcId = nanoid(8);
    const shareUrl = `${baseUrl}/arc/${arcId}`;

    const arc_record = await prisma.arc.create({
      data: {
        id: arcId,
        answers: answers,
        arcData: arc as object,
        ipAddress: ip,
        fingerprint: fingerprint ?? null,
        userId: null,
      },
    });

    // Replaced prisma.$transaction to avoid P2028 timeout errors
    // caused by Neon's PgBouncer reclaiming connections during the
    // long OpenAI API call. Two separate writes are safe here because
    // the arc is generated before either write executes — there's no
    // long idle period between acquiring the connection and using it.
    // For MVP this is an acceptable tradeoff over the atomicity guarantee.
    // const arc_record = await prisma.arc.create({
    //   data: {
    //     id: arcId,
    //     answers: answers,
    //     arcData: arc as object,
    //     ipAddress: ip,
    //     fingerprint: fingerprint ?? null,
    //     userId: null,
    //   },
    // });

    // Write cost log separately — if this fails, the arc is still
    // saved and the user experience is unaffected. We just lose
    // the cost tracking row for this generation, which is acceptable.
    await prisma.apiUsageLog
      .create({
        data: {
          arcId: arcId,
          tokensInput: usage.input_tokens,
          tokensOutput: usage.output_tokens,
          costUsd: costUsd,
        },
      })
      .catch((err) => {
        // Log the error but don't let it bubble up and crash the request.
        // The arc is already saved — the user should still get their result.
        console.error(
          "[arc/generate] Cost log write failed - arc was saved successfully:",
          err,
        );
      });

    // -- Step 7: Return the response --
    // We return both the generated arc data AND the arcId.
    // The frontend needs arcId immediately to construct the
    // shareable URL without making a second network request.
    return NextResponse.json(
      {
        arcId: arc_record.id,
        arc: arc,
        shareUrl: shareUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    // -- Global error handler--
    console.error("[arc/generate] Unhandled error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong forgin your arc. Please try again.",
      },
      { status: 500 },
    );
  }
}
