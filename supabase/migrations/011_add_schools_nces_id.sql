-- Add NCES identifier for schools and index it
ALTER TABLE schools ADD COLUMN IF NOT EXISTS nces_id text;
CREATE UNIQUE INDEX IF NOT EXISTS schools_nces_id_unique ON schools (nces_id) WHERE nces_id IS NOT NULL;


