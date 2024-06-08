ALTER TABLE "prompts" RENAME COLUMN "intensity" TO "level";--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "level" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "level" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "level" SET NOT NULL;