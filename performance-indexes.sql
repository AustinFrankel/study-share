-- ============================================================================
-- Performance Optimization Indexes
-- ============================================================================
-- This migration adds database indexes to improve query performance and
-- handle higher user loads. Apply this after your initial schema migration.
--
-- IMPORTANT: Run these commands one at a time in your Supabase SQL Editor
-- and monitor for any errors. Some indexes may already exist.
-- ============================================================================

-- Resources table indexes (most queried table)
-- ----------------------------------------------------------------------------

-- Index for ordering by created_at (used in homepage, search, browse)
CREATE INDEX IF NOT EXISTS idx_resources_created_at
ON resources(created_at DESC);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_resources_type
ON resources(type);

-- Index for uploader lookups (profile pages, permissions)
CREATE INDEX IF NOT EXISTS idx_resources_uploader_id
ON resources(uploader_id);

-- Composite index for class-based queries
CREATE INDEX IF NOT EXISTS idx_resources_class_id_created_at
ON resources(class_id, created_at DESC);

-- Full-text search index for title (PostgreSQL GIN index)
CREATE INDEX IF NOT EXISTS idx_resources_title_gin
ON resources USING gin(to_tsvector('english', title));


-- Votes table indexes (high write volume)
-- ----------------------------------------------------------------------------

-- Index for checking if user voted on a resource
CREATE INDEX IF NOT EXISTS idx_votes_resource_voter
ON votes(resource_id, voter_id);

-- Index for counting votes per resource
CREATE INDEX IF NOT EXISTS idx_votes_resource_id
ON votes(resource_id);

-- Index for finding all votes by a user
CREATE INDEX IF NOT EXISTS idx_votes_voter_id
ON votes(voter_id);

-- Index for vote value aggregation
CREATE INDEX IF NOT EXISTS idx_votes_value
ON votes(value);


-- Comments table indexes
-- ----------------------------------------------------------------------------

-- Index for fetching comments for a resource
CREATE INDEX IF NOT EXISTS idx_comments_resource_id_created
ON comments(resource_id, created_at DESC);

-- Index for user's comment history
CREATE INDEX IF NOT EXISTS idx_comments_author_id
ON comments(author_id);

-- Index for threaded comments (if parent_id exists)
CREATE INDEX IF NOT EXISTS idx_comments_parent_id
ON comments(parent_id) WHERE parent_id IS NOT NULL;


-- Files table indexes
-- ----------------------------------------------------------------------------

-- Index for fetching files for a resource
CREATE INDEX IF NOT EXISTS idx_files_resource_id
ON files(resource_id);

-- Index for file type filtering
CREATE INDEX IF NOT EXISTS idx_files_mime_type
ON files(mime);


-- Classes table indexes
-- ----------------------------------------------------------------------------

-- Index for school-based queries
CREATE INDEX IF NOT EXISTS idx_classes_school_id
ON classes(school_id);

-- Index for subject-based queries
CREATE INDEX IF NOT EXISTS idx_classes_subject_id
ON classes(subject_id);

-- Index for teacher-based queries
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id
ON classes(teacher_id);

-- Composite index for filtering by school and subject
CREATE INDEX IF NOT EXISTS idx_classes_school_subject
ON classes(school_id, subject_id);

-- Full-text search index for class title and code
CREATE INDEX IF NOT EXISTS idx_classes_title_code_gin
ON classes USING gin((title || ' ' || code) gin_trgm_ops);


-- Users table indexes
-- ----------------------------------------------------------------------------

-- Index for handle lookups (profile pages)
CREATE INDEX IF NOT EXISTS idx_users_handle
ON users(handle);

-- Index for sorting by points
CREATE INDEX IF NOT EXISTS idx_users_total_points
ON users(total_points DESC) WHERE total_points IS NOT NULL;


-- Points ledger indexes (activity tracking)
-- ----------------------------------------------------------------------------

-- Index for user activity queries
CREATE INDEX IF NOT EXISTS idx_points_ledger_user_created
ON points_ledger(user_id, created_at DESC);

-- Index for resource-specific point tracking
CREATE INDEX IF NOT EXISTS idx_points_ledger_resource_id
ON points_ledger(resource_id) WHERE resource_id IS NOT NULL;

-- Index for filtering by reason (upload bonuses, views, etc.)
CREATE INDEX IF NOT EXISTS idx_points_ledger_reason
ON points_ledger(reason);

-- Composite index for monthly upload bonus calculation
CREATE INDEX IF NOT EXISTS idx_points_ledger_user_reason_date
ON points_ledger(user_id, reason, created_at DESC);


-- Activity log indexes
-- ----------------------------------------------------------------------------

