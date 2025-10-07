-- CRITICAL: Run this SQL in your Supabase SQL Editor
-- This fixes all the 404 and 400 errors you're seeing

-- ============================================
-- 1. CREATE test_resources TABLE (for live tests)
-- ============================================
CREATE TABLE IF NOT EXISTS test_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL UNIQUE,
  test_name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_resources_test_id ON test_resources(test_id);
CREATE INDEX IF NOT EXISTS idx_test_resources_created_at ON test_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_resources_uploader_id ON test_resources(uploader_id);

-- Enable RLS
ALTER TABLE test_resources ENABLE ROW LEVEL SECURITY;

-- Policies (everyone can read, authenticated users can insert/update)
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
  USING (true);

COMMENT ON TABLE test_resources IS 'Stores test materials and questions';

-- ============================================
-- 2. CREATE notifications TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies (users can only see their own notifications)
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE notifications IS 'User notifications';

-- ============================================
-- 3. FIX user_points (it's a VIEW, not a table)
-- ============================================
-- Note: user_points is already a VIEW in your database
-- We don't need to create it or enable RLS on views
-- Views inherit security from their underlying tables

-- If you need to recreate the view, here's the typical structure:
-- (Only run this if the view doesn't exist or is broken)

-- CREATE OR REPLACE VIEW user_points AS
-- SELECT 
--   gen_random_uuid() as id,
--   user_id,
--   SUM(points) as total_points,
--   MIN(created_at) as created_at,
--   MAX(updated_at) as updated_at
-- FROM some_points_table
-- GROUP BY user_id;

-- Since it's already a view, we'll skip RLS setup
-- Views don't support RLS - they use the RLS of underlying tables

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything was created:

SELECT 'test_resources' as table_name, count(*) as row_count FROM test_resources
UNION ALL
SELECT 'notifications', count(*) FROM notifications
UNION ALL  
SELECT 'user_points (view)', count(*) FROM user_points;

-- Done! Your database should now be set up correctly.
-- Note: user_points is a VIEW, not a table, so it doesn't need RLS setup
