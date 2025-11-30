ALTER TABLE "user" DROP CONSTRAINT "user_google_mail_unique";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "google_mail";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "refresh_token";