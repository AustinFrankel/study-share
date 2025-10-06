-- Run this SQL in your Supabase SQL Editor to set up the live test system

-- Create the tables if they don't exist
CREATE TABLE IF NOT EXISTS test_waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id text NOT NULL,
  test_name text NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  notified boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS live_test_uploads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id text NOT NULL,
  test_name text NOT NULL,
  uploader_id uuid REFERENCES users(id) ON DELETE SET NULL,
  upload_type text CHECK (upload_type IN ('image', 'text')),
  content text,
  image_urls text[],
  created_at timestamptz DEFAULT now(),
  approved boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS test_purchases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  test_id text NOT NULL,
  test_name text NOT NULL,
  amount decimal(10,2) NOT NULL,
  paid_at timestamptz DEFAULT now(),
  UNIQUE(user_id, test_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_waitlist_test_id ON test_waitlist(test_id);
CREATE INDEX IF NOT EXISTS idx_test_waitlist_email ON test_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_live_test_uploads_test_id ON live_test_uploads(test_id);
CREATE INDEX IF NOT EXISTS idx_test_purchases_user_id ON test_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_test_purchases_test_id ON test_purchases(test_id);

-- Enable RLS
ALTER TABLE test_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_test_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS test_waitlist_read ON test_waitlist;
DROP POLICY IF EXISTS test_waitlist_insert ON test_waitlist;
DROP POLICY IF EXISTS live_test_uploads_read ON live_test_uploads;
DROP POLICY IF EXISTS live_test_uploads_insert ON live_test_uploads;
DROP POLICY IF EXISTS live_test_uploads_update_own ON live_test_uploads;
DROP POLICY IF EXISTS test_purchases_read_own ON test_purchases;
DROP POLICY IF EXISTS test_purchases_insert_own ON test_purchases;

-- Create RLS Policies
CREATE POLICY test_waitlist_read ON test_waitlist
  FOR SELECT USING (true);

CREATE POLICY test_waitlist_insert ON test_waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY live_test_uploads_read ON live_test_uploads
  FOR SELECT USING (approved = true);

CREATE POLICY live_test_uploads_insert ON live_test_uploads
  FOR INSERT WITH CHECK (true);

CREATE POLICY live_test_uploads_update_own ON live_test_uploads
  FOR UPDATE USING (auth.uid() = uploader_id);

CREATE POLICY test_purchases_read_own ON test_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY test_purchases_insert_own ON test_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- After running this SQL, go to Storage in Supabase Dashboard:
-- 1. Create a bucket named "resources" if it doesn't exist
-- 2. Make it public
-- 3. Set the file size limit to 50MB
-- 4. Add this policy for public read access:
--    - Policy name: Public read access
--    - Allowed operations: SELECT
--    - Policy definition: true
