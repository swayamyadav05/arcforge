import type { StoryBibleShape } from "@/types/story-bible";
import type { EpisodeNOutput } from "@/types/episode-n";

const EPISODE_N_EXTRACT_PROMPT = `You are the continuity editor and critic for an ongoing anime arc. You have been given the Story Bible (canonical state), a newly written episode draft, and the user's original reflection. Your job is a single combined pass: extract the state delta that updates the bible, and run a critic pass to flag any canon violations or narrative concerns.

You must call the extract_episode_n tool with BOTH state_delta and critic_output populated.

STATE DELTA — what changed in this episode:

events: An array of narrative events that occurred. Common types: wound_surfaced, wound_deepened, mission_attempted, mission_avoided, complication_emerged, thread_opened, thread_closed, relationship_formed. Each event has a type (snake_case string) and a payload object with relevant details.

complications: Short phrases or sentences — unresolved questions this episode surfaced that should be appended to the protagonist's complications. These are not conclusions. They are things that became less certain, more pressured, or newly visible. Extract them from complications_added in the draft.

threads_opened: Any new narrative threads this episode opens. Assign a kebab-case thread_id, describe the thread, estimate a resolution window (e.g. "Episode 4–6"), and name the stakes.

threads_closed: The thread_ids of any threads from unresolved_threads in the bible that this episode resolves. Only close a thread if the episode genuinely closes it — partial progress does not count.

bible_updates:
  archetype: Only include if the protagonist's fundamental archetype has genuinely shifted — not deepened, but transformed. This is rare. If included, the old archetype is automatically preserved as a historical fact.
  emotional_arc_current: Include if the protagonist's current emotional state has meaningfully shifted from what is in the bible.
  new_established_facts: Include any new canonical facts this episode creates. Each has a fact string and the established_episode number.

CRITIC PASS — flag problems before the next episode:

soft_flags: Concerns that do not block generation but should inform the next episode. Examples: a wound that is evolving unusually fast without complication, a scene that gestures toward significance without grounding it, an archetype drifting without the drift being marked.

hard_flags: Direct contradictions of established facts in the bible (where valid_until is null). A hard flag must cite the specific conflicting_fact from the bible and suggest a resolution. Hard flags block generation of the next episode until addressed. Be conservative — only raise a hard flag when a contradiction is genuine and blocking, not when narrative evolution is plausibly ambiguous.

notes_for_next_episode: One to three sentences of editorial guidance for the next episode. What tension is most alive? What thread is most pressured? What does the writer need to be careful about?`;

export function getEpisodeNExtractPrompt(): string {
  return EPISODE_N_EXTRACT_PROMPT;
}

export interface EpisodeNExtractParams {
  bible: StoryBibleShape;
  draft: EpisodeNOutput;
  reflectionQ1: string;
  reflectionQ2: string | null;
}

export function buildEpisodeNExtractUserMessage(
  params: EpisodeNExtractParams,
): string {
  const { bible, draft, reflectionQ1, reflectionQ2 } = params;

  const q2Section = reflectionQ2
    ? `\n<user_reflection_extra>\n${reflectionQ2}\n</user_reflection_extra>`
    : "";

  return `<story_bible>
${JSON.stringify(bible, null, 2)}
</story_bible>

<episode_draft>
${JSON.stringify(draft, null, 2)}
</episode_draft>

<user_reflection_mission>
${reflectionQ1}
</user_reflection_mission>${q2Section}

Extract the state delta and run the critic pass. Call the extract_episode_n tool.`;
}
