import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import type { EpisodeNOutput } from "@/types/episode-n";

export const episodeNDraftTool: Tool = {
  name: "draft_episode_n",
  description:
    "Write the full Episode N draft from the plan. All prose fields are first person except next_mission which is second person. No interpretation — describe what is observed, not what it means.",
  input_schema: {
    type: "object" as const,
    required: [
      "episode_title",
      "opening_quote",
      "episode_scene",
      "timeline_summary",
      "reflection_on_last_mission",
      "next_mission",
      "complications_added",
      "inner_observation",
    ],
    properties: {
      episode_title: {
        type: "string",
        description:
          "The episode's final title. Sharpened from the plan's suggested_title by what was actually written.",
      },
      opening_quote: {
        type: "string",
        description:
          "2–3 sentences. First person. The emotional truth of this episode without naming any specific event, person, or circumstance. Recognisable to anyone who shares this wound.",
      },
      episode_scene: {
        type: "string",
        description:
          "The main scene of this episode. First person. 4–6 sentences. Specific sensory detail. No interpretation. Ends on a question, not a resolution.",
      },
      timeline_summary: {
        type: "string",
        description:
          "A one-sentence meta-description of what canonically happened in this episode — used for the Story Bible timeline. Third person. Different from the scene prose.",
      },
      reflection_on_last_mission: {
        type: "string",
        description:
          "First person. What actually happened with the previous mission — whether attempted, avoided, or unmentioned. Silence is described honestly, not explained away. 2–4 sentences.",
      },
      next_mission: {
        type: "object",
        required: ["title", "description", "stakes"],
        properties: {
          title: {
            type: "string",
            description: "Short dramatic name. 3–5 words.",
          },
          description: {
            type: "string",
            description:
              "Second person. Targets the complication most alive in the reflection. 2–3 sentences. Specific to this person's wound — no generic missions.",
          },
          stakes: {
            type: "string",
            description:
              "What it means to do it versus not. One sentence each.",
          },
        },
      },
      complications_added: {
        type: "array",
        items: { type: "string" },
        description:
          "Unresolved questions this episode surfaced. Not conclusions, realisations, or lessons — things that became less clear or more pressured.",
      },
      inner_observation: {
        type: "string",
        description:
          "1–2 sentences describing what was noticed in this episode without interpreting it. No 'I realised', 'I learned', 'I understood'. Just what was observed.",
      },
    },
  },
};

export type EpisodeNDraftToolInput = EpisodeNOutput;
