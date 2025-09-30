CREATE TABLE "ai_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"system_id" integer,
	"title" varchar(200),
	"template" text NOT NULL,
	"variables" jsonb,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chart_id" uuid,
	"system_id" integer,
	"report_type" varchar(50),
	"content" text,
	"metadata" jsonb,
	"prompt_id" uuid,
	"is_public" boolean DEFAULT false,
	"target_sign" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "astrology_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	CONSTRAINT "astrology_systems_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "birth_places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country" varchar(100),
	"city" varchar(200),
	"lat" numeric(10, 6),
	"lon" numeric(10, 6),
	"tz" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "natal_charts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"owner_user_id" text NOT NULL,
	"subject_name" varchar(150),
	"subject_birth_date" date,
	"subject_birth_time" time,
	"subject_birth_place_id" uuid,
	"system_id" integer NOT NULL,
	"astro_snapshot" jsonb,
	"sun_sign" varchar(50),
	"ascendant" varchar(50),
	"moon_sign" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(50),
	"channel" varchar(30),
	"enabled" boolean DEFAULT true,
	"next_send_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "priorities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"importance" smallint DEFAULT 3 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"display_name" varchar(150),
	"birth_date" date,
	"birth_time" time,
	"birth_place_id" uuid,
	"timezone" varchar(64),
	"phone" varchar(40),
	"phone_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_system_id_astrology_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."astrology_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_chart_id_natal_charts_id_fk" FOREIGN KEY ("chart_id") REFERENCES "public"."natal_charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_system_id_astrology_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."astrology_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_prompt_id_ai_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."ai_prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "natal_charts" ADD CONSTRAINT "natal_charts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "natal_charts" ADD CONSTRAINT "natal_charts_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "natal_charts" ADD CONSTRAINT "natal_charts_subject_birth_place_id_birth_places_id_fk" FOREIGN KEY ("subject_birth_place_id") REFERENCES "public"."birth_places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "natal_charts" ADD CONSTRAINT "natal_charts_system_id_astrology_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."astrology_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "priorities" ADD CONSTRAINT "priorities_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_birth_place_id_birth_places_id_fk" FOREIGN KEY ("birth_place_id") REFERENCES "public"."birth_places"("id") ON DELETE no action ON UPDATE no action;