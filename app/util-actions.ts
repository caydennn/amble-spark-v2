"use server";

import { db } from "@/db/db";
import { matchUsers, matches, messages } from "@/db/schema";
import { formatUserMessagesInSequence } from "@/lib/utils";
import { and, desc, eq } from "drizzle-orm";

export async function getLastMessagesFromMatch(matchId: string, count: number) {
  const usersInMatch = await db.query.matchUsers.findMany({
    where: eq(matchUsers.matchId, Number(matchId)),
  });
  if (usersInMatch.length < 2) {
    throw Error("Match does not have two users");
  }
  const [user1, user2] = usersInMatch;

  const currentUserMessages = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.matchId, Number(matchId)),
        eq(messages.sentBy, user1.userId!.toString())
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(count);

  const otherUserMessages = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.matchId, Number(matchId)),
        eq(messages.sentBy, user2.userId!.toString())
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(count);

  return {
    currentUserMsgs: currentUserMessages,
    otherUserMsgs: otherUserMessages,
  };
}

export async function getMatchContext(matchId: string) {
  const { currentUserMsgs, otherUserMsgs } = await getLastMessagesFromMatch(
    matchId,
    5
  );
  const formattedMessage = formatUserMessagesInSequence({
    currentUserMsgs,
    otherUserMsgs,
  });
  return formattedMessage;
}

export async function updateMatchLevel(matchId: string, level: number) {
  return await db
    .update(matches)
    .set({ level })
    .where(eq(matches.id, Number(matchId)));
}
