import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import type { GeneratedArc } from "@/types/arc";
import type { StoryBibleShape } from "@/types/story-bible";

export const forgeEpisodeTool: Tool = {
  name: "forge_episode",
  description:
    "Forge a complete anime arc for the protagonist based on their 8 awakening answers. You MUST call this tool with every field populated — both the full arc data AND the initial story_bible bootstrapped from those same answers. Do not leave any required field empty.",
  input_schema: {
    type: "object" as const,
    required: [
      "character_name",
      "archetype",
      "opening_episode_quote",
      "character_arc",
      "episode_one_scenario",
      "rivals_and_mentors",
      "core_stats",
      "signature_move",
      "character_flaw_that_is_also_their_strength",
      "the_truth_they_avoid",
      "how_their_story_ends",
      "if_they_were_a_genre",
      "rarity",
      "numeric_stats",
      "episode_one_mission",
      "story_bible",
    ],
    properties: {
      character_name: {
        type: "string",
        description:
          "A poetic codename for who they are right now. Not who they want to be.",
      },
      archetype: {
        type: "string",
        description: "2-3 words. Their role in the story of the world.",
      },
      opening_episode_quote: {
        type: "string",
        description:
          "2-3 sentences max. First person. Captures the emotional pattern without naming specifics. The quote that gets screenshotted.",
      },
      character_arc: {
        type: "object",
        required: ["the_wound", "the_weapon", "the_destiny"],
        properties: {
          the_wound: {
            type: "string",
            description:
              "First person. The real thing holding them back. Should sting a little.",
          },
          the_weapon: {
            type: "string",
            description:
              "First person. How the wound is also their greatest strength. The reframe.",
          },
          the_destiny: {
            type: "string",
            description:
              "First person. What happens if they stop running. Specific, not generic.",
          },
        },
      },
      episode_one_scenario: {
        type: "string",
        description:
          "First person. A concrete scene capturing their exact dilemma right now. End on a cliffhanger. 3-4 sentences.",
      },
      rivals_and_mentors: {
        type: "object",
        required: ["the_rival", "the_mentor"],
        properties: {
          the_rival: {
            type: "object",
            required: ["name", "description"],
            properties: {
              name: {
                type: "string",
                description: "Archetype name for their rival.",
              },
              description: {
                type: "string",
                description:
                  "Why this rival exists in their story. What they represent. 2 sentences.",
              },
            },
          },
          the_mentor: {
            type: "object",
            required: ["name", "description"],
            properties: {
              name: {
                type: "string",
                description: "Archetype name for their mentor.",
              },
              description: {
                type: "string",
                description:
                  "What this mentor forces them to confront. 2 sentences.",
              },
            },
          },
        },
      },
      core_stats: {
        type: "object",
        required: ["conviction", "visibility", "endurance", "impact"],
        properties: {
          conviction: {
            type: "string",
            description: "First person. One sentence on their belief in themselves.",
          },
          visibility: {
            type: "string",
            description:
              "First person. One sentence on how much of themselves they show the world.",
          },
          endurance: {
            type: "string",
            description:
              "First person. One sentence on their capacity to absorb difficulty.",
          },
          impact: {
            type: "string",
            description:
              "First person. One sentence on the gap between their potential and current reach.",
          },
        },
      },
      signature_move: {
        type: "string",
        description:
          "Their defining behaviour pattern. Dramatic name followed by a one-sentence description.",
      },
      character_flaw_that_is_also_their_strength: {
        type: "string",
        description:
          "First person. The paradox at the centre of who they are. 2-3 sentences.",
      },
      the_truth_they_avoid: {
        type: "string",
        description:
          "First person. The thing they know but won't say out loud. 2 sentences.",
      },
      how_their_story_ends: {
        type: "object",
        required: ["bad_end", "good_end"],
        properties: {
          bad_end: {
            type: "string",
            description:
              "First person. 3-4 sentences. What happens if the protagonist's current pattern holds — specific to their answers.",
          },
          good_end: {
            type: "string",
            description:
              "First person. 3-4 sentences. What happens if the pattern shifts — specific to their answers.",
          },
        },
      },
      if_they_were_a_genre: {
        type: "string",
        description:
          "One or two real anime titles matching the energy of their arc. One sentence explanation.",
      },
      rarity: {
        type: "string",
        enum: ["Common", "Rare", "Mythic", "Legendary"],
        description:
          "Based on uniqueness and emotional intensity of the answers. Legendary is reserved for the rarest combinations.",
      },
      numeric_stats: {
        type: "object",
        required: ["resolve", "chaos", "empathy", "focus"],
        properties: {
          resolve: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description:
              "Strength of conviction and follow-through. Derived from answers, not flattering.",
          },
          chaos: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Tendency toward disruption and unpredictability.",
          },
          empathy: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Depth of connection to others' experiences.",
          },
          focus: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Ability to channel energy toward a single goal.",
          },
        },
      },
      episode_one_mission: {
        type: "object",
        required: ["title", "description", "stakes"],
        properties: {
          title: {
            type: "string",
            description: "Short dramatic name for the mission. 3-5 words.",
          },
          description: {
            type: "string",
            description:
              "Second person. The specific action. Targets their exact wound. 2-3 sentences.",
          },
          stakes: {
            type: "string",
            description:
              "What it means if they do it vs don't. One sentence each.",
          },
        },
      },
      story_bible: {
        type: "object",
        description:
          "The canonical narrative state bootstrapped from Episode 1. Passed to Claude in future episodes to maintain story consistency.",
        required: [
          "world",
          "characters",
          "relationships",
          "unresolved_threads",
          "timeline",
          "motifs",
          "emotional_arc",
          "established_facts",
          "style_guide",
        ],
        properties: {
          world: {
            type: "object",
            required: ["genre", "tone", "hard_rules"],
            properties: {
              genre: {
                type: "string",
                description:
                  "Narrative genre that best captures this arc (e.g. 'psychological thriller', 'noir redemption arc').",
              },
              tone: {
                type: "string",
                description:
                  "Emotional register (e.g. 'melancholic realism with sparks of defiance').",
              },
              hard_rules: {
                type: "array",
                items: { type: "string" },
                description:
                  "3-5 rules that must never be violated in this person's story.",
              },
            },
          },
          characters: {
            type: "object",
            required: ["protagonist"],
            properties: {
              protagonist: {
                type: "object",
                required: [
                  "name",
                  "archetype",
                  "description",
                  "voice",
                  "status",
                  "wounds",
                  "possessions",
                  "knowledge_state",
                ],
                properties: {
                  name: {
                    type: "string",
                    description: "The character_name from the arc.",
                  },
                  archetype: {
                    type: "string",
                    description: "The archetype from the arc.",
                  },
                  description: {
                    type: "string",
                    description:
                      "A 1-2 sentence description of the protagonist as they are in Episode 1.",
                  },
                  voice: {
                    type: "string",
                    description:
                      "How this character speaks — verbal tics, sentence rhythm.",
                  },
                  status: {
                    type: "string",
                    description:
                      "Their current narrative state (e.g. 'adrift', 'cornered', 'building').",
                  },
                  wounds: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "2-4 wounds drawn from the arc answers. Short phrases.",
                  },
                  possessions: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "2-4 symbolic possessions or abilities the protagonist carries into the story.",
                  },
                  knowledge_state: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "2-4 things the protagonist currently knows or believes to be true about themselves.",
                  },
                },
              },
            },
          },
          relationships: {
            type: "array",
            items: {
              type: "object",
              required: ["character_a", "character_b", "type", "description"],
              properties: {
                character_a: { type: "string" },
                character_b: { type: "string" },
                type: { type: "string" },
                description: { type: "string" },
              },
            },
            description:
              "Empty array for Episode 1 — relationships are potential, not yet canonical.",
          },
          unresolved_threads: {
            type: "array",
            items: {
              type: "object",
              required: [
                "thread_id",
                "description",
                "opened_episode",
                "expected_resolution_window",
                "stakes",
              ],
              properties: {
                thread_id: {
                  type: "string",
                  description:
                    "Kebab-case identifier (e.g. 'the-unfinished-mission').",
                },
                description: { type: "string" },
                opened_episode: { type: "integer" },
                expected_resolution_window: {
                  type: "string",
                  description: "Rough horizon (e.g. 'Episode 3-5').",
                },
                stakes: { type: "string" },
              },
            },
            description: "2-3 narrative threads opened by Episode 1.",
          },
          timeline: {
            type: "array",
            items: {
              type: "object",
              required: ["episode", "summary", "occurred_at"],
              properties: {
                episode: { type: "integer" },
                summary: { type: "string", description: "One sentence." },
                occurred_at: {
                  type: "string",
                  description: "Use 'Episode 1' for the initial entry.",
                },
              },
            },
          },
          motifs: {
            type: "array",
            items: { type: "string" },
            description:
              "3-5 recurring symbols or themes that belong to this arc.",
          },
          emotional_arc: {
            type: "object",
            required: ["start", "current", "target"],
            properties: {
              start: {
                type: "string",
                description:
                  "Where they are emotionally right now, in a phrase.",
              },
              current: {
                type: "string",
                description: "Same as start for Episode 1.",
              },
              target: {
                type: "string",
                description: "Where the GOOD END takes them, in a phrase.",
              },
            },
          },
          established_facts: {
            type: "array",
            items: {
              type: "object",
              required: [
                "fact",
                "established_episode",
                "last_changed_episode",
                "valid_until",
              ],
              properties: {
                fact: { type: "string" },
                established_episode: { type: "integer" },
                last_changed_episode: { type: "integer" },
                valid_until: {
                  description:
                    "Episode number when this fact expires, or null if it has no expiry.",
                  anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }],
                },
              },
            },
            description:
              "3-5 canonical facts from Episode 1. established_episode and last_changed_episode are both 1.",
          },
          style_guide: {
            type: "object",
            required: ["voice", "pacing", "forbidden_words"],
            properties: {
              voice: {
                type: "string",
                description:
                  "The narrative voice established in Episode 1 (e.g. 'terse, fragmented, self-aware').",
              },
              pacing: {
                type: "string",
                description:
                  "The rhythm of this story (e.g. 'slow burn with sudden acceleration').",
              },
              forbidden_words: {
                type: "array",
                items: { type: "string" },
                description:
                  "Words that break this story's register. Include 'brave', 'kind', and any others specific to this arc.",
              },
            },
          },
        },
      },
    },
  },
};

export type ForgeEpisodeToolInput = GeneratedArc & {
  story_bible: StoryBibleShape;
};
