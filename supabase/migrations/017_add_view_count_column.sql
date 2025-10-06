-- Add view_count column to resources table
ALTER TABLE resources 
ADD COLUMN view_count integer DEFAULT 0 NOT NULL;

-- Add difficulty column to resources table if it doesn't exist
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS difficulty integer DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5);

-- Create an index on view_count for performance
CREATE INDEX idx_resources_view_count ON resources(view_count DESC);

-- Create an index on difficulty for performance
CREATE INDEX idx_resources_difficulty ON resources(difficulty);
