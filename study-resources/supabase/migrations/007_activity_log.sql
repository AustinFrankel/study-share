-- Create activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'upload', 'delete', 'comment', 'vote', etc.
    resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
    resource_title TEXT, -- Store title in case resource is deleted
    points_change INTEGER DEFAULT 0, -- Points gained/lost from this action
    metadata JSONB, -- Additional action-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX idx_activity_log_action_type ON activity_log(action_type);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert activity logs
CREATE POLICY "System can insert activity logs" ON activity_log
    FOR INSERT WITH CHECK (true);

-- System can delete old activity logs (for cleanup)
CREATE POLICY "System can delete old activity logs" ON activity_log
    FOR DELETE USING (true);
