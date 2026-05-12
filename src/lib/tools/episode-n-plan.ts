import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import type { EpisodeNPlan } from "@/types/episode-n";

export const episodeNPlanTool: Tool = {
  name: "plan_episode_n",
  description:
    "Plan the architecture of Episode N in a continuing anime arc. Called by the Planner with the episode structure — title, beats, themes, callbacks, and central tension. Do not write prose here; this is the structural scaffold the Writer will use.",
  input_schema: {
    type: "object" as const,
    required: [
      "suggested_title",
      "beats",
      "themes_to_honour",
      "callbacks",
      "central_tension",
    ],
    properties: {
      suggested_title: {
        type: "string",
        description:
          "A working episode title. Evocative, not explanatory. Names what is happening, not what it means.",
      },
      beats: {
        type: "array",
        items: { type: "string" },
        description:
          "6–10 narrative beats in sequence. Each beat is one sentence stating what happens. Structural markers, not prose.",
        minItems: 6,
        maxItems: 10,
      },
      themes_to_honour: {
        type: "array",
        items: { type: "string" },
        description:
          "2–4 themes drawn from the bible's motifs, emotional arc, or established facts that this episode should amplify or complicate.",
        minItems: 2,
        maxItems: 4,
      },
      callbacks: {
        type: "array",
        items: {
          type: "object",
          required: ["episode_number", "reference"],
          properties: {
            episode_number: {
              type: "integer",
              description: "The episode number being referenced.",
            },
            reference: {
              type: "string",
              description:
                "What from that episode is being called back and how it serves this episode's tension.",
            },
          },
        },
        description:
          "References to specific previous episodes. Only include callbacks that genuinely serve this episode — not for completeness.",
      },
      central_tension: {
        type: "string",
        description:
          "One sentence. The core question this episode surfaces but does not answer.",
      },
    },
  },
};

export type EpisodeNPlanToolInput = EpisodeNPlan;
