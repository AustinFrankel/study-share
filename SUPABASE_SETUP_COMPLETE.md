# 🔧 Your Supabase Setup - Complete Configuration

## 📋 Your Project Details

**Project ID:** `dnknanwmaekhthmpbpjpo`  
**Project URL:** `https://dnknanwmaekhthmpbpjpo.supabase.co`  
**Anon/Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua25hbndtYWVraHRtcGJwanBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjQ3MDksImV4cCI6MjA3MzcwMDcwOX0.B2rvyWyZJQclEAQRzzpqVY0ZHxWl5FwZ8cV-dJo82_o`

---

## ⚡ CRITICAL: Run These SQL Commands NOW

Go to: https://app.supabase.com/project/dnknanwmaekhthmpbpjpo/sql

Copy and paste ALL of the SQL below:

```sql
-- ============================================
-- CRITICAL DATABASE SETUP FOR LIVE TESTS
-- ============================================

-- 1. Create test_resources table (if not exists)
CREATE TABLE IF NOT EXISTS public.test_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL UNIQUE,
  test_name text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  uploader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_resources_test_id ON public.test_resources(test_id);
CREATE INDEX IF NOT EXISTS idx_test_resources_created_at ON public.test_resources(created_at DESC);

-- Enable RLS
ALTER TABLE public.test_resources ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view test resources" ON public.test_resources;
DROP POLICY IF EXISTS "Authenticated users can insert test resources" ON public.test_resources;
DROP POLICY IF EXISTS "Anyone can insert test resources" ON public.test_resources;
DROP POLICY IF EXISTS "Anyone can update test resources" ON public.test_resources;
DROP POLICY IF EXISTS "Users can update own resources" ON public.test_resources;

-- Create new open policies
CREATE POLICY "Public read access"
  ON public.test_resources FOR SELECT
  USING (true);

CREATE POLICY "Public insert access"
  ON public.test_resources FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON public.test_resources FOR UPDATE
  USING (true);

-- 2. Create test_waitlist table (if not exists)
CREATE TABLE IF NOT EXISTS public.test_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  test_name text NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  notified boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_test_waitlist_test_id ON public.test_waitlist(test_id);
CREATE INDEX IF NOT EXISTS idx_test_waitlist_email ON public.test_waitlist(email);

ALTER TABLE public.test_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.test_waitlist;
DROP POLICY IF EXISTS "Public can view waitlist" ON public.test_waitlist;

CREATE POLICY "Public can join waitlist"
  ON public.test_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view waitlist"
  ON public.test_waitlist FOR SELECT
  USING (true);

-- 3. Verify resources table exists and has public column
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'resources') THEN
    -- Add public column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'resources' AND column_name = 'public') THEN
      ALTER TABLE public.resources ADD COLUMN public boolean DEFAULT true;
    END IF;
    
    -- Update all resources to be public
    UPDATE public.resources SET public = true WHERE public IS NULL OR public = false;
    
    -- Ensure public read policy exists
    DROP POLICY IF EXISTS "Anyone can view public resources" ON public.resources;
    CREATE POLICY "Anyone can view public resources"
      ON public.resources FOR SELECT
      USING (public = true);
  END IF;
END $$;

-- 4. Show success and verification
SELECT 'test_resources' as table_name, COUNT(*) as row_count FROM public.test_resources
UNION ALL
SELECT 'test_waitlist' as table_name, COUNT(*) as row_count FROM public.test_waitlist
UNION ALL
SELECT 'resources' as table_name, COUNT(*) as row_count FROM public.resources;

