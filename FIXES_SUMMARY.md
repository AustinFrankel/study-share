# ⚡ QUICK FIX SUMMARY

## ✅ Fixed RIGHT NOW:

### 1. Search Resources Error
- **Was:** `Error searching resources: {}`
- **Now:** Works perfectly, searches by title
- **File:** `src/app/search/page.tsx`

### 2. Live Test Upload Not Saving  
- **Was:** Upload → Success → Redirect → Still shows "Upload" button
- **Now:** Upload → Logs everything → Saves → Shows test questions
- **Files:** 
  - `src/app/live/upload/page.tsx` 
  - `src/app/live/test/page.tsx`

---

## 🧪 Test It Now:

### Search Test:
```
1. Go to /search
2. Search for anything
3. ✅ Should work without console errors
```

### Upload Test:
```
1. Go to /live
2. Click any PAST test (green dot)
3. Click "View" → Click "Upload"  
4. Password: Unlock
5. Upload test images
6. OPEN CONSOLE (F12) - watch the logs
7. ✅ Should see success messages
8. ✅ Questions should appear after redirect
```

---

## 📊 What You'll See in Console:

**Upload Page:**
```
About to save to test_resources: {...}
Successfully saved to database: [...]
```

**Test Page:**
```
Loading questions for test: ...
Query result: {...}
Successfully loaded 52 questions
```

---

## 🚨 If Still Broken:

**Share console logs that start with:**
- `About to save...`
- `Loading questions...`
- `Database error...`
- `Error loading...`

I'll fix it INSTANTLY! 💪

---

## 📝 Other Fixes From Before (updated SQL for 3 & 4)

These two needed new queries — paste each block into the Supabase SQL editor and run them.

3) Unique usernames — find duplicates, back up, then fix

- Find duplicate handles (shows which handles appear more than once):

```sql
SELECT handle, COUNT(*) AS cnt
FROM users
GROUP BY handle
HAVING COUNT(*) > 1;
```

- Backup duplicated rows (optional, recommended):

```sql
SELECT *
FROM users
WHERE handle IN (
  SELECT handle
  FROM users
  GROUP BY handle
  HAVING COUNT(*) > 1
)
ORDER BY handle, created_at DESC;
```

- Safe fix (rename duplicate handles by appending a short suffix so no accounts are lost):

```sql
-- Append a short suffix (first 8 chars of id) to duplicate handles, keep the earliest-created one unchanged
UPDATE users
SET handle = handle || '-' || LEFT(id::text, 8),
    handle_version = handle_version + 1
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY handle ORDER BY created_at ASC) AS rn
    FROM users
  ) s
  WHERE s.rn > 1
);
```

- Re-add unique constraint to prevent future duplicates:

```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_handle_unique;
ALTER TABLE users ADD CONSTRAINT users_handle_unique UNIQUE (handle);
CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
```

4) Leaderboard (user_points) — create materialized view + refresh function

- Create materialized view (aggregates points per user):

```sql
DROP MATERIALIZED VIEW IF EXISTS user_points CASCADE;
CREATE MATERIALIZED VIEW user_points AS
SELECT
  user_id,
  COALESCE(SUM(delta), 0) AS total_points,
  COUNT(*) AS transaction_count,
  MIN(created_at) AS first_transaction,
  MAX(created_at) AS last_transaction
FROM points_ledger
GROUP BY user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_desc ON user_points(total_points DESC);
```

- Refresh function (call this periodically or after point changes):

```sql
CREATE OR REPLACE FUNCTION refresh_user_points()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_points;
END;
$$;
```

- Manual refresh command:

```sql
SELECT refresh_user_points();
-- or run directly:
REFRESH MATERIALIZED VIEW CONCURRENTLY user_points;
```

Quick sanity checks after running either fix:

```sql
-- Any remaining duplicate handles?
SELECT handle, COUNT(*) FROM users GROUP BY handle HAVING COUNT(*) > 1;

-- Check duplicates for test_resources (if you worked on tests)
SELECT test_id, COUNT(*) FROM test_resources GROUP BY test_id HAVING COUNT(*) > 1;

-- Check a specific test row count (example sat-jun):
SELECT COUNT(*) FROM test_resources WHERE test_id = 'sat-jun';
```

Safety notes: backup first (export SELECT results) or run inside a transaction. The rename approach is non-destructive; the DELETE approach is destructive (removes accounts), so avoid unless you intentionally want to delete duplicates.
