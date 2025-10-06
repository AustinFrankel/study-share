# SQL Index Error - FIXED ✅

## The Problem
You got this error:
```
ERROR: 42703: column "commenter_id" does not exist
```

## The Cause
The SQL file was trying to create an index on `comments.commenter_id`, but your actual schema uses `comments.author_id`.

## The Fix
I've corrected **3 files**:

### 1. ✅ RUN_THESE_SQL_COMMANDS.md
Changed:
```sql
CREATE INDEX IF NOT EXISTS idx_comments_commenter_id ON comments(commenter_id);
```
To:
```sql
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
```

### 2. ✅ performance-indexes.sql
Same fix applied

### 3. ✅ FIXED_INDEXES.sql (NEW FILE)
Created a clean, corrected version you can copy-paste directly

---

## ✅ How to Apply the Fix

### Option 1: Use the new file (EASIEST)
1. Open [FIXED_INDEXES.sql](./FIXED_INDEXES.sql)
2. Copy the entire content
3. Paste into Supabase SQL Editor
4. Click "Run"

### Option 2: Use the updated markdown
1. Open [RUN_THESE_SQL_COMMANDS.md](./RUN_THESE_SQL_COMMANDS.md)
2. Go to "Step 1: Core Performance Indexes"
3. Copy and run the corrected SQL

---

## Verified Schema
Your actual `comments` table has these columns:
- `id` (uuid)
- `resource_id` (uuid)
- `author_id` (uuid) ← This is the correct column name
- `body` (text)
- `created_at` (timestamptz)

All SQL files now use `author_id` instead of `commenter_id`.

---

## ✅ Test It
After running the corrected SQL, verify with:
```sql
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_comments%';
```

You should see:
- `idx_comments_resource_id_created`
- `idx_comments_author_id`

---

**Status:** FIXED ✅
**Files Updated:** 3
**Ready to Run:** Yes
