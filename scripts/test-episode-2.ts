/**
 * Manual test for Episode 2+ generation.
 * Calls generateEpisodeN directly — no running server or auth session needed.
 *
 * Usage:
 *   npx tsx scripts/test-episode-2.ts
 *
 * Requires ANTHROPIC_API_KEY and DATABASE_URL in .env.
 * Restores all DB state after running (lastEpisodeAt is reset, reflection is cleaned up).
 */

import { config as loadDotenv } from "dotenv";
import type { StoryBibleShape } from "@/types/story-bible";

if (!process.env.DATABASE_URL) {
  loadDotenv({ path: ".env.local" });
  loadDotenv({ path: ".env" });
}

const TEST_Q1 =
  "I attempted the mission halfway. I got to the point where it would have mattered and I stopped. I told myself I'd come back to it. I didn't.";
const TEST_Q2 =
  "I noticed I was relieved when it fell through. That's the part I haven't figured out yet.";

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

async function main() {
  const { default: prisma } = await import("@/lib/prisma");
  const { generateEpisodeN } = await import("@/lib/claude");
  const { applyStateDelta } = await import("@/lib/bible/apply-delta");

  // ── Find an eligible series with a valid bible ─────────────────────
  const candidates = await prisma.arcSeries.findMany({
    where: {
      currentEpisode: 1,
      storyBible: { isNot: null },
    },
    include: {
      storyBible: true,
      episodes: {
        where: { episodeNumber: 1 },
        select: { id: true, episodeTitle: true },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  let series: (typeof candidates)[number] | null = null;
  let bible: StoryBibleShape | null = null;

  for (const candidate of candidates) {
    const parsed = parseBible(candidate.storyBible?.bible);
    if (parsed) {
      series = candidate;
      bible = parsed;
      break;
    }
    console.warn(
      `  Skipping series ${candidate.id} — bible is missing or malformed (backfill artefact).`,
    );
  }

  if (!series || !bible) {
    console.error(
      "\n❌ No eligible series found with a valid Story Bible.",
    );
    console.error(
      "   Generate a fresh Episode 1 arc through the app to create a properly structured bible.",
    );
    process.exit(1);
  }

  console.log(`\nUsing series: ${series.id}`);
  console.log(`Current episode: ${series.currentEpisode}`);
  console.log(
    `Episode 1 title: ${series.episodes[0]?.episodeTitle ?? "The Awakening"}`,
  );
  console.log(
    `Protagonist: ${bible.characters.protagonist.name} (${bible.characters.protagonist.archetype})`,
  );
  console.log(`Bible version: ${series.storyBible!.version}`);

  // ── Upsert test Reflection ─────────────────────────────────────────
  await prisma.reflection.upsert({
    where: { seriesId: series.id },
    create: {
      seriesId: series.id,
      answers: { q1: TEST_Q1, q2: TEST_Q2 },
    },
    update: {
      answers: { q1: TEST_Q1, q2: TEST_Q2 },
    },
  });
  console.log("\nTest Reflection upserted.");

  // ── Backdate lastEpisodeAt to 8 days ago ───────────────────────────
  const originalLastEpisodeAt = series.lastEpisodeAt;
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

  await prisma.arcSeries.update({
    where: { id: series.id },
    data: { lastEpisodeAt: eightDaysAgo },
  });
  console.log(`lastEpisodeAt backdated to: ${eightDaysAgo.toISOString()}`);

  // ── Pull previous episode data ─────────────────────────────────────
  const latestTimeline = [...bible.timeline].sort(
    (a, b) => b.episode - a.episode,
  )[0];

  const previousEpisode = {
    episodeNumber: series.currentEpisode,
    title: series.episodes[0]?.episodeTitle ?? "The Awakening",
    summary: latestTimeline?.summary ?? "",
  };

  try {
    console.log(
      "\n── Calling generateEpisodeN (3 Claude calls) ──────────────\n",
    );

    const result = await generateEpisodeN({
      bible,
      previousEpisode,
      reflectionQ1: TEST_Q1,
      reflectionQ2: TEST_Q2,
      elapsedDays: 8,
      episodeNumber: series.currentEpisode + 1,
    });

    console.log("\n══ PLAN ══════════════════════════════════════════════");
    console.log(JSON.stringify(result.plan, null, 2));

    console.log("\n══ DRAFT ═════════════════════════════════════════════");
    console.log(JSON.stringify(result.draft, null, 2));

    console.log("\n══ STATE DELTA ═══════════════════════════════════════");
    console.log(JSON.stringify(result.stateDelta, null, 2));

    console.log("\n══ CRITIC OUTPUT ═════════════════════════════════════");
    console.log(JSON.stringify(result.criticOutput, null, 2));

    console.log("\n══ USAGE ═════════════════════════════════════════════");
    console.log(JSON.stringify(result.usage, null, 2));

    // ── Verify reducer ─────────────────────────────────────────────
    const updatedBible = applyStateDelta(
      bible,
      result.stateDelta,
      series.currentEpisode + 1,
      result.draft.timeline_summary,
    );

    console.log("\n── Reducer output ──────────────────────────────────");
    console.log(`Timeline entries:   ${updatedBible.timeline.length}`);
    console.log(
      `Unresolved threads: ${updatedBible.unresolved_threads.length}`,
    );
    console.log(
      `Resolved threads:   ${updatedBible.resolved_threads?.length ?? 0}`,
    );
    console.log(
      `Complications:      ${updatedBible.characters.protagonist.complications?.length ?? 0}`,
    );
    console.log(
      `Latest timeline:    "${updatedBible.timeline.at(-1)?.summary}"`,
    );

    if (result.criticOutput.hard_flags.length > 0) {
      console.warn(
        `\n⚠  Hard flags (${result.criticOutput.hard_flags.length}):`,
      );
      result.criticOutput.hard_flags.forEach((f) =>
        console.warn(`   - ${f.issue}`),
      );
    } else {
      console.log("\n✓ No hard flags — clean generation.");
    }
  } finally {
    // ── Restore state ──────────────────────────────────────────────
    await prisma.arcSeries.update({
      where: { id: series.id },
      data: { lastEpisodeAt: originalLastEpisodeAt },
    });

    await prisma.reflection
      .delete({ where: { seriesId: series.id } })
      .catch(() => {
        // already deleted or never existed — acceptable
      });

    console.log(`\nlastEpisodeAt restored. Reflection cleaned up.\n`);
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
