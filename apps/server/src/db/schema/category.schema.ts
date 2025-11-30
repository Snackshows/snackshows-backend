import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";
import { generateUniqueId } from "../../utils/idGenerator";
import { vertical } from "./vertical";

// Category table
export const category = pgTable("category", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  uniqueId: varchar("unique_id")
    .unique()
    .notNull()
    .$defaultFn(() => generateUniqueId("CAT")).notNull(),
  name: varchar("name").notNull(),
  description: varchar("description").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const categoryRelations = relations(category, ({ one, many }) => ({
  verticals: many(vertical),
  // product: many(product),
  // parentCategory: one(category, {
  // 	fields: [category.parentId],
  // 	references: [category.id],
  // }),
}));
