-- Ensure child tables cascade when a resource is deleted

-- Drop and recreate FKs with ON DELETE CASCADE for resource_id
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN (
    SELECT tc.constraint_name, tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'resource_id'
      AND tc.table_name IN ('files','ai_derivatives','comments','votes','resource_tags','flags')
  ) LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', rec.table_name, rec.constraint_name);
  END LOOP;

  ALTER TABLE files
    ADD CONSTRAINT files_resource_id_fkey
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

  ALTER TABLE ai_derivatives
    ADD CONSTRAINT ai_derivatives_resource_id_fkey
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

  ALTER TABLE comments
    ADD CONSTRAINT comments_resource_id_fkey
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

  ALTER TABLE votes
    ADD CONSTRAINT votes_resource_id_fkey
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

  ALTER TABLE resource_tags
    ADD CONSTRAINT resource_tags_resource_id_fkey
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

  ALTER TABLE flags
    ADD CONSTRAINT flags_resource_id_fkey
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;
END $$;
