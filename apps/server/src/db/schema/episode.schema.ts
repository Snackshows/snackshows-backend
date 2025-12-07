import {
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";
import { generateUniqueId } from "../../utils/idGenerator";
import { series } from "./series.schema";

// Episode table
export const episode = pgTable("episode", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  seriesId: varchar("series_id").references(() => series.id),
  episodeNumber: integer("episode_number").notNull(),
  videoImage: varchar("video_image"),
  videoUrl: varchar("video_url"),
  duration: integer("duration"),
  coin: integer("coin"),
  isLocked: boolean("is_locked").notNull().default(false),
  releaseDate: timestamp("release_date", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const episodeRelations = relations(episode, ({ one, many }) => ({
  series: one(series, {
    fields: [episode.seriesId],
    references: [series.id],
  }),
}));
