CREATE TYPE "public"."cover_position" AS ENUM('nascosta', 'inizio', 'fine');--> statement-breakpoint
CREATE TYPE "public"."energy_class" AS ENUM('A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('bozza', 'pubblicato', 'archiviato');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('disponibile', 'venduto', 'affittato', 'riservato');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('vendita', 'affitto');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"messaggio" text NOT NULL,
	"fonte" text,
	"context_id" text,
	"newsletter" boolean DEFAULT false NOT NULL,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titolo" text NOT NULL,
	"sottotitolo" text,
	"slug" text NOT NULL,
	"cover" text,
	"cover_position" "cover_position" DEFAULT 'inizio' NOT NULL,
	"contenuto" text NOT NULL,
	"reading_time_min" integer,
	"tag" text[] DEFAULT ARRAY[]::text[],
	"categoria" text,
	"autore" text NOT NULL,
	"stato" "post_status" DEFAULT 'bozza' NOT NULL,
	"published_at" timestamp,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts_images" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"file_hash" text NOT NULL,
	"hot_url" text NOT NULL,
	"cold_key" text NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titolo" text NOT NULL,
	"descrizione" text NOT NULL,
	"prezzo" numeric(10, 2) NOT NULL,
	"tipo" "property_type" NOT NULL,
	"mq" integer NOT NULL,
	"stanze" integer NOT NULL,
	"bagni" integer NOT NULL,
	"piano" integer NOT NULL,
	"classe_energetica" "energy_class" NOT NULL,
	"zona" text NOT NULL,
	"stato" "property_status" DEFAULT 'disponibile' NOT NULL,
	"link_video" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "properties_images" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" varchar NOT NULL,
	"url_hot" text NOT NULL,
	"url_cold" text NOT NULL,
	"hash_file" text NOT NULL,
	"archiviato" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"nome" text,
	"blog_updates" boolean DEFAULT false NOT NULL,
	"new_listings" boolean DEFAULT false NOT NULL,
	"source" text,
	"consent_ts" timestamp DEFAULT now() NOT NULL,
	"consent_ip" text,
	"confirmed" boolean DEFAULT false NOT NULL,
	"confirm_token" text,
	"unsubscribe_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "posts_images" ADD CONSTRAINT "posts_images_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties_images" ADD CONSTRAINT "properties_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;