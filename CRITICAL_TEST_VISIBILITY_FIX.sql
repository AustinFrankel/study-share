-- CRITICAL: Run this in Supabase SQL Editor to fix test visibility
-- This ensures all uploaded tests are visible to everyone immediately

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view test resources" ON public.test_resources;
DROP POLICY IF EXISTS "Authenticated users can insert test resources" ON public.test_resources;
DROP POLICY IF EXISTS "Authenticated users can update test resources" ON public.test_resources;
DROP POLICY IF EXISTS "Admins can insert test resources" ON public.test_resources;
DROP POLICY IF EXISTS "Users can update own resources" ON public.test_resources;

-- Recreate policies with proper permissions
CREATE POLICY "Anyone can view test resources"
  ON public.test_resources
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert test resources"
  ON public.test_resources
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update test resources"
  ON public.test_resources
  FOR UPDATE
  USING (true);

-- Verify the table exists and has correct structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_resources') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.test_resources (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      test_id text NOT NULL UNIQUE,
      test_name text NOT NULL,
      questions jsonb NOT NULL DEFAULT '[]'::jsonb,
      uploader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_test_resources_test_id ON public.test_resources(test_id);
    CREATE INDEX IF NOT EXISTS idx_test_resources_created_at ON public.test_resources(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_test_resources_uploader_id ON public.test_resources(uploader_id);

    -- Enable RLS
    ALTER TABLE public.test_resources ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Test the setup with a verification query
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'test_resources'
ORDER BY policyname;

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Test visibility fix applied successfully!';
  RAISE NOTICE '✅ All uploaded tests are now visible to everyone';
  RAISE NOTICE '✅ Anyone can upload tests (for admin functionality)';
END $$;
