CREATE TYPE "public"."userRole" AS ENUM('USER', 'ADMIN', 'EMPLOYEE');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway" AS ENUM('stripe', 'razorpay', 'phonepe', 'paytm');--> statement-breakpoint
CREATE TABLE "gateway_configs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"gateway" "payment_gateway",
	"api_key" text NOT NULL,
	"api_secret" text NOT NULL,
	"api_url" varchar,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_test_mode" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gateway_configs_api_key_unique" UNIQUE("api_key"),
	CONSTRAINT "gateway_configs_api_secret_unique" UNIQUE("api_secret")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" varchar PRIMARY KEY NOT NULL,
	"unique_id" varchar NOT NULL,
	"name" varchar,
	"description" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_unique_id_unique" UNIQUE("unique_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"age" integer,
	"gender" "gender",
	"avatar" varchar(255),
	"role" "userRole" DEFAULT 'USER' NOT NULL,
	"email" varchar(255),
	"password" varchar(255),
	"phone" varchar(20),
	"otp" varchar(6),
	"otp_expires_at" timestamp,
	"google_id" varchar(255),
	"google_mail" varchar(255),
	"instagram_id" varchar(255),
	"instagram_mail" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"date_of_birth" timestamp,
	"refresh_token" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_unique" UNIQUE("phone"),
	CONSTRAINT "user_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "user_google_mail_unique" UNIQUE("google_mail"),
	CONSTRAINT "user_instagram_id_unique" UNIQUE("instagram_id"),
	CONSTRAINT "user_instagram_mail_unique" UNIQUE("instagram_mail")
);
--> statement-breakpoint
CREATE TABLE "episode" (
	"id" varchar PRIMARY KEY NOT NULL,
	"vertical_id" varchar,
	"name" varchar,
	"episode_number" integer NOT NULL,
	"video_image" varchar,
	"video_url" varchar,
	"duration" integer,
	"coin" integer,
	"is_locked" boolean DEFAULT false NOT NULL,
	"release_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" varchar PRIMARY KEY NOT NULL,
	"fileName" varchar,
	"url" varchar,
	"key" varchar,
	"size" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vertical" (
	"id" varchar PRIMARY KEY NOT NULL,
	"unique_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"banner" varchar,
	"thumbnail" varchar,
	"type" integer DEFAULT 1 NOT NULL,
	"max_ads_for_free_view" integer DEFAULT 0,
	"release_date" timestamp,
	"is_trending" boolean DEFAULT false,
	"is_auto_animate_banner" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"category_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vertical_unique_id_unique" UNIQUE("unique_id")
);
--> statement-breakpoint
ALTER TABLE "episode" ADD CONSTRAINT "episode_vertical_id_vertical_id_fk" FOREIGN KEY ("vertical_id") REFERENCES "public"."vertical"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vertical" ADD CONSTRAINT "vertical_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;