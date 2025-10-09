-- Move pg_trgm extension from public schema to dedicated extensions schema
-- This addresses the security warning about extensions in public schema

-- Create dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- Drop the extension from public schema
DROP EXTENSION IF EXISTS pg_trgm;

-- Recreate the extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Update search_path to include extensions schema for future operations
-- This ensures pg_trgm functions are accessible without schema qualification
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;

-- For existing sessions, the search_path change will take effect on next connection
-- Functions and queries using pg_trgm should continue to work normally
