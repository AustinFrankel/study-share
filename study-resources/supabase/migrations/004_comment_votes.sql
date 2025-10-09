-- Comment votes table for like/dislike on comments
CREATE TABLE IF NOT EXISTS comment_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  voter_id uuid REFERENCES users(id),
  value int CHECK (value IN (-1, 1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, voter_id)
);

-- Enable RLS with permissive policies for development
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read votes
CREATE POLICY IF NOT EXISTS comment_votes_read ON comment_votes
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own vote
CREATE POLICY IF NOT EXISTS comment_votes_insert ON comment_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Allow users to update/delete their own vote
CREATE POLICY IF NOT EXISTS comment_votes_update ON comment_votes
  FOR UPDATE USING (auth.uid() = voter_id);

CREATE POLICY IF NOT EXISTS comment_votes_delete ON comment_votes
  FOR DELETE USING (auth.uid() = voter_id);

