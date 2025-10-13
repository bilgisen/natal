-- Add sample_response column to ai_prompts
ALTER TABLE ai_prompts ADD COLUMN IF NOT EXISTS sample_response text;
