-- Make resources.class_id nullable and set FK ON DELETE SET NULL
ALTER TABLE resources ALTER COLUMN class_id DROP NOT NULL;

-- Drop old constraint if name is unknown, try common names
DO $$
DECLARE
  conname text;
BEGIN
  SELECT tc.constraint_name INTO conname
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'resources'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'class_id'
  LIMIT 1;

  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE resources DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE resources
  ADD CONSTRAINT resources_class_id_fkey
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;


