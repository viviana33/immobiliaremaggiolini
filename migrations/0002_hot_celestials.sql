ALTER TYPE "public"."property_status" ADD VALUE IF NOT EXISTS 'archiviato';--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "piano" SET DATA TYPE text USING piano::text;