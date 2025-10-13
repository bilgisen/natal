CREATE TABLE "astro_aspects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"natal_chart_id" uuid NOT NULL,
	"planet1_id" uuid NOT NULL,
	"planet2_id" uuid NOT NULL,
	"aspect_name" varchar(50) NOT NULL,
	"aspect_degree" numeric(8, 4) NOT NULL,
	"orb" numeric(6, 4) NOT NULL,
	"orb_applied" numeric(6, 4),
	"strength" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "astro_houses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"natal_chart_id" uuid NOT NULL,
	"house_number" integer NOT NULL,
	"sign" varchar(10) NOT NULL,
	"cusp_position" numeric(12, 8) NOT NULL,
	"house_lord" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "astro_planets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"natal_chart_id" uuid NOT NULL,
	"planet_name" varchar(30) NOT NULL,
	"sign" varchar(10) NOT NULL,
	"position" numeric(12, 8) NOT NULL,
	"abs_position" numeric(12, 8) NOT NULL,
	"house" integer NOT NULL,
	"element" varchar(20),
	"quality" varchar(20),
	"retrograde" boolean DEFAULT false,
	"emoji" varchar(10),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lunar_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"natal_chart_id" uuid NOT NULL,
	"degrees_between_sun_moon" numeric(8, 4) NOT NULL,
	"moon_phase" numeric(5, 2) NOT NULL,
	"sun_phase" numeric(5, 2) NOT NULL,
	"moon_emoji" varchar(10),
	"moon_phase_name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "birth_places" DROP CONSTRAINT "birth_places_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "natal_charts" ADD COLUMN "zodiac_type" varchar(20) DEFAULT 'Tropical';--> statement-breakpoint
