-- Add star rating system for resources
CREATE TABLE IF NOT EXISTS resource_ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  rater_id uuid REFERENCES users(id),
  rating int CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(resource_id, rater_id)
);

-- Add comment flags table for reporting
CREATE TABLE IF NOT EXISTS comment_flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  flagger_id uuid REFERENCES users(id),
  reason text CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'misinformation', 'other')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, flagger_id)
);

-- Add monthly view tracking table
CREATE TABLE IF NOT EXISTS monthly_view_limits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  month_year text NOT NULL, -- Format: YYYY-MM
  views_used int DEFAULT 0,
  ads_watched int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Add average rating column to resources
ALTER TABLE resources ADD COLUMN IF NOT EXISTS average_rating decimal(3,2) DEFAULT NULL;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS rating_count int DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_view_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for resource_ratings
CREATE POLICY "Resource ratings are viewable by everyone" ON resource_ratings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate resources" ON resource_ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can update their own ratings" ON resource_ratings
  FOR UPDATE USING (auth.uid() = rater_id);

CREATE POLICY "Users can delete their own ratings" ON resource_ratings
  FOR DELETE USING (auth.uid() = rater_id);

-- RLS policies for comment_flags
CREATE POLICY "Comment flags are viewable by everyone" ON comment_flags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can flag comments" ON comment_flags
  FOR INSERT WITH CHECK (auth.uid() = flagger_id);

-- RLS policies for monthly_view_limits
CREATE POLICY "Users can view their own view limits" ON monthly_view_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own view limits" ON monthly_view_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own view limits" ON monthly_view_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource_id ON resource_ratings(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_ratings_rater_id ON resource_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_comment_flags_comment_id ON comment_flags(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_flags_flagger_id ON comment_flags(flagger_id);
CREATE INDEX IF NOT EXISTS idx_monthly_view_limits_user_month ON monthly_view_limits(user_id, month_year);

-- Function to update resource average rating
CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the average rating and count for the resource
  UPDATE resources 
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2) 
      FROM resource_ratings 
      WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM resource_ratings 
      WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    )
  WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update resource ratings
DROP TRIGGER IF EXISTS trigger_update_resource_rating_insert ON resource_ratings;
CREATE TRIGGER trigger_update_resource_rating_insert
  AFTER INSERT ON resource_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_rating();

DROP TRIGGER IF EXISTS trigger_update_resource_rating_update ON resource_ratings;
CREATE TRIGGER trigger_update_resource_rating_update
  AFTER UPDATE ON resource_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_rating();

DROP TRIGGER IF EXISTS trigger_update_resource_rating_delete ON resource_ratings;
CREATE TRIGGER trigger_update_resource_rating_delete
  AFTER DELETE ON resource_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_rating();