-- Index for user activity history
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created
ON activity_log(user_id, created_at DESC);

-- Index for action type filtering
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type
ON activity_log(action_type);


-- Resource ratings indexes
-- ----------------------------------------------------------------------------

-- Index for resource rating lookups
CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource
ON resource_ratings(resource_id);

-- Index for user's ratings
CREATE INDEX IF NOT EXISTS idx_resource_ratings_rater
ON resource_ratings(rater_id);

-- Unique index to prevent duplicate ratings
CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_ratings_unique
ON resource_ratings(resource_id, rater_id);


-- Monthly view limits indexes (access gating)
-- ----------------------------------------------------------------------------

-- Index for user monthly limit lookups
CREATE INDEX IF NOT EXISTS idx_monthly_view_limits_user_month
ON monthly_view_limits(user_id, month_year);

-- Unique index to prevent duplicate records
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_view_limits_unique
ON monthly_view_limits(user_id, month_year);


-- Flags table indexes (moderation)
-- ----------------------------------------------------------------------------

-- Index for fetching flags for a resource
CREATE INDEX IF NOT EXISTS idx_flags_resource_id
ON flags(resource_id);

-- Index for user's flagging history
CREATE INDEX IF NOT EXISTS idx_flags_flagger_id
ON flags(flagger_id);

-- Index for filtering by flag status
CREATE INDEX IF NOT EXISTS idx_flags_status
ON flags(status);


-- Resource tags indexes
-- ----------------------------------------------------------------------------

-- Index for tag-based resource queries
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag_id
ON resource_tags(tag_id);

-- Index for finding tags on a resource
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource_id
ON resource_tags(resource_id);


-- ============================================================================
-- Materialized Views (Optional - for heavy read workloads)
-- ============================================================================
-- These can significantly speed up complex aggregations
-- Refresh them periodically (e.g., every hour) using a cron job
-- ============================================================================

-- Precomputed resource vote counts
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_resource_vote_counts AS
SELECT
  resource_id,
  COUNT(*) as vote_count,
  SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) as upvote_count,
  SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) as downvote_count,
  SUM(value) as net_votes
FROM votes
GROUP BY resource_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_resource_vote_counts_resource
ON mv_resource_vote_counts(resource_id);

-- Precomputed resource ratings
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_resource_ratings AS
SELECT
  resource_id,
  COUNT(*) as rating_count,
  AVG(rating) as average_rating
FROM resource_ratings
GROUP BY resource_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_resource_ratings_resource
ON mv_resource_ratings(resource_id);

-- User leaderboard (top contributors)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_leaderboard AS
SELECT
  u.id,
  u.handle,
  u.avatar_url,
  COUNT(DISTINCT r.id) as upload_count,
  COALESCE(SUM(COALESCE(mvc.net_votes, 0)), 0) as total_net_votes,
  u.total_points
FROM users u
LEFT JOIN resources r ON r.uploader_id = u.id
LEFT JOIN mv_resource_vote_counts mvc ON mvc.resource_id = r.id
GROUP BY u.id, u.handle, u.avatar_url, u.total_points
ORDER BY u.total_points DESC NULLS LAST;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_leaderboard_id
ON mv_user_leaderboard(id);


-- ============================================================================
-- Refresh Functions (run these periodically)
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resource_vote_counts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resource_ratings;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh every hour (requires pg_cron extension)
-- Uncomment if you have pg_cron enabled:
-- SELECT cron.schedule('refresh-materialized-views', '0 * * * *', 'SELECT refresh_all_materialized_views()');


-- ============================================================================
-- Query Performance Monitoring
-- ============================================================================

-- Enable query statistics tracking (already enabled in most Supabase instances)
-- SELECT pg_stat_statements_reset(); -- Reset stats to start fresh

-- Query to find slow queries (run this to monitor performance)
-- SELECT
--   query,
--   calls,
--   total_exec_time / 1000 as total_seconds,
--   mean_exec_time / 1000 as avg_seconds
-- FROM pg_stat_statements
-- WHERE query NOT LIKE '%pg_stat%'
-- ORDER BY mean_exec_time DESC
-- LIMIT 20;


-- ============================================================================
-- Verify Indexes
-- ============================================================================

-- Run this to verify all indexes were created successfully:
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- ============================================================================
-- Performance Tips
-- ============================================================================
-- 1. Monitor query performance regularly using pg_stat_statements
-- 2. Refresh materialized views during low-traffic periods
-- 3. Consider partitioning large tables (e.g., activity_log) by date
-- 4. Use connection pooling (Supabase does this automatically)
-- 5. Add indexes incrementally and monitor impact
-- 6. Use EXPLAIN ANALYZE to test query plans before/after indexes
-- ============================================================================
