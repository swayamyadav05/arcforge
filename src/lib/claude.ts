import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { GeneratedArc } from "@/types/arc";
import { StoryBibleShape } from "@/types/story-bible";
import {
  EpisodeNPlan,
  EpisodeNOutput,
  StateDelta,
  CriticOutput,
} from "@/types/episode-n";
import { getEpisode1Prompt } from "@/lib/prompts/episode-1";
import {
  getEpisodeNPlanPrompt,
  buildEpisodeNPlanUserMessage,
} from "@/lib/prompts/episode-n-plan";
import {
  getEpisodeNDraftPrompt,
  buildEpisodeNDraftUserMessage,
} from "@/lib/prompts/episode-n-draft";
import {
  getEpisodeNExtractPrompt,
  buildEpisodeNExtractUserMessage,
} from "@/lib/prompts/episode-n-extract";
import {
  forgeEpisodeTool,
  ForgeEpisodeToolInput,
} from "@/lib/tools/forge-episode";
import { episodeNPlanTool } from "@/lib/tools/episode-n-plan";
import { episodeNDraftTool } from "@/lib/tools/episode-n-draft";
import {
  episodeNExtractTool,
  EpisodeNExtractToolInput,
} from "@/lib/tools/episode-n-extract";

const anthropic = new Anthropic();

const SONNET = "claude-sonnet-4-6";
const HAIKU = "claude-haiku-4-5-20251001";

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
    model: SONNET,
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

export async function generateEpisodeN(params: {
  bible: StoryBibleShape;
  previousEpisode: {
    episodeNumber: number;
    title: string;
    summary: string;
  };
  reflectionQ1: string;
  reflectionQ2: string | null;
  elapsedDays: number;
  episodeNumber: number;
}): Promise<{
  plan: EpisodeNPlan;
  draft: EpisodeNOutput;
  stateDelta: StateDelta;
  criticOutput: CriticOutput;
  usage: {
    plan: { input: number; output: number };
    draft: { input: number; output: number };
    extract: { input: number; output: number };
  };
}> {
  const {
    bible,
    previousEpisode,
    reflectionQ1,
    reflectionQ2,
    elapsedDays,
    episodeNumber,
  } = params;

  // ── Call 1: Plan (Sonnet + cached bible) ───────────────────────────
  const planContent = buildEpisodeNPlanUserMessage({
    bible,
    previousEpisodeSummary: previousEpisode.summary,
    reflectionQ1,
    reflectionQ2,
    elapsedDays,
    episodeNumber,
  });

  console.log("[generateEpisodeN] Plan content:", {
    blocks: planContent.length,
    bibleChars: planContent[0]?.text?.length ?? 0,
    contextChars: planContent[1]?.text?.length ?? 0,
  });

  const planResponse = await anthropic.messages.create({
    model: SONNET,
    max_tokens: 2000,
    system: getEpisodeNPlanPrompt(),
    tools: [episodeNPlanTool],
    tool_choice: { type: "tool", name: "plan_episode_n" },
    messages: [
      {
        role: "user",
        content: planContent as unknown as MessageParam["content"],
      },
    ],
  });

  const planToolBlock = planResponse.content.find(
    (b) => b.type === "tool_use",
  );
  if (!planToolBlock || planToolBlock.type !== "tool_use") {
    throw new Error(
      "Plan call did not return tool use — episode generation aborted",
    );
  }
  const plan = planToolBlock.input as EpisodeNPlan;

  const planU = planResponse.usage as typeof planResponse.usage & {
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  console.log("[generateEpisodeN] Plan usage:", {
    input: planU.input_tokens,
    cache_created: planU.cache_creation_input_tokens ?? 0,
    cache_read: planU.cache_read_input_tokens ?? 0,
    output: planU.output_tokens,
  });

  // ── Call 2: Draft (Sonnet + cached bible + plan) ──────────────────
  const draftContent = buildEpisodeNDraftUserMessage({
    bible,
    plan,
    reflectionQ1,
    reflectionQ2,
    elapsedDays,
    episodeNumber,
  });

  console.log("[generateEpisodeN] Draft content:", {
    blocks: draftContent.length,
    bibleChars: draftContent[0]?.text?.length ?? 0,
    contextChars: draftContent[1]?.text?.length ?? 0,
  });

  const draftResponse = await anthropic.messages.create({
    model: SONNET,
    max_tokens: 3000,
    system: getEpisodeNDraftPrompt(),
    tools: [episodeNDraftTool],
    tool_choice: { type: "tool", name: "draft_episode_n" },
    messages: [
      {
        role: "user",
        content: draftContent as unknown as MessageParam["content"],
      },
    ],
  });

  const draftToolBlock = draftResponse.content.find(
    (b) => b.type === "tool_use",
  );
  if (!draftToolBlock || draftToolBlock.type !== "tool_use") {
    throw new Error(
      "Draft call did not return tool use — episode generation aborted",
    );
  }
  const draft = draftToolBlock.input as EpisodeNOutput;

  const draftU = draftResponse.usage as typeof draftResponse.usage & {
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  console.log("[generateEpisodeN] Draft usage:", {
    input: draftU.input_tokens,
    cache_created: draftU.cache_creation_input_tokens ?? 0,
    cache_read: draftU.cache_read_input_tokens ?? 0,
    output: draftU.output_tokens,
  });

  // ── Call 3: Extract + Critic (Haiku) ──────────────────────────────
  const extractResponse = await anthropic.messages.create({
    model: HAIKU,
    max_tokens: 2000,
    system: getEpisodeNExtractPrompt(),
    tools: [episodeNExtractTool],
    tool_choice: { type: "tool", name: "extract_episode_n" },
    messages: [
      {
        role: "user",
        content: buildEpisodeNExtractUserMessage({
          bible,
          draft,
          reflectionQ1,
          reflectionQ2,
        }),
      },
    ],
  });

  const extractToolBlock = extractResponse.content.find(
    (b) => b.type === "tool_use",
  );
  if (!extractToolBlock || extractToolBlock.type !== "tool_use") {
    throw new Error(
      "Extract call did not return tool use — episode generation aborted",
    );
  }
  const { state_delta: stateDelta, critic_output: criticOutput } =
    extractToolBlock.input as EpisodeNExtractToolInput;

  console.log("[generateEpisodeN] Extract usage:", {
    input: extractResponse.usage.input_tokens,
    output: extractResponse.usage.output_tokens,
  });

  return {
    plan,
    draft,
    stateDelta,
    criticOutput,
    usage: {
      plan: {
        input: planResponse.usage.input_tokens,
        output: planResponse.usage.output_tokens,
      },
      draft: {
        input: draftResponse.usage.input_tokens,
        output: draftResponse.usage.output_tokens,
      },
      extract: {
        input: extractResponse.usage.input_tokens,
        output: extractResponse.usage.output_tokens,
      },
    },
  };
}
