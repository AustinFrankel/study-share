-- Add missing upload_bonus_views column to monthly_view_limits table
ALTER TABLE monthly_view_limits ADD COLUMN IF NOT EXISTS upload_bonus_views int DEFAULT 0;

-- Update the RLS policy to allow upserts (needed for the grantViewsForAd function)
DROP POLICY IF EXISTS "Users can update their own view limits" ON monthly_view_limits;

CREATE POLICY "Users can insert their own view limits" ON monthly_view_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own view limits" ON monthly_view_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_view_limits_user_month ON monthly_view_limits(user_id, month_year);
