// scripts/backfill-arc-series.ts
// One-time backfill script for Sprint 2 migration.
// Converts existing legacy arcs (from Phase 1) into the new
// ArcSeries structure. Each legacy arc becomes Episode 1 of
// its own series with an extracted initial Story Bible.
//
// SAFE TO RUN MULTIPLE TIMES — the script only processes arcs
// that don't already have a seriesId. Re-running after a
// successful run does nothing.
//
// USAGE:
//   npx tsx scripts/backfill-arc-series.ts
//
// WHAT IT DOES (per legacy arc):
//   1. Creates a new ArcSeries owned by the arc's userId
//   2. Creates an initial StoryBible extracted from the arc
//   3. Creates a StoryEvent marking Episode 1 as canon
//   4. Updates the arc with seriesId and episodeNumber = 1

import { config as loadDotenv } from "dotenv";
import type { GeneratedArc } from "@/types/arc";

// This script runs outside the Next.js runtime, so load env files manually.
// Load .env.local first so local overrides are preserved, then fallback to .env.
if (!process.env.DATABASE_URL) {
  loadDotenv({ path: ".env.local" });
  loadDotenv({ path: ".env" });
}

// The shape of the initial Story Bible extracted from Episode 1.
// This is the minimum viable bible structure — the full schema
// from the research report evolves in later episodes.
function buildInitialBible(
  arc: GeneratedArc,
  episodeOneTimestamp: Date,
) {
  return {
    world: {
      genre: "anime identity narrative",
      tone: "cinematic, specific, emotionally honest",
      hard_rules: [
        "The protagonist is based on a real person's reflections",
        "Never contradict established emotional truths",
        "Growth must be earned through the narrative, never assumed",
      ],
    },
    characters: {
      protagonist: {
        name: arc.character_name,
        archetype: arc.archetype,
        description: arc.character_arc?.the_wound ?? null,
        voice: "first-person, introspective, cinematic",
        status: "active",
        wounds: [
          {
            description: arc.character_arc?.the_wound ?? null,
            acquired_episode: 1,
            healed_episode: null,
          },
        ].filter((w) => w.description !== null),
        possessions: [],
        knowledge_state: [],
      },
    },
    relationships: [],
    unresolved_threads: arc.episode_one_mission
      ? [
          {
            thread_id: "episode_1_mission",
            description:
              arc.episode_one_mission.description ??
              "Episode 1 mission",
            opened_episode: 1,
            expected_resolution_window: "episode_2",
            stakes: arc.episode_one_mission.stakes ?? null,
          },
        ]
      : [],
    timeline: [
      {
        episode: 1,
        summary:
          arc.opening_episode_quote ?? "Episode 1 — The Awakening",
        occurred_at: episodeOneTimestamp.toISOString(),
      },
    ],
    motifs: [],
    emotional_arc: {
      start: arc.character_arc?.the_wound ?? null,
      current: arc.character_arc?.the_wound ?? null,
      target: arc.character_arc?.the_destiny ?? null,
    },
    established_facts: [
      {
        fact: `Character name is ${arc.character_name}`,
        established_episode: 1,
        last_changed_episode: 1,
        valid_until: null,
      },
      {
        fact: `Archetype is ${arc.archetype}`,
        established_episode: 1,
        last_changed_episode: 1,
        valid_until: null,
      },
    ],
    style_guide: {
      voice: "first-person, present-tense where possible",
      pacing: "slow, specific, cinematic",
      forbidden_words: ["brave", "kind"],
    },
  };
}

async function main() {
  const { default: prisma } = await import("@/lib/prisma");

  console.log("Starting Sprint 2 backfill...\n");

  // Find all arcs that haven't been backfilled yet.
  // The seriesId IS NULL check makes this script safely re-runnable.
  // Only arcs with a userId can be backfilled — anonymous arcs
  // from the pre-auth Phase 1 era can't be assigned to a series
  // because series require an owner.
  const legacyArcs = await prisma.arc.findMany({
    where: {
      seriesId: null,
      userId: { not: null },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${legacyArcs.length} legacy arcs to backfill.`);
  console.log(
    `(Skipping arcs with no userId — these remain as anonymous legacy records.)\n`,
  );

  if (legacyArcs.length === 0) {
    console.log("Nothing to backfill. Exiting.");
    return;
  }

  let successCount = 0;
  let skipCount = 0;

  for (const arc of legacyArcs) {
    try {
      // Defensive: arc should have userId since we filtered above,
      // but TypeScript needs the narrow.
      if (!arc.userId) {
        console.warn(`⚠ Skipping arc ${arc.id} — no userId`);
        skipCount++;
        continue;
      }

      const arcData = arc.arcData as unknown as GeneratedArc;

      // Wrap the whole backfill in a transaction so that if any
      // step fails, the arc remains untouched and the script can
      // be re-run safely.
      await prisma.$transaction(async (tx) => {
        // Step 1 — Create the series
        const series = await tx.arcSeries.create({
          data: {
            userId: arc.userId!,
            currentEpisode: 1,
            lastEpisodeAt: arc.createdAt,
            status: "active",
          },
        });

        // Step 2 — Extract and create the initial bible
        const bible = buildInitialBible(arcData, arc.createdAt);
        await tx.storyBible.create({
          data: {
            seriesId: series.id,
            bible: bible,
            tokenCount: JSON.stringify(bible).length / 4, // rough estimate
            version: 1,
          },
        });

        // Step 3 — Create the Episode 1 canon event
        await tx.storyEvent.create({
          data: {
            seriesId: series.id,
            episodeNumber: 1,
            eventType: "episode_canonized",
            payload: {
              character_name: arcData.character_name,
              archetype: arcData.archetype,
              wound: arcData.character_arc?.the_wound ?? null,
              weapon: arcData.character_arc?.the_weapon ?? null,
              backfilled: true,
              backfilled_at: new Date().toISOString(),
            },
          },
        });

        // Step 4 — Link the arc to the new series
        await tx.arc.update({
          where: { id: arc.id },
          data: {
            seriesId: series.id,
            episodeNumber: 1,
            daysSincePrev: null, // Episode 1 has no previous
          },
        });
      });

      console.log(
        `✓ Backfilled arc ${arc.id} → series for ${arcData.character_name}`,
      );
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to backfill arc ${arc.id}:`, error);
      skipCount++;
    }
  }

  console.log("\n===== Backfill complete =====");
  console.log(`Success: ${successCount}`);
  console.log(`Skipped / Failed: ${skipCount}`);
  console.log(`Total processed: ${legacyArcs.length}`);

  // Report anonymous arcs that can't be backfilled
  const anonymousCount = await prisma.arc.count({
    where: {
      seriesId: null,
      userId: null,
    },
  });

  if (anonymousCount > 0) {
    console.log(
      `\nNote: ${anonymousCount} anonymous arcs remain without a series.`,
    );
    console.log(
      "These are pre-auth legacy records and will continue to work as read-only artifacts.",
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Backfill script crashed:", error);
    process.exit(1);
  });
