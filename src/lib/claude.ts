import Anthropic from "@anthropic-ai/sdk";
import { GeneratedArc } from "@/types/arc";
import { StoryBibleShape } from "@/types/story-bible";
import { getEpisode1Prompt } from "@/lib/prompts";
import {
  forgeEpisodeTool,
  ForgeEpisodeToolInput,
} from "@/lib/tools/forge-episode";

const anthropic = new Anthropic();

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

Forge their arc and bootstrap their story bible. Call the forge_episode tool with all fields populated.`;
}

export async function generateArc(
  answers: Record<string, string>,
): Promise<{
  arc: GeneratedArc;
  bible: StoryBibleShape;
  usage: { input_tokens: number; output_tokens: number };
}> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: getEpisode1Prompt(),
    tools: [forgeEpisodeTool],
    tool_choice: { type: "tool", name: "forge_episode" },
    messages: [
      {
        role: "user",
        content: buildUserMessage(answers),
      },
    ],
  });

  console.log("Token usage:", {
    input_tokens: response.usage?.input_tokens ?? 0,
    output_tokens: response.usage?.output_tokens ?? 0,
  });

  const toolUseBlock = response.content.find(
    (block) => block.type === "tool_use",
  );
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error(
      "Claude did not call the forge_episode tool — cannot extract arc or bible",
    );
  }

  const input = toolUseBlock.input as ForgeEpisodeToolInput;
  const { story_bible, ...arcFields } = input;

  return {
    arc: arcFields as GeneratedArc,
    bible: story_bible,
    usage: {
      input_tokens: response.usage?.input_tokens ?? 0,
      output_tokens: response.usage?.output_tokens ?? 0,
    },
  };
}
