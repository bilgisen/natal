DROP INDEX "profiles_user_id_idx";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "gender" varchar(20);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "about" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_main_profile" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "related_to_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "relationship_type" varchar(50);--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_main_idx" ON "profiles" USING btree ("user_id","is_main_profile");--> statement-breakpoint
CREATE INDEX "profiles_related_to_idx" ON "profiles" USING btree ("related_to_profile_id");--> statement-breakpoint
CREATE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id");