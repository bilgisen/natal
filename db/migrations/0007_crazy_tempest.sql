ALTER TABLE "profiles" DROP CONSTRAINT "profiles_birth_place_id_birth_places_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_birth_place_id_birth_places_id_fk" FOREIGN KEY ("birth_place_id") REFERENCES "public"."birth_places"("id") ON DELETE set null ON UPDATE no action;