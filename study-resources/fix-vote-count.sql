-- Fix missing vote_count column issue
-- Run this in your Supabase SQL Editor

-- Step 1: Create materialized view for vote counts
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_resource_vote_counts AS
SELECT
  resource_id,
  COUNT(*) as vote_count,
  SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) as upvote_count,
  SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) as downvote_count,
  SUM(value) as net_votes
FROM votes
GROUP BY resource_id;

-- Step 2: Create unique index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_resource_vote_counts_resource
ON mv_resource_vote_counts(resource_id);

-- Step 3: Create a function to get vote counts for resources
CREATE OR REPLACE FUNCTION get_resource_vote_counts(resource_ids uuid[])
RETURNS TABLE(resource_id uuid, vote_count bigint, upvote_count bigint, downvote_count bigint, net_votes bigint)
LANGUAGE sql
AS $$
  SELECT 
    COALESCE(mvc.resource_id, r.id) as resource_id,
    COALESCE(mvc.vote_count, 0) as vote_count,
    COALESCE(mvc.upvote_count, 0) as upvote_count,
    COALESCE(mvc.downvote_count, 0) as downvote_count,
    COALESCE(mvc.net_votes, 0) as net_votes
  FROM unnest(resource_ids) as r(id)
  LEFT JOIN mv_resource_vote_counts mvc ON mvc.resource_id = r.id;
$$;

-- Step 4: Refresh the materialized view
REFRESH MATERIALIZED VIEW mv_resource_vote_counts;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_votes_resource_voter ON votes(resource_id, voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_resource_id ON votes(resource_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);

-- Verification query
SELECT 'Materialized view created successfully' as status;
SELECT COUNT(*) as vote_count_entries FROM mv_resource_vote_counts;
