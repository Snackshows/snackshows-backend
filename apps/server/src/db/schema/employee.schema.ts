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

export const employeeRoleEnum = pgEnum("employeeRole", ["ADMIN", "EMPLOYEE"]);

//Employee
export const employee = pgTable("employee", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }), // only for admin or web users
  image: varchar("avatar", { length: 255 }),
  role: employeeRoleEnum().notNull().default("EMPLOYEE"),
  isBlocked: boolean("is_active").notNull().default(false),
  refreshToken: varchar("refresh_token"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});
export const employeeRelations = relations(employee, ({ many }) => ({
  //   userStore: many(userStore),
  //   subscriptions: many(subscription),
}));
