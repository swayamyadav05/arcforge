import { auth } from "@/lib/auth";
import { generateEpisodeN } from "@/lib/claude";
import { applyStateDelta } from "@/lib/bible/apply-delta";
import posthog from "@/lib/posthog";
import prisma from "@/lib/prisma";
import { estimateTokenCount } from "@/lib/tokens";
import type { StoryBibleShape } from "@/types/story-bible";
import type { CriticOutput } from "@/types/episode-n";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Handles bibles stored as a JSON string (backfill artefact) or as a proper object. */
function parseBible(raw: unknown): StoryBibleShape | null {
  if (raw === null || raw === undefined) return null;
  let obj: unknown = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const b = obj as Record<string, unknown>;
  if (!b.characters || !(b.characters as Record<string, unknown>).protagonist) {
    return null;
  }
  return b as unknown as StoryBibleShape;
}

type GenerateNextErrorCode =
  | "UNAUTHORIZED"
  | "SERIES_NOT_FOUND"
  | "WINDOW_NOT_OPEN"
  | "REFLECTION_REQUIRED"
  | "BIBLE_MISSING"
  | "HARD_FLAG_UNRESOLVED"
  | "GENERATION_FAILED";

// Pricing per token (Sonnet 4.6: $3/$15 per MTok, Haiku 4.5: $1/$5 per MTok)
const SONNET_INPUT_COST = 3 / 1_000_000;
const SONNET_OUTPUT_COST = 15 / 1_000_000;
const HAIKU_INPUT_COST = 1 / 1_000_000;
const HAIKU_OUTPUT_COST = 5 / 1_000_000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  try {
    const { seriesId } = await params;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    // ── 1. Auth check ──────────────────────────────────────────────
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED" as GenerateNextErrorCode,
          error: "Sign in required.",
        },
        { status: 401 },
      );
    }

    // ── 2. Load series + verify ownership ─────────────────────────
    const series = await prisma.arcSeries.findUnique({
      where: { id: seriesId },
    });

    if (!series || series.userId !== session.user.id) {
      return NextResponse.json(
        {
          code: "SERIES_NOT_FOUND" as GenerateNextErrorCode,
          error: "Series not found.",
        },
        { status: 404 },
      );
    }

    // ── 3. Check 7-day window ──────────────────────────────────────
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSincePrev = Math.floor(
      (now.getTime() - series.lastEpisodeAt.getTime()) / msPerDay,
    );

    if (daysSincePrev < 7) {
      return NextResponse.json(
        {
          code: "WINDOW_NOT_OPEN" as GenerateNextErrorCode,
          error: "The 7-day window has not passed yet.",
          daysRemaining: 7 - daysSincePrev,
        },
        { status: 403 },
      );
    }

    // ── 4. Load reflection ─────────────────────────────────────────
    const reflection = await prisma.reflection.findUnique({
      where: { seriesId },
    });

    if (!reflection) {
      return NextResponse.json(
        {
          code: "REFLECTION_REQUIRED" as GenerateNextErrorCode,
          error: "A reflection is required before generating the next episode.",
        },
        { status: 400 },
      );
    }

    const reflectionAnswers = reflection.answers as {
      q1?: string;
      q2?: string;
    };
    const reflectionQ1 = reflectionAnswers.q1;
    if (!reflectionQ1) {
      return NextResponse.json(
        {
          code: "REFLECTION_REQUIRED" as GenerateNextErrorCode,
          error: "Reflection must include a Q1 answer.",
        },
        { status: 400 },
      );
    }
    const reflectionQ2 = reflectionAnswers.q2 ?? null;

    // ── 5. Load bible ──────────────────────────────────────────────
    const storyBible = await prisma.storyBible.findUnique({
      where: { seriesId },
    });

    if (!storyBible) {
      return NextResponse.json(
        {
          code: "BIBLE_MISSING" as GenerateNextErrorCode,
          error: "Story Bible not found for this series.",
        },
        { status: 500 },
      );
    }

    const bible = parseBible(storyBible.bible);
    if (!bible) {
      return NextResponse.json(
        {
          code: "BIBLE_MISSING" as GenerateNextErrorCode,
          error:
            "Story Bible for this series is malformed and cannot be used for generation.",
        },
        { status: 500 },
      );
    }

    // ── 6. Load previous episode summary from timeline ─────────────
    const latestTimelineEntry = [...bible.timeline].sort(
      (a, b) => b.episode - a.episode,
    )[0];

    const previousArc = await prisma.arc.findFirst({
      where: { seriesId, episodeNumber: series.currentEpisode },
      select: { episodeTitle: true },
    });

    const previousEpisode = {
      episodeNumber: series.currentEpisode,
      title: previousArc?.episodeTitle ?? "The Awakening",
      summary: latestTimelineEntry?.summary ?? "",
    };

    // ── 7. Check for blocking hard flags from previous generation ──
    const existingCriticNotes = series.criticNotes as CriticOutput | null;
    if (
      existingCriticNotes?.hard_flags &&
      existingCriticNotes.hard_flags.length > 0
    ) {
      return NextResponse.json(
        {
          code: "HARD_FLAG_UNRESOLVED" as GenerateNextErrorCode,
          error:
            "The previous episode has unresolved canon conflicts that must be clarified before continuing.",
          hard_flags: existingCriticNotes.hard_flags,
        },
        { status: 409 },
      );
    }

    // ── 8. Call generateEpisodeN ───────────────────────────────────
    const newEpisodeNumber = series.currentEpisode + 1;

    const { plan, draft, stateDelta, criticOutput, usage } =
      await generateEpisodeN({
        bible,
        previousEpisode,
        reflectionQ1,
        reflectionQ2,
        elapsedDays: daysSincePrev,
        episodeNumber: newEpisodeNumber,
      });

    // ── 9. Apply state delta ───────────────────────────────────────
    const updatedBible = applyStateDelta(
      bible,
      stateDelta,
      newEpisodeNumber,
      draft.timeline_summary,
    );

    // ── 10. Compute costs before transaction ───────────────────────
    const arcId = nanoid(8);

    const planCost =
      usage.plan.input * SONNET_INPUT_COST +
      usage.plan.output * SONNET_OUTPUT_COST;
    const draftCost =
      usage.draft.input * SONNET_INPUT_COST +
      usage.draft.output * SONNET_OUTPUT_COST;
    const extractCost =
      usage.extract.input * HAIKU_INPUT_COST +
      usage.extract.output * HAIKU_OUTPUT_COST;

    // ── 11. Four-write transaction ─────────────────────────────────
    await prisma.$transaction(async (tx) => {
      await tx.arc.create({
        data: {
          id: arcId,
          seriesId,
          episodeNumber: newEpisodeNumber,
          episodeTitle: draft.episode_title,
          daysSincePrev,
          answers: { q1: reflectionQ1, q2: reflectionQ2 } as object,
          arcData: { ...draft, _plan: plan } as object,
          ipAddress: ip,
          fingerprint: null,
          userId: session.user.id,
        },
      });

      await tx.storyBible.update({
        where: { seriesId },
        data: {
          bible: updatedBible as object,
          tokenCount: estimateTokenCount(updatedBible),
          version: { increment: 1 },
        },
      });

      await tx.arcSeries.update({
        where: { id: seriesId },
        data: {
          currentEpisode: { increment: 1 },
          lastEpisodeAt: now,
          criticNotes: criticOutput as object,
        },
      });

      for (const event of stateDelta.events) {
        await tx.storyEvent.create({
          data: {
            seriesId,
            episodeNumber: newEpisodeNumber,
            eventType: event.type,
            payload: event.payload as object,
          },
        });
      }
    });

    // ── 12. Delete reflection (best-effort, outside transaction) ───
    await prisma.reflection
      .delete({ where: { seriesId } })
      .catch((err) => {
        console.error(
          "[generate-next] Reflection delete failed — arc saved successfully:",
          err,
        );
      });

    // ── 13. Log API usage for all three calls ──────────────────────
    await prisma.apiUsageLog
      .createMany({
        data: [
          {
            arcId,
            tokensInput: usage.plan.input,
            tokensOutput: usage.plan.output,
            costUsd: planCost,
          },
          {
            arcId,
            tokensInput: usage.draft.input,
            tokensOutput: usage.draft.output,
            costUsd: draftCost,
          },
          {
            arcId,
            tokensInput: usage.extract.input,
            tokensOutput: usage.extract.output,
            costUsd: extractCost,
          },
        ],
      })
      .catch((err) => {
        console.error(
          "[generate-next] Usage log write failed — arc saved successfully:",
          err,
        );
      });

    // ── 14. PostHog ────────────────────────────────────────────────
    posthog.capture({
      distinctId: session.user.id,
      event: "episode_n_generated",
      properties: {
        arcId,
        episodeNumber: newEpisodeNumber,
        seriesId,
        elapsedDays: daysSincePrev,
        softFlags: criticOutput.soft_flags.length,
        hardFlags: criticOutput.hard_flags.length,
        totalCostUsd: planCost + draftCost + extractCost,
      },
    });

    // ── 15. Return ─────────────────────────────────────────────────
    return NextResponse.json(
      { arcId, episodeNumber: newEpisodeNumber, arc: draft },
      { status: 201 },
    );
  } catch (error) {
    console.error("[generate-next] Unhandled error:", error);

    return NextResponse.json(
      {
        code: "GENERATION_FAILED" as GenerateNextErrorCode,
        error:
          "Something went wrong while generating the next episode. Please try again.",
      },
      { status: 500 },
    );
  }
}
