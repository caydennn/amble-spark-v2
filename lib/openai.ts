import { INSTRUCTIONS } from "@/lib/prompts";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

import { db } from "@/db/db";
import { matchPrompts, messages, prompts } from "@/db/schema";
import { MessageRole } from "@/lib/enums";
import { desc } from "drizzle-orm";

export async function evaluateConversationPerformance(inputContext: string) {
  const { object: result } = await generateObject({
    model: openai("gpt-4-turbo"),
    system: INSTRUCTIONS.evaluate_performance,
    prompt: inputContext,
    schema: z.object({
      factors: z.object({
        sentiment: z.enum(["positive", "negative", "neutral"]),
        engagement: z.enum(["low", "medium", "high"]),
        vulnerability: z.enum(["low", "medium", "high"]),
        emotion: z.enum(["low", "medium", "high"]),
        growth: z.enum(["low", "medium", "high"]),
      }),
      summary: z.object({
        performance: z.enum(["positive", "negative", "neutral"]),
        ready: z.enum(["yes", "no"]),
      }),
    }),
  });
  console.log("[evaluateConversationPerformance] result", result);
  return result;
}

export async function generatePrompts(level: number, inputContext: string) {
  const input = ` ### Level:
  ${level}
  
  ### Conversation:
  ${inputContext}`;
  const { object: result } = await generateObject({
    model: openai("gpt-4-turbo"),
    system: INSTRUCTIONS.generate_prompt,
    prompt: input,
    schema: z.object({
      prompts: z.array(z.string()),
    }),
    maxRetries: 3,
  });
  console.log("[generatePrompts] result", result);
  return result;
}

export async function sendPromptToMatch(
  matchId: string,
  generatedPrompt: string | null = null,
  level: number = 1
) {
  let prompt;
  if (!generatedPrompt) {
    const [out] = await db
      .select()
      .from(prompts)
      .orderBy(desc(prompts.createdAt))
      .limit(1);
    prompt = out;
  } else {
    const [out] = await db
      .insert(prompts)
      .values({
        content: generatedPrompt,
        level: level,
      })
      .returning()
      .execute();
    prompt = out;
  }

  await db
    .insert(matchPrompts)
    .values({
      matchId: Number(matchId),
      promptId: prompt.id,
    })
    .returning()
    .execute();

  const [insertedPrompt] = await db
    .insert(messages)
    .values({
      content: prompt.content,
      matchId: Number(matchId),
      role: MessageRole.assistant,
    })
    .returning()
    .execute();

  return insertedPrompt.content;
}
