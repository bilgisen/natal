ALTER TABLE "profiles" ADD COLUMN "is_main_profile" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "profiles_main_profile_idx" ON "profiles" USING btree ("is_main_profile");--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "phone_verified";