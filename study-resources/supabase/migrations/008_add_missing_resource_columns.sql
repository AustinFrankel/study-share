-- Add missing columns to resources table for difficulty and study time
ALTER TABLE resources ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS study_time INTEGER DEFAULT 30; -- in minutes

-- Update files table to use consistent naming
ALTER TABLE files ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS size BIGINT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS path TEXT;

-- Update existing files to use new schema
UPDATE files SET 
    name = original_filename,
    type = mime,
    path = storage_path
WHERE name IS NULL;

-- Add index for difficulty for filtering
CREATE INDEX IF NOT EXISTS idx_resources_difficulty ON resources (difficulty);
CREATE INDEX IF NOT EXISTS idx_resources_study_time ON resources (study_time);
