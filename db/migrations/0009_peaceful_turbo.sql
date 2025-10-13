DROP INDEX "profiles_related_to_idx";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profile_category" varchar(20) DEFAULT 'self' NOT NULL;--> statement-breakpoint
CREATE INDEX "profiles_category_idx" ON "profiles" USING btree ("profile_category");--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "related_to_profile_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "relationship_type";