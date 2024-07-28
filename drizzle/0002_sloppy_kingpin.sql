CREATE TABLE IF NOT EXISTS "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"barcode" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"email" text NOT NULL,
	"external_auth_id" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "barcode" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "scanned_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "product_name" text;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "product_category" text;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "notes" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "barcode_idx" ON "products" USING btree ("barcode");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "external_auth_id_idx" ON "users" USING btree ("external_auth_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scans" ADD CONSTRAINT "scans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "scans" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "scans" DROP COLUMN IF EXISTS "name";