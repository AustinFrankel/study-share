-- Add public column to resources table and make all resources public by default
ALTER TABLE resources ADD COLUMN IF NOT EXISTS public boolean DEFAULT true;

-- Update all existing resources to be public
UPDATE resources SET public = true WHERE public IS NULL;

-- Add policy to only show public resources in general queries (optional)
-- This is commented out since we're making everything public by default
-- CREATE POLICY "Only show public resources" ON resources
--   FOR SELECT USING (public = true);
