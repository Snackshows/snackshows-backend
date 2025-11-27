ALTER TABLE "user" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "otp" varchar(6);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "otp_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "google_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "google_mail" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "instagram_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "instagram_mail" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_google_id_unique" UNIQUE("google_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_google_mail_unique" UNIQUE("google_mail");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_instagram_id_unique" UNIQUE("instagram_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_instagram_mail_unique" UNIQUE("instagram_mail");