import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import type { StateDelta, CriticOutput } from "@/types/episode-n";

export const episodeNExtractTool: Tool = {
  name: "extract_episode_n",
  description:
    "Extract the state delta that updates the Story Bible AND run the critic pass in one call. Both state_delta and critic_output are required top-level fields.",
  input_schema: {
    type: "object" as const,
    required: ["state_delta", "critic_output"],
    properties: {
      state_delta: {
        type: "object",
        required: [
          "events",
          "complications",
          "threads_opened",
          "threads_closed",
          "bible_updates",
        ],
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              required: ["type", "payload"],
              properties: {
                type: {
                  type: "string",
                  description:
                    "Snake_case event type. Examples: wound_surfaced, mission_attempted, mission_avoided, complication_emerged, thread_opened, thread_closed.",
                },
                payload: {
                  type: "object",
                  description: "Event-specific detail as key-value pairs.",
                },
              },
            },
            description: "Narrative events that occurred in this episode.",
          },
          complications: {
            type: "array",
            items: { type: "string" },
            description:
              "Unresolved questions surfaced — extracted from complications_added in the draft. Short phrases, not conclusions.",
          },
          threads_opened: {
            type: "array",
            items: {
              type: "object",
              required: [
                "thread_id",
                "description",
                "expected_resolution_window",
                "stakes",
              ],
              properties: {
                thread_id: {
                  type: "string",
                  description: "Unique kebab-case identifier.",
                },
                description: { type: "string" },
                expected_resolution_window: {
                  type: "string",
                  description: "Rough horizon, e.g. 'Episode 4–6'.",
                },
                stakes: { type: "string" },
              },
            },
            description: "New narrative threads this episode opens.",
          },
          threads_closed: {
            type: "array",
            items: { type: "string" },
            description:
              "thread_ids of threads from unresolved_threads that this episode genuinely resolves. Partial progress does not count.",
          },
          bible_updates: {
            type: "object",
            description:
              "Structural updates to the bible. All fields are optional — only include what genuinely changed.",
            properties: {
              archetype: {
                type: "string",
                description:
                  "New archetype if the protagonist's fundamental role has transformed (not just deepened). Rare.",
              },
              emotional_arc_current: {
                type: "string",
                description:
                  "Updated current emotional state if it has meaningfully shifted from the bible.",
              },
              new_established_facts: {
                type: "array",
                items: {
                  type: "object",
                  required: ["fact", "established_episode"],
                  properties: {
                    fact: { type: "string" },
                    established_episode: { type: "integer" },
                  },
                },
                description: "New canonical facts this episode creates.",
              },
            },
          },
        },
      },
      critic_output: {
        type: "object",
        required: ["soft_flags", "hard_flags", "notes_for_next_episode"],
        properties: {
          soft_flags: {
            type: "array",
            items: { type: "string" },
            description:
              "Concerns that do not block generation but should inform the next episode.",
          },
          hard_flags: {
            type: "array",
            items: {
              type: "object",
              required: ["issue", "conflicting_fact", "suggested_resolution"],
              properties: {
                issue: {
                  type: "string",
                  description: "What the draft said that contradicts canon.",
                },
                conflicting_fact: {
                  type: "string",
                  description:
                    "The exact established fact being contradicted (valid_until: null in the bible).",
                },
                suggested_resolution: {
                  type: "string",
                  description:
                    "How the writer could resolve this without breaking canon.",
                },
              },
            },
            description:
              "Direct contradictions of established facts. Be conservative — only raise when genuinely blocking. Hard flags prevent next-episode generation.",
          },
          notes_for_next_episode: {
            type: "string",
            description:
              "1–3 sentences of editorial guidance. What tension is most alive? What thread is most pressured? What should the writer be careful about?",
          },
        },
      },
    },
  },
};

export type EpisodeNExtractToolInput = {
  state_delta: StateDelta;
  critic_output: CriticOutput;
};
