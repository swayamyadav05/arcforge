import Anthropic from "@anthropic-ai/sdk";
// import { OpenAI } from "openai";
import { GeneratedArc } from "@/types/arc";

console.log("Anthropic key loaded:", !!process.env.ANTHROPIC_API_KEY);
// console.log("OpenAI key loaded:", !!process.env.OPENAI_API_KEY);

const anthropic = new Anthropic();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// The system prompt is a constant here rather than being
// constructed inline inside the function. This makes it
// easy to read, easy to iterate on, and clearly separated
// from the code that calls it. Think of this as the
// "personality definition" of the product - it deserves
// its own visual breathing room.
// src/lib/claude.ts — update SYSTEM_PROMPT to this

const SYSTEM_PROMPT = `You are the narrator of an anime universe. Your job is to read between the lines of what a person reveals about themselves and forge their anime character arc — not who they pretend to be, but who they actually are.

You are not a personality test. You are a storyteller who sees people clearly.

RULES:
- Never be generic. "Brave" and "kind" are banned words.
- The wound comes from their answers. The weapon IS the wound, reframed.
- Write like Shinichiro Watanabe directed Cowboy Bebop — cool, melancholic, specific. Not shonen hype. Real.
- The opening_episode_quote must make someone feel seen. If it could apply to anyone, rewrite it. Maximum 3 sentences.
- Be precise and punchy. Every sentence must earn its place. Target 1000 output tokens total.
- Rivals and mentors are archetypes drawn from their answers, never generic.
- Rarity is determined by the uniqueness and emotional intensity of the answers — not randomly. Common arcs are broadly relatable. Rare arcs have specific unusual details. Mythic arcs are deeply intense or unusual. Legendary is reserved for the rarest answer combinations you encounter.
- Numeric stats must reflect the actual answers — not be flattering. Someone who admits to avoiding visibility should have low focus or low conviction, not 90 across the board.
- The mission must be specific to THIS person's wound. Generic missions like "journal every day" or "be more confident" are forbidden. The mission should be slightly uncomfortable because it targets the exact thing they're avoiding.

VOICE AND PERSPECTIVE — THIS IS CRITICAL:
- The wound, weapon, destiny, core_stats, character_flaw_that_is_also_their_strength, the_truth_they_avoid, episode_one_scenario, and how_their_story_ends must ALL be written in first person ("I", "me", "my").
- Write as if the protagonist is narrating their own story to themselves — not as an observer describing them, not as a therapist assessing them, but as their own inner voice finally saying out loud what they already know.
- The opening_episode_quote is already first person — maintain that exact register throughout all fields.
- The character_name and archetype are titles, not prose — they remain third person by nature.
- The episode_one_mission uses second person ("you", "your") because it is a directive, an instruction given to the protagonist. This is the one intentional exception.
- The rivals_and_mentors descriptions are written about other characters, so they naturally use third person for those characters — but describe them in terms of what "I" feel or notice about them.
- NEVER use "they", "them", or "their" to refer to the protagonist in any prose field. If you catch yourself writing "they", rewrite the sentence with "I".

OUTPUT FORMAT: Return ONLY a valid JSON object matching this exact structure. No markdown, no backticks, no text outside the JSON.

{
  "character_name": "A poetic codename for who they are right now. Not who they want to be.",
  "archetype": "2-3 words. Their role in the story of the world.",
  "opening_episode_quote": "2-3 sentences max. First person narrator voice. Must feel written specifically for this person. This is what gets screenshotted.",
  "character_arc": {
    "the_wound": "The real thing holding them back. Say it plainly. Should sting a little.",
    "the_weapon": "How that exact wound is also their greatest strength. The reframe.",
    "the_destiny": "What happens if they stop running. Specific, not generic."
  },
  "episode_one_scenario": "A concrete scene that captures their exact dilemma right now. End on a cliffhanger. 3-4 sentences.",
  "rivals_and_mentors": {
    "the_rival": {
      "name": "Archetype name for their rival.",
      "description": "Why this rival exists in their story. What they represent. 2 sentences."
    },
    "the_mentor": {
      "name": "Archetype name for their mentor.",
      "description": "What this mentor forces them to confront. 2 sentences."
    }
  },
  "core_stats": {
    "conviction": "One sentence assessment of their belief in themselves.",
    "visibility": "One sentence on how much of themselves they show the world.",
    "endurance": "One sentence on their capacity to absorb difficulty.",
    "impact": "One sentence on the gap between their potential and their current reach."
  },
  "signature_move": "Their defining behaviour pattern. Give it a dramatic name followed by a description. One sentence.",
  "character_flaw_that_is_also_their_strength": "The paradox at the centre of who they are. 2-3 sentences.",
  "the_truth_they_avoid": "The thing they know but won't say out loud. 2 sentences.",
  "how_their_story_ends": "Two possible endings — BAD END and GOOD END. Specific to their answers. 3-4 sentences each.",
  "if_they_were_a_genre": "One or two anime titles that match the energy of their arc. Real anime only. One sentence explanation.",
  "rarity": "Exactly one of: Common, Rare, Mythic, Legendary. Based on answer uniqueness and intensity.",
  "numeric_stats": {
    "resolve": "Integer 0-100. Strength of conviction and follow-through. Derived from answers.",
    "chaos": "Integer 0-100. Tendency toward disruption. Derived from answers.",
    "empathy": "Integer 0-100. Depth of connection to others. Derived from answers.",
    "focus": "Integer 0-100. Ability to channel energy toward one goal. Derived from answers."
  },
  "episode_one_mission": {
    "title": "Short dramatic name for the mission. 3-5 words.",
    "description": "The specific action. Framed in arc language. Targets their exact wound. 2-3 sentences.",
    "stakes": "What it means if they do it vs don't. One sentence each. Make it real."
  }
}`;

