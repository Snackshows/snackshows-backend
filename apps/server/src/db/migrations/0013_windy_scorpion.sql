CREATE TABLE "series" (
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
	CONSTRAINT "series_unique_id_unique" UNIQUE("unique_id")
);
--> statement-breakpoint
ALTER TABLE "vertical" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "vertical" CASCADE;--> statement-breakpoint
ALTER TABLE "episode" DROP CONSTRAINT "episode_vertical_id_vertical_id_fk";
--> statement-breakpoint
ALTER TABLE "episode" ADD COLUMN "series_id" varchar;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode" ADD CONSTRAINT "episode_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode" DROP COLUMN "vertical_id";