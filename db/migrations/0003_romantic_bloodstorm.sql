ALTER TABLE "birth_places" ALTER COLUMN "country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_places" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_places" ALTER COLUMN "lat" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_places" ALTER COLUMN "lon" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_places" ALTER COLUMN "tz" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_places" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_places" ADD COLUMN "language" varchar(10) DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "birth_places" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_places" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_places" ADD CONSTRAINT "birth_places_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;