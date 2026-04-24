import type { StoryBibleShape } from "@/types/story-bible";
import type { StateDelta } from "@/types/episode-n";

/**
 * Pure function — returns a new bible with the delta applied.
 * Never mutates the input bible.
 *
 * @param episodeSummary One-sentence canonical summary for the timeline entry (from draft.timeline_summary).
 */
export function applyStateDelta(
  bible: StoryBibleShape,
  delta: StateDelta,
  episodeNumber: number,
  episodeSummary: string,
): StoryBibleShape {
  const next: StoryBibleShape = JSON.parse(JSON.stringify(bible));

  // ── Timeline ──────────────────────────────────────────────────────
  next.timeline.push({
    episode: episodeNumber,
    summary: episodeSummary,
    occurred_at: `Episode ${episodeNumber}`,
  });

  // ── Complications ─────────────────────────────────────────────────
  if (delta.complications.length > 0) {
    next.characters.protagonist.complications = [
      ...(next.characters.protagonist.complications ?? []),
      ...delta.complications,
    ];
  }

  // ── Threads opened ────────────────────────────────────────────────
  for (const thread of delta.threads_opened) {
    next.unresolved_threads.push({
      thread_id: thread.thread_id,
      description: thread.description,
      opened_episode: episodeNumber,
      expected_resolution_window: thread.expected_resolution_window,
      stakes: thread.stakes,
    });
  }

  // ── Threads closed ────────────────────────────────────────────────
  for (const threadId of delta.threads_closed) {
    const idx = next.unresolved_threads.findIndex(
      (t) => t.thread_id === threadId,
    );
    if (idx !== -1) {
      const [closed] = next.unresolved_threads.splice(idx, 1);
      next.resolved_threads = [...(next.resolved_threads ?? []), closed];
    }
  }

  // ── Archetype evolution ───────────────────────────────────────────
  if (delta.bible_updates.archetype) {
    const oldArchetype = next.characters.protagonist.archetype;
    next.established_facts.push({
      fact: `Protagonist's archetype was "${oldArchetype}"`,
      established_episode: 1,
      last_changed_episode: episodeNumber,
      valid_until: episodeNumber - 1,
    });
    next.characters.protagonist.archetype = delta.bible_updates.archetype;
  }

  // ── Emotional arc current ─────────────────────────────────────────
  if (delta.bible_updates.emotional_arc_current) {
    next.emotional_arc.current = delta.bible_updates.emotional_arc_current;
  }

  // ── New established facts ─────────────────────────────────────────
  if (delta.bible_updates.new_established_facts) {
    for (const { fact, established_episode } of delta.bible_updates
      .new_established_facts) {
      next.established_facts.push({
        fact,
        established_episode,
        last_changed_episode: episodeNumber,
        valid_until: null,
      });
    }
  }

  return next;
}
