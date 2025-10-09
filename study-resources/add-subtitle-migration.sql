-- Add subtitle column to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Add comment for documentation
COMMENT ON COLUMN resources.subtitle IS 'Optional detailed description up to 2000 characters';

-- Add check constraint to limit subtitle length (using DO block to handle IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subtitle_length_check' 
        AND conrelid = 'resources'::regclass
    ) THEN
        ALTER TABLE resources ADD CONSTRAINT subtitle_length_check CHECK (LENGTH(subtitle) <= 2000);
    END IF;
END $$;
