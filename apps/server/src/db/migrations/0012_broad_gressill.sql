ALTER TABLE "user" DROP CONSTRAINT "user_phone_unique";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "country_code" varchar(5);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_phone_number" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "otp";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "otp_expires_at";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number");