ALTER TABLE "natal_charts" ADD COLUMN "houses_system" varchar(50) DEFAULT 'Placidus';--> statement-breakpoint
ALTER TABLE "natal_charts" ADD COLUMN "perspective_type" varchar(50) DEFAULT 'Apparent Geocentric';--> statement-breakpoint
ALTER TABLE "natal_charts" ADD COLUMN "sidereal_mode" varchar(50);--> statement-breakpoint
ALTER TABLE "natal_charts" ADD COLUMN "calculated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "natal_charts" ADD COLUMN "calculation_provider" varchar(50);--> statement-breakpoint
ALTER TABLE "astro_aspects" ADD CONSTRAINT "astro_aspects_natal_chart_id_natal_charts_id_fk" FOREIGN KEY ("natal_chart_id") REFERENCES "public"."natal_charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astro_aspects" ADD CONSTRAINT "astro_aspects_planet1_id_astro_planets_id_fk" FOREIGN KEY ("planet1_id") REFERENCES "public"."astro_planets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astro_aspects" ADD CONSTRAINT "astro_aspects_planet2_id_astro_planets_id_fk" FOREIGN KEY ("planet2_id") REFERENCES "public"."astro_planets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astro_houses" ADD CONSTRAINT "astro_houses_natal_chart_id_natal_charts_id_fk" FOREIGN KEY ("natal_chart_id") REFERENCES "public"."natal_charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astro_planets" ADD CONSTRAINT "astro_planets_natal_chart_id_natal_charts_id_fk" FOREIGN KEY ("natal_chart_id") REFERENCES "public"."natal_charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lunar_phases" ADD CONSTRAINT "lunar_phases_natal_chart_id_natal_charts_id_fk" FOREIGN KEY ("natal_chart_id") REFERENCES "public"."natal_charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "astro_aspects_chart_aspect_idx" ON "astro_aspects" USING btree ("natal_chart_id","aspect_name");--> statement-breakpoint
CREATE UNIQUE INDEX "astro_aspects_planets_idx" ON "astro_aspects" USING btree ("planet1_id","planet2_id","aspect_name");--> statement-breakpoint
CREATE INDEX "astro_aspects_natal_chart_idx" ON "astro_aspects" USING btree ("natal_chart_id");--> statement-breakpoint
CREATE INDEX "astro_aspects_name_idx" ON "astro_aspects" USING btree ("aspect_name");--> statement-breakpoint
CREATE UNIQUE INDEX "astro_houses_chart_house_idx" ON "astro_houses" USING btree ("natal_chart_id","house_number");--> statement-breakpoint
CREATE INDEX "astro_houses_natal_chart_idx" ON "astro_houses" USING btree ("natal_chart_id");--> statement-breakpoint
CREATE INDEX "astro_houses_number_idx" ON "astro_houses" USING btree ("house_number");--> statement-breakpoint
CREATE UNIQUE INDEX "astro_planets_chart_planet_idx" ON "astro_planets" USING btree ("natal_chart_id","planet_name");--> statement-breakpoint
CREATE INDEX "astro_planets_natal_chart_idx" ON "astro_planets" USING btree ("natal_chart_id");--> statement-breakpoint
CREATE INDEX "astro_planets_name_idx" ON "astro_planets" USING btree ("planet_name");--> statement-breakpoint
CREATE INDEX "astro_planets_house_idx" ON "astro_planets" USING btree ("house");--> statement-breakpoint
CREATE INDEX "astro_planets_sign_idx" ON "astro_planets" USING btree ("sign");--> statement-breakpoint
CREATE UNIQUE INDEX "lunar_phases_chart_idx" ON "lunar_phases" USING btree ("natal_chart_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_user_provider_idx" ON "account" USING btree ("userId","providerId");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_prompts_key_idx" ON "ai_prompts" USING btree ("key");--> statement-breakpoint
CREATE INDEX "ai_prompts_system_id_idx" ON "ai_prompts" USING btree ("system_id");--> statement-breakpoint
CREATE INDEX "ai_prompts_version_idx" ON "ai_prompts" USING btree ("version");--> statement-breakpoint
CREATE INDEX "ai_reports_chart_id_idx" ON "ai_reports" USING btree ("chart_id");--> statement-breakpoint
CREATE INDEX "ai_reports_system_id_idx" ON "ai_reports" USING btree ("system_id");--> statement-breakpoint
CREATE INDEX "ai_reports_type_idx" ON "ai_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "ai_reports_public_idx" ON "ai_reports" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "ai_reports_target_sign_idx" ON "ai_reports" USING btree ("target_sign");--> statement-breakpoint
CREATE INDEX "ai_reports_created_at_idx" ON "ai_reports" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "astrology_systems_key_idx" ON "astrology_systems" USING btree ("key");--> statement-breakpoint
CREATE INDEX "birth_places_city_country_idx" ON "birth_places" USING btree ("city","country");--> statement-breakpoint
CREATE INDEX "birth_places_coordinates_idx" ON "birth_places" USING btree ("lat","lon");--> statement-breakpoint
CREATE INDEX "birth_places_country_idx" ON "birth_places" USING btree ("country");--> statement-breakpoint
CREATE INDEX "natal_charts_profile_id_idx" ON "natal_charts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "natal_charts_owner_user_id_idx" ON "natal_charts" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "natal_charts_birth_date_idx" ON "natal_charts" USING btree ("subject_birth_date");--> statement-breakpoint
CREATE INDEX "natal_charts_sun_sign_idx" ON "natal_charts" USING btree ("sun_sign");--> statement-breakpoint
CREATE INDEX "natal_charts_ascendant_idx" ON "natal_charts" USING btree ("ascendant");--> statement-breakpoint
CREATE INDEX "natal_charts_system_id_idx" ON "natal_charts" USING btree ("system_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_channel_idx" ON "notifications" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "notifications_enabled_idx" ON "notifications" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "notifications_next_send_at_idx" ON "notifications" USING btree ("next_send_at");--> statement-breakpoint
CREATE UNIQUE INDEX "priorities_profile_key_idx" ON "priorities" USING btree ("profile_id","key");--> statement-breakpoint
CREATE INDEX "priorities_profile_idx" ON "priorities" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "priorities_importance_idx" ON "priorities" USING btree ("importance");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profiles_birth_date_idx" ON "profiles" USING btree ("birth_date");--> statement-breakpoint
CREATE INDEX "profiles_birth_place_idx" ON "profiles" USING btree ("birth_place_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "subscription_user_id_idx" ON "subscription" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "subscription_status_idx" ON "subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_customer_id_idx" ON "subscription" USING btree ("customerId");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expiresAt");--> statement-breakpoint
ALTER TABLE "birth_places" DROP COLUMN "user_id";