ALTER TABLE "match_prompts" RENAME COLUMN "match_id" TO "matchId";--> statement-breakpoint
ALTER TABLE "match_prompts" RENAME COLUMN "prompt_id" TO "promptId";--> statement-breakpoint
ALTER TABLE "match_prompts" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "match_users" RENAME COLUMN "match_id" TO "matchId";--> statement-breakpoint
ALTER TABLE "match_users" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "matches" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "match_id" TO "matchId";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "prompts" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "in_queue" TO "inQueue";--> statement-breakpoint
ALTER TABLE "match_prompts" DROP CONSTRAINT "match_prompts_match_id_matches_id_fk";
--> statement-breakpoint
ALTER TABLE "match_prompts" DROP CONSTRAINT "match_prompts_prompt_id_prompts_id_fk";
--> statement-breakpoint
ALTER TABLE "match_users" DROP CONSTRAINT "match_users_match_id_matches_id_fk";
--> statement-breakpoint
ALTER TABLE "match_users" DROP CONSTRAINT "match_users_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_match_id_matches_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_prompts" ADD CONSTRAINT "match_prompts_matchId_matches_id_fk" FOREIGN KEY ("matchId") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_prompts" ADD CONSTRAINT "match_prompts_promptId_prompts_id_fk" FOREIGN KEY ("promptId") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_users" ADD CONSTRAINT "match_users_matchId_matches_id_fk" FOREIGN KEY ("matchId") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_users" ADD CONSTRAINT "match_users_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_matchId_matches_id_fk" FOREIGN KEY ("matchId") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
