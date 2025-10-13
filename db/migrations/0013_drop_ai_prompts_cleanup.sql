-- Cleanup migration: remove ai_prompts usage since prompts are now code-based

-- Drop foreign key and column from ai_reports if it exists
ALTER TABLE ai_reports DROP COLUMN IF EXISTS prompt_id;

-- Drop ai_prompts table if it exists
DROP TABLE IF EXISTS ai_prompts CASCADE;

-- Optionally drop related indexes if they still exist
DROP INDEX IF EXISTS ai_prompts_key_idx;
DROP INDEX IF EXISTS ai_prompts_system_id_idx;
DROP INDEX IF EXISTS ai_prompts_version_idx;
