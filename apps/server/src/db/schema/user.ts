import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { ulid } from "ulid";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const userRoleEnum = pgEnum("userRole", ["USER", "ADMIN", "EMPLOYEE"]);

export const user = pgTable("user", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  gender: genderEnum().notNull(),
  avatar: varchar("avatar", { length: 255 }),
  //   phone: varchar({ length: 255 }),
  //   phoneVerified: boolean("phone_verified").notNull().default(false),
  //   password: varchar({ length: 255 }),
  //   googleId: varchar("google_id"),
  isBlocked: boolean("is_active").notNull().default(true),
  dateOfBirth: timestamp("date_of_birth", { mode: "string" }).notNull(),
  refreshToken: varchar("refresh_token"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});
export const userRelations = relations(user, ({ many }) => ({
//   userStore: many(userStore),
//   subscriptions: many(subscription),
}));
