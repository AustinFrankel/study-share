-- Add resource_id column to points_ledger table for tracking viewed resources
ALTER TABLE points_ledger ADD COLUMN resource_id uuid REFERENCES resources(id) ON DELETE SET NULL;

-- Create index for better performance when querying viewed resources
CREATE INDEX IF NOT EXISTS idx_points_ledger_resource_id ON points_ledger(resource_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_user_resource ON points_ledger(user_id, resource_id);
