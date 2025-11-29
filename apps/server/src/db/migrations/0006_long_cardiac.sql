ALTER TABLE "user" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");