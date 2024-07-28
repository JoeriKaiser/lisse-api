CREATE TABLE IF NOT EXISTS "example_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"name" varchar(255) NOT NULL
);
