-- Fix security definer view issue by recreating user_points view without SECURITY DEFINER
-- This ensures the view uses the permissions of the querying user, not the view creator

-- Drop existing view
DROP VIEW IF EXISTS user_points;

-- Recreate view without SECURITY DEFINER (defaults to SECURITY INVOKER)
CREATE VIEW user_points AS
SELECT
    user_id,
    SUM(delta) as total_points,
    COUNT(*) as transaction_count
FROM points_ledger
GROUP BY user_id;

-- Restore permissions
GRANT SELECT ON user_points TO anon, authenticated;
