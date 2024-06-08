"use server";
import { db } from "@/db/db";
import { getMatchContext, updateMatchLevel } from "@/app/util-actions";
import {
  generatePrompts,
  sendPromptToMatch,
  evaluateConversationPerformance,
} from "@/lib/openai";

import {
  matchPrompts,
  matchUsers,
  matches,
  messages,
  prompts,
} from "@/db/schema";
import { and, count, desc, eq, gt, ne } from "drizzle-orm";
import { MessageRole } from "@/lib/enums";

export async function handlePostMessageActions(
  matchId: string,
  senderId: string
) {
  console.log("handlePostMessageActions", matchId, senderId);
  const lastPrompt = await db.query.matchPrompts.findFirst({
    orderBy: [desc(prompts.createdAt)],
    where: eq(matchPrompts.matchId, Number(matchId)),
  });

  if (!lastPrompt) {
    console.warn("No prompt found for match", matchId);
    return;
  }
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, Number(matchId)),
  });

  const otherUser = await db.query.matchUsers.findFirst({
    where: and(
      eq(matchUsers.matchId, Number(matchId)),
      ne(matchUsers.userId, senderId)
    ),
  });

  if (!match || !otherUser) {
    console.warn("Match or other user not found", matchId, senderId);
    return;
  }

  const numMsgsFromSender = await db
    .select({ count: count() })
    .from(messages)
    .where(
      and(
        gt(messages.createdAt, lastPrompt.createdAt),
        eq(messages.role, MessageRole.user),
        eq(messages.matchId, Number(matchId)),
        eq(messages.sentBy, senderId)
      )
    );

  const numMsgsFromOtherUser = await db
    .select({ count: count() })
    .from(messages)
    .where(
      and(
        gt(messages.createdAt, lastPrompt.createdAt),
        eq(messages.role, MessageRole.user),
        eq(messages.matchId, Number(matchId)),
        eq(messages.sentBy, otherUser.userId!)
      )
    );

  const msgCnt = {
    currentUser: numMsgsFromSender[0].count,
    otherUser: numMsgsFromOtherUser[0].count,
  };

  const shouldSendPrompt = msgCnt.currentUser >= 3 && msgCnt.otherUser >= 3;
  if (!shouldSendPrompt) {
    console.log("Not enough messages to send prompt", msgCnt);
    return;
  }

  try {
    // get the fresh match
    const latestMatch = await db.query.matches.findFirst({
      where: eq(matches.id, Number(matchId)),
    });

    if (latestMatch?.generatingPrompt) {
      console.log("Prompt already being generated for match", matchId);
      return;
    }

    // lock the match to prevent multiple prompts being generated
    await db
      .update(matches)
      .set({ generatingPrompt: true })
      .where(eq(matches.id, Number(matchId)));
    const matchContext = await getMatchContext(matchId);
    const { factors, summary } = await evaluateConversationPerformance(
      matchContext
    );

    let currentLevel = match.level;
    console.log("Current level", currentLevel, summary.ready);
    if (summary.ready == "yes") {
      currentLevel += 1;
      console.log("Incrementing level", currentLevel);
      await updateMatchLevel(matchId, currentLevel);
      console.log("Updated match level", currentLevel);
    }
    const { prompts } = await generatePrompts(currentLevel, matchContext);

    // choose random prompt to send
    const toSend = prompts[Math.floor(Math.random() * prompts.length)];
    await sendPromptToMatch(matchId, toSend);
  } catch (e) {
    console.error("Error generating prompt", e);
  } finally {
    await db
      .update(matches)
      .set({ generatingPrompt: false })
      .where(eq(matches.id, Number(matchId)));
  }
}
