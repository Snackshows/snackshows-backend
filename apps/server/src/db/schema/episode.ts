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
import { vertical } from "./vertical";

// Episode table
export const episode = pgTable("episode", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  verticalId: varchar("vertical_id").references(() => vertical.id),
  name: varchar("name"),
  episodeNumber: integer("episode_number").notNull(),
  videoImage: varchar("video_image"),
  videoUrl: varchar("video_url"),
  duration: integer("duration"),
  coin: integer("coin"),
  isLocked: boolean("is_locked").notNull().default(false),
  releaseDate: timestamp("release_date", { mode: "string" })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const episodeRelations = relations(episode, ({ one, many }) => ({
  show: one(vertical, {
    fields: [episode.verticalId],
    references: [vertical.id],
  }),
}));
