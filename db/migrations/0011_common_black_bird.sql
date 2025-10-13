CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"used_tokens" integer DEFAULT 0 NOT NULL,
	"monthly_quota" integer DEFAULT 50000 NOT NULL,
	"period_start" timestamp DEFAULT now() NOT NULL,
	"period_end" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_prompts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "ai_prompts" CASCADE;--> statement-breakpoint
ALTER TABLE "ai_reports" DROP CONSTRAINT "ai_reports_prompt_id_ai_prompts_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_user_idx" ON "ai_usage" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "ai_reports" DROP COLUMN "prompt_id";