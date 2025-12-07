ALTER TABLE "episode" ALTER COLUMN "release_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "episode" ALTER COLUMN "release_date" DROP NOT NULL;