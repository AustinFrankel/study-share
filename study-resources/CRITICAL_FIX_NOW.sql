-- CRITICAL FIX: Run this SQL in your Supabase SQL Editor
-- This fixes avatar_url column issue and test_resources duplicate issues

-- 1. Add avatar_url column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        COMMENT ON COLUMN users.avatar_url IS 'URL to user profile picture';
    END IF;
END $$;

-- 2. Fix test_resources table - ensure unique constraint and proper policies
-- First, remove duplicates keeping the most recent
DELETE FROM test_resources a
USING test_resources b
WHERE a.test_id = b.test_id
  AND a.id < b.id;

-- Add unique constraint on test_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'test_resources_test_id_unique'
    ) THEN
        ALTER TABLE test_resources
        ADD CONSTRAINT test_resources_test_id_unique UNIQUE (test_id);
    END IF;
END $$;

-- 3. Update RLS policies for test_resources
DROP POLICY IF EXISTS "Anyone can view test resources" ON test_resources;
DROP POLICY IF EXISTS "Authenticated users can insert test resources" ON test_resources;
DROP POLICY IF EXISTS "Users can update own resources" ON test_resources;
DROP POLICY IF EXISTS "Authenticated users can update test resources" ON test_resources;

-- Create proper policies
CREATE POLICY "Anyone can view test resources"
  ON test_resources
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert test resources"
  ON test_resources
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update test resources"
  ON test_resources
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Verify the fixes
SELECT 'avatar_url column exists: ' ||
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN 'YES ✓' ELSE 'NO ✗' END as status
UNION ALL
SELECT 'test_resources unique constraint exists: ' ||
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'test_resources_test_id_unique'
  ) THEN 'YES ✓' ELSE 'NO ✗' END;

-- 5. Show current test_resources data
SELECT test_id, test_name,
  CASE
    WHEN questions IS NOT NULL THEN jsonb_array_length(questions)
    ELSE 0
  END as question_count,
  created_at, updated_at
FROM test_resources
ORDER BY updated_at DESC;
