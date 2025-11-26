import {
  pgTable,
  timestamp,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";
import { generateUniqueId } from "../../utils/idGenerator";
import { category } from "./category";
import { episode } from "./episode";

// Verticals table
export const vertical = pgTable("vertical", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  uniqueId: varchar("unique_id")
    .unique()
    .notNull()
    .$defaultFn(() => generateUniqueId("VRT")), // Changed prefix to VRT for vertical
  name: varchar("name").notNull(),
  description: varchar("description"),

  // Media URLs
  banner: varchar("banner"),
  thumbnail: varchar("thumbnail"),

  // Metadata
  type: integer("type").notNull().default(1), // Default type to 1 if not specified
  maxAdsForFreeView: integer("max_ads_for_free_view").default(0),
  releaseDate: timestamp("release_date", { mode: "string" }),

  // Flags
  isTrending: boolean("is_trending").default(false),
  isAutoAnimateBanner: boolean("is_auto_animate_banner").default(false),
  isActive: boolean("is_active").default(true),

  // Relations
  categoryId: varchar("category_id").references(() => category.id),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// Define relations
export const verticalRelations = relations(vertical, ({ one, many }) => ({
  episodes: many(episode),

  category: one(category, {
    fields: [vertical.categoryId],
    references: [category.id],
  }),
}));
