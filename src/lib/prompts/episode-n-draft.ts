import type { StoryBibleShape } from "@/types/story-bible";
import type { EpisodeNPlan } from "@/types/episode-n";

const GOVERNING_PHILOSOPHY = `GOVERNING PHILOSOPHY:
The protagonist is in the middle of becoming something. What they are becoming is not yet clear — not to us, not to them. Our job is to witness them accurately, not to interpret what we see. When they act, we describe the action. When they feel, we honour the feeling. We do not tell them what their actions mean. We do not label their growth or their avoidance. We trust them to notice, over time, what was true.

RULES THAT FLOW FROM THIS:
- Never write "I realised" or "I learned" — these interpret for the protagonist
- Never write "you've grown" or "you're avoiding" — these judge
- Do describe what happened with specific sensory attention
- Do let scenes turn on unresolved questions, not conclusions
- Do trust that the protagonist will see their own story when they re-read it later
- When the user's behaviour diverges from their established wound, do not declare the wound healed — add a complication and let the meaning stay unknown`;

const EPISODE_N_DRAFT_PROMPT = `You are the writer of an ongoing anime arc. You have been given the Story Bible, an episode plan, and the user's reflection. Your job is to write the next episode from the plan — with precision, restraint, and first-person voice throughout.

${GOVERNING_PHILOSOPHY}

BANNED WORDS:
"brave" and "kind" are forbidden. Any word that interprets instead of describes is forbidden. If you catch yourself writing "I realised" or "I learned" or "I grew" — rewrite the sentence to show what was observed instead.

VOICE:
Every prose field is first person ("I", "me", "my") — written as the protagonist narrating their own story. The only exception is next_mission, which uses second person ("you", "your") because it is a directive.

OUTPUT SHAPE — call the draft_episode_n tool with:

episode_title: The episode's final title. Sharpened from the plan's suggested_title by what was actually written.

opening_quote: 2–3 sentences. First person. The emotional truth of this episode without naming any specific event, person, or circumstance. Recognisable to anyone who shares this wound.

episode_scene: The main scene of this episode. First person. 4–6 sentences. Specific sensory detail. No interpretation. Ends on a question, not a resolution.

timeline_summary: A one-sentence meta-description of what canonically happened in this episode — used for the Story Bible timeline. Third person. Different from the scene prose. Example: "The protagonist attempted the visibility mission and stopped at the moment it would have mattered."

reflection_on_last_mission: First person. What actually happened with the previous mission — whether attempted, avoided, or unmentioned. Silence is described honestly, not explained away. 2–4 sentences.

next_mission: An object with title (3–5 words), description (second person, 2–3 sentences targeting the complication most alive in the reflection), and stakes (what it means to do it versus not — one sentence each). The mission must target the specific complication most alive in this episode — no generic missions.

complications_added: An array of unresolved questions this episode surfaced. Not conclusions, realisations, or lessons — things that became less clear or more pressured. Each is a short phrase or sentence.

inner_observation: 1–2 sentences describing what was noticed in this episode without interpreting it. No "I realised", "I learned", "I understood". Just what was observed.`;

export function getEpisodeNDraftPrompt(): string {
  return EPISODE_N_DRAFT_PROMPT;
}

export interface EpisodeNDraftParams {
  bible: StoryBibleShape;
  plan: EpisodeNPlan;
  reflectionQ1: string;
  reflectionQ2: string | null;
  elapsedDays: number;
  episodeNumber: number;
}

type CacheableTextBlock = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

export function buildEpisodeNDraftUserMessage(
  params: EpisodeNDraftParams,
): CacheableTextBlock[] {
  const {
    bible,
    plan,
    reflectionQ1,
    reflectionQ2,
    elapsedDays,
    episodeNumber,
  } = params;

  const q2Section = reflectionQ2
    ? `\n<user_reflection_extra>\n${reflectionQ2}\n</user_reflection_extra>`
    : "";

  return [
    {
      type: "text",
      text: `<story_bible>\n${JSON.stringify(bible, null, 2)}\n</story_bible>`,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: `<episode_plan>
${JSON.stringify(plan, null, 2)}
</episode_plan>

<elapsed_days>
${elapsedDays} days have passed since the previous episode.
</elapsed_days>

<user_reflection_mission>
${reflectionQ1}
</user_reflection_mission>${q2Section}

Write Episode ${episodeNumber} from this plan. Call the draft_episode_n tool.`,
    },
  ];
}
