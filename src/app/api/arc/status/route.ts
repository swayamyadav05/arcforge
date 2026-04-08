import {
  OWNER_SESSION_COOKIE,
  readOwnerArcIds,
} from "@/lib/ownerSession";
import prisma from "@/lib/prisma";
import { getRateLimitStatus } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

type ArcStatusCode =
  | "CAN_FORGE"
  | "DAILY_LIMIT_REACHED"
  | "STATUS_UNAVAILABLE";

export const runtime = "nodejs";

function extractIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

function parseFingerprint(rawValue: unknown): string | null {
  if (typeof rawValue !== "string") {
    return null;
  }

  const fingerprint = rawValue.trim();

  return fingerprint.length > 0 ? fingerprint : null;
}

export async function POST(req: NextRequest) {
  try {
    const ip = extractIp(req);
    const requestBody =
      ((await req.json().catch(() => ({}))) as {
        fingerprint?: unknown;
      }) ?? {};

    const fingerprint = parseFingerprint(requestBody.fingerprint);
    const status = await getRateLimitStatus(ip, fingerprint);

    const ownerArcIds = readOwnerArcIds(
      req.cookies.get(OWNER_SESSION_COOKIE)?.value,
    );

    let latestArcId: string | null = ownerArcIds[0] ?? null;

    // Cookie-based owner identity is preferred. We only fall back
    // to fingerprint lookup when there is no local owner cookie.
    if (!latestArcId && fingerprint) {
      const latestArc = await prisma.arc.findFirst({
        where: { fingerprint },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      latestArcId = latestArc?.id ?? null;
    }

    if (status.canForge) {
      return NextResponse.json({
        code: "CAN_FORGE" as ArcStatusCode,
        canForge: true,
        latestArcId,
        retryAfterSeconds: 0,
        windowResetAt: null,
      });
    }

    return NextResponse.json({
      code: "DAILY_LIMIT_REACHED" as ArcStatusCode,
      canForge: false,
      error: "Arc creation is limited to once per day.",
      latestArcId,
      retryAfterSeconds: status.retryAfterSeconds,
      windowResetAt: status.windowResetAt,
    });
  } catch (error) {
    console.error("[api/arc/status] Error:", error);

    return NextResponse.json(
      {
        code: "STATUS_UNAVAILABLE" as ArcStatusCode,
        canForge: true,
        error: "Unable to verify your forge status right now.",
      },
      { status: 500 },
    );
  }
}
