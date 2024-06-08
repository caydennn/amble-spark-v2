import { MatchStatus, MessageRole } from "@/lib/enums";

import {
  pgTable,
  serial,
  text,
  uuid,
  varchar,
  numeric,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  inQueue: boolean("inQueue").default(false),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  level: integer("level").default(1).notNull(),
  status: text("status").notNull().default(MatchStatus.active),
  generatingPrompt: boolean("generatingPrompt").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const matchUsers = pgTable("match_users", {
  id: serial("id").primaryKey(),
  matchId: integer("matchId")
    .references(() => matches.id)
    .notNull(),
  userId: uuid("userId")
    .references(() => users.id)
    .notNull(),
  // matchRating: numeric("match_rating"),
  // matchDate: text("match_date"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").default(MessageRole.user),
  matchId: integer("matchId").references(() => matches.id),
  content: text("content"),
  sentBy: uuid("sentBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  content: text("content"),
  level: integer("level").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const matchPrompts = pgTable("match_prompts", {
  id: serial("id").primaryKey(),
  matchId: integer("matchId").references(() => matches.id),
  promptId: integer("promptId").references(() => prompts.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type User = typeof users.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
