-- Test Waitlist Table for collecting emails from users interested in test materials

-- Create test_waitlist table
CREATE TABLE IF NOT EXISTS test_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_waitlist_test_id ON test_waitlist(test_id);
CREATE INDEX IF NOT EXISTS idx_test_waitlist_email ON test_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_test_waitlist_user_id ON test_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_test_waitlist_notified ON test_waitlist(notified) WHERE notified = FALSE;
CREATE INDEX IF NOT EXISTS idx_test_waitlist_created_at ON test_waitlist(created_at DESC);

-- Enable RLS
ALTER TABLE test_waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (join waitlist)
CREATE POLICY "Anyone can join waitlist"
  ON test_waitlist
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries"
  ON test_waitlist
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admins can view all waitlist entries
CREATE POLICY "Admins can view all waitlist entries"
  ON test_waitlist
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Test Resources Table (for linking uploaded test materials)
CREATE TABLE IF NOT EXISTS test_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  file_url TEXT,
  file_path TEXT,
  questions JSONB, -- Store questions in JSON format
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  uploader_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_resources_test_id ON test_resources(test_id);
CREATE INDEX IF NOT EXISTS idx_test_resources_created_at ON test_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_resources_uploader_id ON test_resources(uploader_id);

-- Enable RLS
ALTER TABLE test_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view test resources
CREATE POLICY "Anyone can view test resources"
  ON test_resources
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert test resources
CREATE POLICY "Authenticated users can insert test resources"
  ON test_resources
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can update their own resources
CREATE POLICY "Users can update own resources"
  ON test_resources
  FOR UPDATE
  USING (auth.uid() = uploader_id);

-- Test User Progress Table (track user progress through tests)
CREATE TABLE IF NOT EXISTS test_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  test_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer TEXT,
  is_correct BOOLEAN,
  time_spent INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, test_id, question_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_progress_user_test ON test_user_progress(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_test_progress_user_id ON test_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_test_progress_test_id ON test_user_progress(test_id);

-- Enable RLS
ALTER TABLE test_user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON test_user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON test_user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON test_user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

COMMENT ON TABLE test_waitlist IS 'Stores email signups for test waitlists';
COMMENT ON TABLE test_resources IS 'Stores test materials and questions';
COMMENT ON TABLE test_user_progress IS 'Tracks user progress through test questions';
