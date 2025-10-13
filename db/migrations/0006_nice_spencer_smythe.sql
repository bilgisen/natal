DROP INDEX "profiles_user_main_idx";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "about";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "is_main_profile";