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
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age"),
  gender: genderEnum(),
  avatar: varchar("avatar", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),

  // Mobile Auth
  phone: varchar("phone", { length: 20 }).unique(),
  otp: varchar("otp", { length: 6 }), // store latest OTP
  otpExpiresAt: timestamp("otp_expires_at"), // OTP expiry time

  // OAuth logins
  googleId: varchar("google_id", { length: 255 }).unique(),
  googleMail: varchar("google_mail", { length: 255 }).unique(),
  instagramId: varchar("instagram_id", { length: 255 }).unique(),
  instagramMail: varchar("instagram_mail", { length: 255 }).unique(),
  

  isBlocked: boolean("is_active").notNull().default(false),
  dateOfBirth: timestamp("date_of_birth", { mode: "string" }),
  refreshToken: varchar("refresh_token"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});
export const userRelations = relations(user, ({ many }) => ({
//   userStore: many(userStore),
//   subscriptions: many(subscription),
}));
