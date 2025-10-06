-- Add subtitle column to resources table
ALTER TABLE resources ADD COLUMN subtitle TEXT;

-- Add comment for documentation
COMMENT ON COLUMN resources.subtitle IS 'Optional detailed description up to 2000 characters';

-- Add check constraint to limit subtitle length
ALTER TABLE resources ADD CONSTRAINT subtitle_length_check CHECK (LENGTH(subtitle) <= 2000);
