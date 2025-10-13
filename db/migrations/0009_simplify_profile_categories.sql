-- Migration: Add profileCategory and remove complex relationship fields
-- This migration simplifies the profile relationship system by replacing
-- the complex relatedToProfileId/relationshipType structure with a simple category system

-- 1. Add new profile_category column
ALTER TABLE profiles ADD COLUMN profile_category VARCHAR(20) DEFAULT 'other';

-- 2. Add is_main_profile column
ALTER TABLE profiles ADD COLUMN is_main_profile BOOLEAN DEFAULT false;

-- 3. Migrate existing relationshipType data to profile_category
UPDATE profiles SET profile_category =
  CASE relationshipType
    WHEN 'family' THEN 'family'
    WHEN 'friend' THEN 'friends'
    WHEN 'partner' THEN 'friends'
    WHEN 'child' THEN 'family'
    WHEN 'parent' THEN 'family'
    WHEN 'sibling' THEN 'family'
    WHEN 'colleague' THEN 'colleagues'
    WHEN 'relative' THEN 'family'
    ELSE 'other'
  END
WHERE relationshipType IS NOT NULL;

-- 4. Set default category for profiles without relationshipType (existing self profiles)
UPDATE profiles SET profile_category = 'self' WHERE relationshipType IS NULL OR relationshipType = '';

-- 5. Remove old relationship columns
ALTER TABLE profiles DROP COLUMN related_to_profile_id;
ALTER TABLE profiles DROP COLUMN relationship_type;

-- 6. Remove unused phone columns
ALTER TABLE profiles DROP COLUMN phone;
ALTER TABLE profiles DROP COLUMN phone_verified;

-- 7. Add index for the new profile_category column for better query performance
CREATE INDEX profiles_category_idx ON profiles USING btree (profile_category);

-- 8. Add index for is_main_profile column
CREATE INDEX profiles_main_profile_idx ON profiles USING btree (is_main_profile);

-- 9. Update existing indexes to remove references to deleted columns
DROP INDEX IF EXISTS profiles_related_to_idx;

--> statement-breakpoint
-- Migration completed. Profiles now use simple category system instead of complex relationships.
