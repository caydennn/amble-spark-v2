ALTER TABLE "match_users" ALTER COLUMN "matchId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_users" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "level" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "level" SET DEFAULT 1;