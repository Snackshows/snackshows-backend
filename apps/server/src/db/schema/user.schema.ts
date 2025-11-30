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
// export const userRoleEnum = pgEnum("userRole", ["USER", "ADMIN", "EMPLOYEE"]);

export const user = pgTable("user", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  name: varchar("name", { length: 255 }),
  age: integer("age"),
  gender: genderEnum(),
  avatar: varchar("avatar", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),

  // Mobile Auth
  phoneNumber: varchar("phone_number", { length: 20 }).unique(),
  countryCode: varchar("country_code", { length: 5 }),
  isPhoneNumber: boolean("is_phone_number").default(false),

  // OAuth logins
  googleId: varchar("google_id", { length: 255 }).unique(),
  instagramId: varchar("instagram_id", { length: 255 }).unique(),
  instagramMail: varchar("instagram_mail", { length: 255 }).unique(),
  

  isBlocked: boolean("is_active").notNull().default(false),
  dateOfBirth: timestamp("date_of_birth", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});
export const userRelations = relations(user, ({ many }) => ({
//   userStore: many(userStore),
//   subscriptions: many(subscription),
}));
