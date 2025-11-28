ALTER TABLE "employee" ALTER COLUMN "role" SET DATA TYPE "public"."employeeRole";--> statement-breakpoint
ALTER TABLE "employee" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';