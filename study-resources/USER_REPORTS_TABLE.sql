-- Create user_reports table for reporting users
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  CHECK (reporter_id != reported_user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_reports
-- Users can submit reports
CREATE POLICY "Users can submit reports" ON user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own submitted reports
CREATE POLICY "Users can view own reports" ON user_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Admins/Moderators can view all reports (you'll need to add role checking)
-- For now, this is commented out - you can uncomment when you have admin roles set up
-- CREATE POLICY "Admins can view all reports" ON user_reports
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );

COMMENT ON TABLE user_reports IS 'Stores reports submitted by users against other users';
COMMENT ON COLUMN user_reports.status IS 'Status of the report: pending, reviewed, action_taken, dismissed';
