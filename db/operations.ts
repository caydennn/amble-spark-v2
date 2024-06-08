"use server";

import { db } from "@/db/db";
import {
  User,
  matchPrompts,
  matchUsers,
  matches,
  messages,
  prompts,
  users,
} from "@/db/schema";

import { and, count, desc, eq, gt, ne } from "drizzle-orm";
import { MatchStatus, MessageRole } from "@/lib/enums";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

export async function getActiveUserMatches(callingUserId: string) {
  return await db
    .select()
    .from(matchUsers)
    .leftJoin(users, eq(users.id, matchUsers.userId))
    .leftJoin(matches, eq(matches.id, matchUsers.matchId))
    .where(
      and(eq(matches.status, MatchStatus.active), eq(users.id, callingUserId))
    )
    .limit(1);
}

export async function getQueueingUser(callingUserId: string) {
  return await db
    .select()
    .from(users)
    .where(and(eq(users.inQueue, true), eq(users.id, callingUserId)))
    .limit(1);
}

export async function getQueueingUsers(callingUserId: string) {
  return await db
    .select()
    .from(users)
    .where(and(eq(users.inQueue, true), ne(users.id, callingUserId)));
}

export async function createMatchWithUsers(
  callingUserId: string,
  otherUser: User
) {
  const resp = await db.transaction(async (db) => {
    console.log("creating match for users", otherUser.id, callingUserId);

    // const [prompt] = await db.select().from(prompts).limit(1);
    // take a random prompt from the database
    const randomPrompts = await db
      .select()
      .from(prompts)
      .where(eq(prompts.level, 1));

    console.log("got random prompts", randomPrompts);
    const prompt =
      randomPrompts[Math.floor(Math.random() * randomPrompts.length)];

    if (!prompt) {
      throw Error("No prompts found. Did you seed the database?");
    }

    const [match] = await db
      .insert(matches)
      .values({
        status: MatchStatus.active,
      })
      .returning()
      .execute();

    await db
      .insert(matchUsers)
      .values([
        { matchId: match.id, userId: otherUser.id },
        { matchId: match.id, userId: callingUserId },
      ])
      .execute();

    // init prompts
    await db
      .insert(matchPrompts)
      .values({
        matchId: match.id,
        promptId: prompt.id,
      })
      .execute();

    await db
      .insert(messages)
      .values({
        content: prompt.content,
        matchId: match.id,
        role: MessageRole.assistant,
      })
      .execute();

    await removeFromQueue(callingUserId, otherUser.id);
    console.log("removed from queue");
    return match;
  });
  console.log(
    "created match for users successfully",
    otherUser.id,
    callingUserId
  );
  return resp;
}

export async function removeFromQueue(
  callingUserId: string,
  otherUserId: string
) {
  await db
    .update(users)
    .set({ inQueue: false })
    .where(eq(users.id, callingUserId))
    .execute();

  await db
    .update(users)
    .set({ inQueue: false })
    .where(eq(users.id, otherUserId))
    .execute();
}

export async function addToQueue(callingUserId: string) {
  await db
    .update(users)
    .set({ inQueue: true })
    .where(eq(users.id, callingUserId))
    .execute();
}

export async function insertMessage(
  content: string,
  matchId: string,
  senderId: string
) {
  return await db
    .insert(messages)
    .values({
      content,
      matchId: Number(matchId),
      sentBy: senderId,
      role: MessageRole.user,
    })
    .returning()
    .execute();
}

// Add more database-related functions as needed
