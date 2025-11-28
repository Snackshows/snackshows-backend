CREATE TABLE "employee" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"password" varchar(255),
	"avatar" varchar(255),
	"role" "userRole" DEFAULT 'EMPLOYEE' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"refresh_token" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_email_unique" UNIQUE("email")
);
