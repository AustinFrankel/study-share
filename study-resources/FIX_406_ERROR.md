# 🚨 CRITICAL - 406 ERROR FIX

## The Problem:

Your console shows:
```
GET https://...test_resources?select=*&test_id=eq.sat-jun 406 (Not Acceptable)
```

**406 Not Acceptable** means Supabase is **rejecting the query**.

## Why This Happens:

1. ❌ **RLS policies not set up** (most likely)
2. ❌ API key permissions issue
3. ❌ Table doesn't exist or has wrong permissions

## The Fix:

### Step 1: Run This Query in Supabase SQL Editor

```sql
-- Check if table exists
SELECT * FROM test_resources LIMIT 1;
```

**If you get an error**, the table doesn't exist. Run `RUN_THIS_SQL.sql`.

### Step 2: Check RLS Policies

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'test_resources';
```

**Should show 3 policies:**
1. Anyone can view test resources (SELECT)
2. Authenticated users can insert test resources (INSERT)
3. Authenticated users can update test resources (UPDATE)

**If you see 0 rows**, run `RUN_THIS_SQL.sql`.

### Step 3: Verify API Key

1. Go to Supabase Dashboard
2. Settings → API
3. Copy the **anon public** key
4. Make sure it matches your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

### Step 4: Test the Query Directly

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- This should work without errors
SELECT * FROM test_resources WHERE test_id = 'sat-jun';
```

**If this returns 0 rows:** The test hasn't been uploaded yet (expected)
**If this returns an error:** RLS policies or table structure issue

---

## Quick Test:

Run this in Supabase SQL Editor to bypass RLS temporarily:

```sql
-- Temporarily disable RLS (FOR TESTING ONLY)
ALTER TABLE test_resources DISABLE ROW LEVEL SECURITY;

-- Try the query
SELECT * FROM test_resources WHERE test_id = 'sat-jun';

-- Re-enable RLS
ALTER TABLE test_resources ENABLE ROW LEVEL SECURITY;
```

---

## Most Likely Solution:

**You haven't run the SQL migration yet!**

1. Open `study-resources/RUN_THIS_SQL.sql`
2. Copy the ENTIRE file
3. Go to Supabase → SQL Editor
4. Paste and click **RUN**
5. Should see success messages

---

## After Running SQL:

1. Refresh your app
2. Try uploading test again
3. Watch console for upload logs:
   ```
   Saving to test_resources: {...}
   ✅ Successfully saved
   ✅ Verified: X questions
   ```

---

## Still Getting 406?

Share these with me:

1. Result of: `SELECT * FROM pg_policies WHERE tablename = 'test_resources';`
2. Your Supabase project URL (from browser URL)
3. Screenshot of Supabase API settings page
