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
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"avatar" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"refresh_token" varchar,
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