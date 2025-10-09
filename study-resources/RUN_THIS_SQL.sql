-- ============================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- Copy and paste this entire file into the SQL Editor
-- Then click "RUN" or press Ctrl+Enter
-- ============================================

-- Step 1: Fix any duplicate handles
DO $$
DECLARE
  duplicate_handle TEXT;
  user_record RECORD;
  new_handle TEXT;
  suffix INTEGER;
  duplicate_count INTEGER;
BEGIN
  -- Find handles that have duplicates
  FOR duplicate_handle IN 
    SELECT handle 
    FROM users 
    GROUP BY handle 
    HAVING COUNT(*) > 1
  LOOP
    suffix := 1;
    -- For each duplicate, update all but the first one
    FOR user_record IN 
      SELECT id, handle, created_at 
      FROM users 
      WHERE handle = duplicate_handle 
      ORDER BY created_at ASC
      OFFSET 1  -- Keep the first one unchanged
    LOOP
      -- Generate a unique handle with suffix
      LOOP
        new_handle := duplicate_handle || '-' || suffix;
        -- Check if this new handle already exists
        SELECT COUNT(*) INTO duplicate_count FROM users WHERE handle = new_handle;
        IF duplicate_count = 0 THEN
          -- Update the user with the new unique handle
          UPDATE users 
          SET handle = new_handle, 
              handle_version = handle_version + 1
          WHERE id = user_record.id;
          RAISE NOTICE 'Updated user % from handle % to %', user_record.id, duplicate_handle, new_handle;
          EXIT;
        END IF;
        suffix := suffix + 1;
      END LOOP;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '✅ Step 1 Complete: Fixed duplicate handles';
END $$;

-- Step 2: Add unique constraint on handle
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_handle_unique;
ALTER TABLE users ADD CONSTRAINT users_handle_unique UNIQUE (handle);
CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
COMMENT ON CONSTRAINT users_handle_unique ON users IS 'Ensures no two users can have the same handle/username';

-- Verify Step 2
DO $$
BEGIN
  RAISE NOTICE '✅ Step 2 Complete: Added unique constraint on handles';
END $$;

-- Step 3: Create user_points materialized view for leaderboard
-- First, drop materialized view if it exists (must come first!)
DROP MATERIALIZED VIEW IF EXISTS user_points CASCADE;
-- Then drop the regular view if it exists
DROP VIEW IF EXISTS user_points CASCADE;

-- Create the materialized view
CREATE MATERIALIZED VIEW user_points AS
SELECT 
  user_id,
  COALESCE(SUM(delta), 0) as total_points,
  COUNT(*) as transaction_count,
  MIN(created_at) as first_transaction,
  MAX(created_at) as last_transaction
FROM points_ledger
GROUP BY user_id;

CREATE UNIQUE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_points_total_desc ON user_points(total_points DESC);

-- Verify Step 3
DO $$
BEGIN
  RAISE NOTICE '✅ Step 3 Complete: Created user_points materialized view';
END $$;

-- Step 4: Create refresh function for leaderboard
CREATE OR REPLACE FUNCTION refresh_user_points()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_points;
END;
$$;

-- Verify Step 4
DO $$
BEGIN
  RAISE NOTICE '✅ Step 4 Complete: Created refresh function';
END $$;

-- Step 5: Ensure test_resources table exists with correct structure
CREATE TABLE IF NOT EXISTS test_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint on test_id
ALTER TABLE test_resources DROP CONSTRAINT IF EXISTS test_resources_test_id_unique;
ALTER TABLE test_resources ADD CONSTRAINT test_resources_test_id_unique UNIQUE (test_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_resources_test_id ON test_resources(test_id);
CREATE INDEX IF NOT EXISTS idx_test_resources_created_at ON test_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_resources_uploader_id ON test_resources(uploader_id);

-- Verify Step 5
DO $$
BEGIN
  RAISE NOTICE '✅ Step 5 Complete: test_resources table ready';
END $$;

-- Step 6: Enable RLS on test_resources
ALTER TABLE test_resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view test resources" ON test_resources;
DROP POLICY IF EXISTS "Authenticated users can insert test resources" ON test_resources;
DROP POLICY IF EXISTS "Authenticated users can update test resources" ON test_resources;

-- Create RLS policies
CREATE POLICY "Anyone can view test resources"
  ON test_resources
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert test resources"
  ON test_resources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update test resources"
  ON test_resources
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify Step 6
DO $$
BEGIN
  RAISE NOTICE '✅ Step 6 Complete: RLS policies configured';
END $$;

-- Step 7: Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_test_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_test_resources_timestamp ON test_resources;
CREATE TRIGGER update_test_resources_timestamp
  BEFORE UPDATE ON test_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_test_resources_updated_at();

-- Verify Step 7
DO $$
BEGIN
  RAISE NOTICE '✅ Step 7 Complete: Auto-update trigger created';
END $$;

-- ============================================
-- FINAL VERIFICATION
-- ============================================
DO $$
DECLARE
  total_users INTEGER;
  duplicate_handles INTEGER;
  total_points_entries INTEGER;
  total_tests INTEGER;
  policy_count INTEGER;
BEGIN
  -- Check for duplicate handles
  SELECT COUNT(*) INTO duplicate_handles
  FROM (
    SELECT handle, COUNT(*) as cnt
    FROM users
    GROUP BY handle
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_handles > 0 THEN
    RAISE WARNING '⚠️  Still have % duplicate handles! Manual intervention required.', duplicate_handles;
  ELSE
    RAISE NOTICE '✅ All handles are unique!';
  END IF;
  
  -- Check user_points exists
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'user_points'
  ) THEN
    SELECT COUNT(*) INTO total_points_entries FROM user_points;
    RAISE NOTICE '✅ user_points exists with % entries', total_points_entries;
  ELSE
    RAISE WARNING '❌ user_points materialized view does not exist';
  END IF;
  
  -- Check test_resources
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_resources'
  ) THEN
    SELECT COUNT(*) INTO total_tests FROM test_resources;
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'test_resources';
    RAISE NOTICE '✅ test_resources exists with % tests and % RLS policies', total_tests, policy_count;
  ELSE
    RAISE WARNING '❌ test_resources table does not exist';
  END IF;
  
  SELECT COUNT(*) INTO total_users FROM users;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE '🎉 MIGRATION COMPLETE!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with points: %', total_points_entries;
  RAISE NOTICE 'Total test resources: %', total_tests;
  RAISE NOTICE '===========================================';
  RAISE NOTICE '📝 IMPORTANT: Run this command periodically to refresh leaderboard:';
  RAISE NOTICE '   REFRESH MATERIALIZED VIEW CONCURRENTLY user_points;';
  RAISE NOTICE '===========================================';
END $$;
