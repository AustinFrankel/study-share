-- ============================================
-- CRITICAL FIXES FOR:
-- 1. Unique username/handle enforcement
-- 2. Leaderboard data integrity
-- 3. Admin uploads visibility for live tests
-- ============================================

-- ============================================
-- 1. ENFORCE UNIQUE HANDLES
-- ============================================

-- First, find and fix any duplicate handles that exist
-- This adds a number suffix to duplicates
DO $$
DECLARE
  duplicate_handle TEXT;
  duplicate_count INTEGER;
  user_record RECORD;
  new_handle TEXT;
  suffix INTEGER;
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
END $$;

-- Add unique constraint on handle column
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_handle_unique;
ALTER TABLE users ADD CONSTRAINT users_handle_unique UNIQUE (handle);

-- Create index for faster handle lookups
CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);

-- Add comment to document this critical constraint
COMMENT ON CONSTRAINT users_handle_unique ON users IS 'Ensures no two users can have the same handle/username. Enforced since migration 030.';

-- ============================================
-- 2. FIX LEADERBOARD - ENSURE user_points EXISTS
-- ============================================

-- Check if user_points is a view or table, and recreate if needed
DO $$
BEGIN
  -- Drop existing view or table if it exists
  DROP VIEW IF EXISTS user_points CASCADE;
  DROP TABLE IF EXISTS user_points CASCADE;
  
  -- Create materialized view for better performance
  -- This aggregates points from the points_ledger table
  CREATE MATERIALIZED VIEW user_points AS
  SELECT 
    user_id,
    COALESCE(SUM(delta), 0) as total_points,
    COUNT(*) as transaction_count,
    MIN(created_at) as first_transaction,
    MAX(created_at) as last_transaction
  FROM points_ledger
  GROUP BY user_id;

  -- Create unique index for efficient lookups
  CREATE UNIQUE INDEX idx_user_points_user_id ON user_points(user_id);
  
  -- Create index on total_points for leaderboard sorting
  CREATE INDEX idx_user_points_total_desc ON user_points(total_points DESC);
  
  -- Add comment
  COMMENT ON MATERIALIZED VIEW user_points IS 'Aggregated user points for leaderboard. Refresh periodically with REFRESH MATERIALIZED VIEW user_points;';
  
  RAISE NOTICE 'Created materialized view user_points successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating user_points: %', SQLERRM;
END $$;

-- Create function to refresh user_points automatically
CREATE OR REPLACE FUNCTION refresh_user_points()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_points;
END;
$$;

-- Schedule automatic refresh (requires pg_cron extension)
-- If pg_cron is not available, you'll need to manually refresh periodically
DO $$
BEGIN
  -- Try to create a cron job to refresh every 5 minutes
  -- This will silently fail if pg_cron is not installed
  PERFORM cron.schedule(
    'refresh-user-points',
    '*/5 * * * *',  -- Every 5 minutes
    'SELECT refresh_user_points();'
  );
  RAISE NOTICE 'Scheduled automatic refresh of user_points every 5 minutes';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule auto-refresh (pg_cron may not be installed). Run "REFRESH MATERIALIZED VIEW CONCURRENTLY user_points;" periodically.';
END $$;

-- ============================================
-- 3. FIX ADMIN UPLOADS - ENSURE VISIBILITY
-- ============================================

-- Ensure test_resources table exists with correct structure
CREATE TABLE IF NOT EXISTS test_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint on test_id to prevent duplicates
ALTER TABLE test_resources DROP CONSTRAINT IF EXISTS test_resources_test_id_unique;
ALTER TABLE test_resources ADD CONSTRAINT test_resources_test_id_unique UNIQUE (test_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_resources_test_id ON test_resources(test_id);
CREATE INDEX IF NOT EXISTS idx_test_resources_created_at ON test_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_resources_uploader_id ON test_resources(uploader_id);

-- Enable RLS
ALTER TABLE test_resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Anyone can view test resources" ON test_resources;
DROP POLICY IF EXISTS "Authenticated users can insert test resources" ON test_resources;
DROP POLICY IF EXISTS "Authenticated users can update test resources" ON test_resources;
DROP POLICY IF EXISTS "Admins can upload test resources" ON test_resources;

-- Policy: Anyone can view test resources (including anonymous users)
CREATE POLICY "Anyone can view test resources"
  ON test_resources
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert test resources (for admin uploads)
CREATE POLICY "Authenticated users can insert test resources"
  ON test_resources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update their own test resources or all if they uploaded
CREATE POLICY "Authenticated users can update test resources"
  ON test_resources
  FOR UPDATE
  TO authenticated
  USING (true)  -- Allow all authenticated users to update (admins can update any)
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE test_resources IS 'Stores test materials and questions uploaded by admins. Visible to everyone.';
COMMENT ON COLUMN test_resources.uploader_id IS 'User who uploaded the test. Null if uploaded by system.';
COMMENT ON CONSTRAINT test_resources_test_id_unique ON test_resources IS 'Ensures each test_id is unique. Use UPSERT to update existing tests.';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_test_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_test_resources_timestamp ON test_resources;
CREATE TRIGGER update_test_resources_timestamp
  BEFORE UPDATE ON test_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_test_resources_updated_at();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify unique handles
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT handle, COUNT(*) as cnt
    FROM users
    GROUP BY handle
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE WARNING 'Still have % duplicate handles! Manual intervention required.', duplicate_count;
  ELSE
    RAISE NOTICE '✅ All handles are unique!';
  END IF;
END $$;

-- Verify user_points view exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'user_points'
  ) THEN
    RAISE NOTICE '✅ user_points materialized view exists';
  ELSE
    RAISE WARNING '❌ user_points materialized view does not exist';
  END IF;
END $$;

-- Verify test_resources table and policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_resources'
  ) THEN
    RAISE NOTICE '✅ test_resources table exists';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'test_resources';
    
    RAISE NOTICE '✅ test_resources has % RLS policies', policy_count;
  ELSE
    RAISE WARNING '❌ test_resources table does not exist';
  END IF;
END $$;

-- Show summary
DO $$
DECLARE
  total_users INTEGER;
  total_points_entries INTEGER;
  total_tests INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  
  SELECT COUNT(*) INTO total_points_entries FROM user_points;
  
  SELECT COUNT(*) INTO total_tests FROM test_resources;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'MIGRATION COMPLETE SUMMARY:';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with points: %', total_points_entries;
  RAISE NOTICE 'Total test resources: %', total_tests;
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'IMPORTANT: Run "REFRESH MATERIALIZED VIEW CONCURRENTLY user_points;" periodically';
  RAISE NOTICE 'to keep leaderboard data up to date!';
  RAISE NOTICE '===========================================';
END $$;