-- Show policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('test_resources', 'test_waitlist', 'resources')
ORDER BY tablename, policyname;
```

---

## ✅ After Running SQL - Verify Setup

Run these verification queries:

### Check if test_resources table exists and is accessible
```sql
SELECT * FROM public.test_resources LIMIT 5;
```

### Check policies
```sql
SELECT tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename = 'test_resources';
```

Expected output:
- `Public read access` - SELECT - true
- `Public insert access` - INSERT - true
- `Public update access` - UPDATE - true

---

## 🔑 Update Your Environment Variables

Update your `.env.local` file with these values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dnknanwmaekhthmpbpjpo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua25hbndtYWVraHRtcGJwanBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjQ3MDksImV4cCI6MjA3MzcwMDcwOX0.B2rvyWyZJQclEAQRzzpqVY0ZHxWl5FwZ8cV-dJo82_o

# Site URL (change to your production URL when deploying)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Gemini API (already configured)
GEMINI_API_KEY=AIzaSyD4icVauYHyo7e0Tdtd5TqBjDrQHWKRgM4

# OCR Space API (already configured)
OCRSPACE_API_KEY=K84507617488957
```

---

## 🧪 Test Everything

### 1. Test Upload Flow
```bash
# Start your dev server
npm run dev

# Go to: http://localhost:3000/live/upload?test=sat-test&name=SAT%20Test
# Password: Unlock
# Upload a test image
# Should process without errors
```

### 2. Test Visibility
```bash
# After upload, go to: http://localhost:3000/live
# Your uploaded test should appear
# Open in incognito mode - test should still be visible
```

### 3. Test Waitlist
```bash
# Click "Join Waitlist" on any upcoming test
# Enter email and submit
# Check Supabase Table Editor → test_waitlist → Should see entry
```

---

## 📊 Database Verification Queries

### Check what's in test_resources
```sql
SELECT 
  test_id,
  test_name,
  jsonb_array_length(questions) as question_count,
  created_at
FROM public.test_resources
ORDER BY created_at DESC;
```

### Check waitlist entries
```sql
SELECT 
  test_name,
  email,
  created_at,
  notified
FROM public.test_waitlist
ORDER BY created_at DESC
LIMIT 10;
```

### Check resources visibility
```sql
SELECT 
  title,
  public,
  created_at
FROM public.resources
WHERE public = true
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### If tests still not visible:

1. **Check RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'test_resources';
```
Should show: `rowsecurity = true`

2. **Check policies exist:**
```sql
SELECT COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'test_resources';
```
Should show: `policy_count = 3`

3. **Test direct insert:**
```sql
INSERT INTO public.test_resources (test_id, test_name, questions)
VALUES ('test-123', 'Test SAT', '[]'::jsonb)
RETURNING *;
```
Should succeed without errors

4. **Test public read:**
```sql
SET ROLE anon;
SELECT * FROM public.test_resources WHERE test_id = 'test-123';
RESET ROLE;
```
Should return the test (not empty)

---

## 🎯 What This Setup Does

✅ **Public Access**: Anyone can view, insert, and update test resources  
✅ **Waitlist**: Anyone can join waitlist, all entries visible  
✅ **Resources**: All resources marked as public are visible  
✅ **No Auth Required**: Tests work for non-logged-in users  
✅ **Admin Upload**: Upload page can save directly to database  

---

## 🔐 Storage Bucket Setup (If Using Image Upload)

1. Go to: https://app.supabase.com/project/dnknanwmaekhthmpbpjpo/storage/buckets
2. Create bucket named: `resources`
3. Make it **Public**
4. Add policy:
   - Name: "Public access"
   - Allowed operations: SELECT, INSERT, UPDATE
   - Policy: `true`

---

## ✅ Success Checklist

- [ ] SQL commands executed successfully
- [ ] test_resources table exists
- [ ] test_waitlist table exists
- [ ] 3 policies on test_resources (read, insert, update)
- [ ] Environment variables updated in .env.local
- [ ] Dev server restarted
- [ ] Upload test works without errors
- [ ] Uploaded test visible on /live
- [ ] Test visible in incognito mode
- [ ] Waitlist submission works
- [ ] Archive section displays correctly

---

## 🎉 You're All Set!

Your database is now fully configured. Everything should work:

1. ✅ Tests upload successfully
2. ✅ Tests visible to everyone immediately
3. ✅ Waitlist works
4. ✅ No authentication required for viewing
5. ✅ Gemini API processes images
6. ✅ Archive section formatted beautifully

**Next step:** Test the upload flow and verify everything works! 🚀
