-- Drop the unique constraint first
DROP INDEX IF EXISTS profiles_user_main_idx;

-- Then drop the column
ALTER TABLE profiles DROP COLUMN IF EXISTS is_main_profile;