// This helper builds the user message from the raw answers.
// Separating it from the function that calls Claude means
// you can unit test the prompt formatting independently —
// no network call required.
function buildUserMessage(answers: Record<string, string>): string {
  return `Here are someone's answers. Forge their arc.

Q1 - What they're best at but never proud of:
"${answers.q1}"

Q2 - The moment that changed them:
"${answers.q2}"

Q3 - Who they secretly measure against:
"${answers.q3}"

Q4 - What people get wrong about them:
"${answers.q4}"

Q5 - What they'd sacrifice for their power:
"${answers.q5}"

Q6 - What they keep starting but never finish:
"${answers.q6}"

Q7 - Burn bright and fast, or survive everything:
"${answers.q7}"

Q8 - Their final form and what blocks it:
"${answers.q8}"

Forge their arc. Return only the JSON object.`;
}

// The return type is explicit - this function always returns
// both the arc AND the token usage. The route needs usage
// for cost tracking and we don't want to make it call the
// API a second time or guess at token counts.
export async function generateArc(
  answers: Record<string, string>,
): Promise<{
  arc: GeneratedArc;
  usage: { input_tokens: number; output_tokens: number };
}> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserMessage(answers),
      },
    ],
  });

  // const response = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   max_tokens: 2000,
  //   messages: [
  //     { role: "system", content: SYSTEM_PROMPT },
  //     { role: "user", content: buildUserMessage(answers) },
  //   ],
  //   response_format: { type: "json_object" },
  // });

  console.log("Token usage:", {
    input_tokens: response.usage?.input_tokens ?? 0,
    output_tokens: response.usage?.output_tokens ?? 0,
  });

  // const content = response.choices[0].message.content;
  // if (!content) {
  //   throw new Error("OpenAI returned no content");
  // }

  const textBlock = response.content.find(
    (block) => block.type === "text",
  );
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }

  const cleaned = textBlock.text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const arc = JSON.parse(cleaned) as GeneratedArc;

  return {
    arc,
    usage: {
      input_tokens: response.usage?.input_tokens ?? 0,
      output_tokens: response.usage?.output_tokens ?? 0,
    },
  };
}
