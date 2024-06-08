"use server";

import { db } from "@/db/db";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { redirect } from "next/navigation";
import { CoreMessage, streamText } from "ai";
import {
  getActiveUserMatches,
  getQueueingUser,
  getQueueingUsers,
  createMatchWithUsers,
  removeFromQueue,
  addToQueue,
  insertMessage,
} from "@/db/operations";
import { handlePostMessageActions } from "@/lib/messages";
import { formatUserMessagesInSequence } from "@/lib/utils";
import { prompts } from "@/db/schema";

export async function continueConversation(messages: CoreMessage[]) {
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages,
  });
  const data = { test: "hello" };

  const stream = createStreamableValue(result.textStream);
  return { message: stream.value, data };
}

export async function handleMatching(callingUserId: string) {
  const activeUserMatches = await getActiveUserMatches(callingUserId);

  if (activeUserMatches.length > 0) {
    console.log("[handleMatching] user already in active match");
    redirect(`/matches/${activeUserMatches[0].matches?.id}`);
  }

  const queueingUser = await getQueueingUser(callingUserId);

  if (queueingUser.length > 0) {
    redirect(`/queue?userId=${queueingUser[0].id}`);
  }

  const queueingUsers = await getQueueingUsers(callingUserId);

  if (queueingUsers.length > 0) {

    const otherUser = queueingUsers[0];
    const createdMatch = await createMatchWithUsers(callingUserId, otherUser);

    if (!createdMatch) {
      throw Error("Failed to create match");
    }
    redirect(`/matches/${createdMatch.id}`);
  } else {
    console.log("adding user to queue");
    await addToQueue(callingUserId);
    redirect(`/queue?userId=${callingUserId}`);
  }
}

export async function sendMessage(
  content: string,
  matchId: string,
  senderId: string
) {
  const msg = await insertMessage(content, matchId, senderId);
  console.log("sent msg", msg);
  await handlePostMessageActions(matchId, senderId);
}
