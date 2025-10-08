# 🚨 TEST UPLOAD DEBUGGING - COMPLETE GUIDE

## What I Just Added

### 1. **Extensive Console Logging**
Every step now logs to console with emojis for easy identification:

**Upload Page Logs:**
- 🔍 About to save
- ✅ Successfully saved
- 🔍 Verifying data was saved
- ✅ VERIFICATION SUCCESS
- 🔄 Redirecting to test page

**Test Page Logs:**
- 🔍 Loading questions for test
- 📊 Current state
- 🔄 Querying test_resources table
- ✅ Query completed
- 📦 Full data received
- 🔎 Checking data.questions
- ✅ Successfully loaded X questions

### 2. **Verification Step After Upload**
After saving, the upload page now:
1. Saves the data (upsert)
2. **Immediately queries it back** to verify
3. Checks if questions array exists and has content
4. Only shows success if verification passes
5. Shows detailed error if verification fails

### 3. **Debug UI on Locked Screen**
The "Test Locked" screen now shows:
- Test ID
- Current state (hasResources, loading)
- **"Retry / Refresh" button** - Click this after uploading!
- Link to browser console instructions

---

## 🧪 HOW TO TEST & DEBUG

### Step 1: Open Browser Console
**BEFORE you start uploading:**
1. Press **F12** (or Cmd+Option+I on Mac)
2. Go to **Console** tab
3. Clear any old logs
4. Keep it open during the entire process

### Step 2: Upload Test Content
1. Go to `/live`
2. Click a PAST test (green dot)
3. Click "Upload Content (Admin)"
4. Password: `Unlock`
5. Select images
6. Upload

### Step 3: Watch Console Logs

**During Upload - You Should See:**
```
About to save to test_resources: {test_id: "...", questions_count: X}
Successfully saved to database: [...]
🔍 Verifying data was saved...
✅ VERIFICATION SUCCESS - Data in database: {...}
   - Questions count: 52
   - Test ID: sat-2025-03-08
   - Test Name: SAT
🔄 Redirecting to test page...
```

**After Redirect - You Should See:**
```
🔍 Loading questions for test: sat-2025-03-08
📊 Current state: {hasResources: false, loadingResources: false}
🔄 Querying test_resources table...
✅ Query completed
📦 Full data received: {id: "...", test_id: "...", questions: [...]}
🔎 Checking data.questions...
   - data exists: true
   - data.questions exists: true
   - data.questions type: object
   - data.questions is array: true
   - data.questions length: 52
✅ Successfully loaded 52 questions
📝 First question: {...}
```

---

## 🐛 DEBUGGING SCENARIOS

### Scenario 1: Upload Fails Immediately
**Console shows:** `Database error details: {...}`

**Possible causes:**
- Table doesn't exist → Run `RUN_THIS_SQL.sql`
- RLS policies blocking → Run `RUN_THIS_SQL.sql`
- Connection issue → Check Supabase credentials

**Fix:** Run the SQL migration!

---

### Scenario 2: Upload Says Success But Verification Fails
**Console shows:** `❌ VERIFICATION FAILED: {...}`

**This means:** Data didn't actually save to database

**Possible causes:**
- RLS policy blocking INSERT
- Unique constraint violation (test_id already exists with different data)
- JSONB field issue

**Fix:** 
1. Check error message in console
2. If it says "violates row-level security", run SQL migration
3. If it says "duplicate key", delete old test first:
   ```sql
   DELETE FROM test_resources WHERE test_id = 'your-test-id';
   ```

---

### Scenario 3: Upload Succeeds, Redirect Shows "Test Locked"
**Console shows:** `❌ No questions found in data` or `🚨 Error loading test resources`

**This means:** Upload worked, but query isn't finding the data

**Check console for:**
- `Error received: {...}` - What error code?
- `Full data object: {...}` - Is it null or empty?

**Possible causes:**

**A. RLS Policy Blocking SELECT:**
```
Error: {"code": "PGRST116", "message": "..."}
```
**Fix:** Run SQL migration - SELECT policy not set up

**B. Questions Array is Empty:**
```
data.questions length: 0
```
**Fix:** OCR extraction failed - check uploaded images

**C. Wrong Test ID:**
```
Error: {"code": "PGRST116", "message": "Not Found"}
```
**Fix:** URL test ID doesn't match saved test_id

---

### Scenario 4: Still Shows "Test Locked" After Upload
**Try this:**
1. Click **"Retry / Refresh"** button on the locked screen
2. This will reload the page and re-query the database
3. Watch console logs

**If still locked after refresh:**
- Check console logs for the error
- Copy ALL console logs and share with me

---

## 📋 CHECKLIST FOR SUCCESSFUL UPLOAD

Use this to verify each step:

```
[ ] SQL migration run successfully (RUN_THIS_SQL.sql)
[ ] Browser console open (F12)
[ ] Upload test content
[ ] See "About to save to test_resources" log
[ ] See "Successfully saved to database" log
[ ] See "✅ VERIFICATION SUCCESS" log
[ ] See "Questions count: X" (where X > 0)
[ ] Page redirects after 2.5 seconds
[ ] See "🔍 Loading questions for test" log
[ ] See "✅ Query completed" log
[ ] See "data.questions length: X" log (where X > 0)
[ ] See "✅ Successfully loaded X questions" log
[ ] Test page shows questions (not locked screen)
```

---

## 🔧 WHAT TO SHARE WITH ME IF IT FAILS

Copy and paste ALL of these from console:

1. **All logs with 🔍 emoji**
2. **All logs with ✅ emoji**
3. **All logs with ❌ emoji**
4. **All logs with 🚨 emoji**
5. **The full "Full data object" log**
6. **Any red error messages**
7. **Screenshot of the locked screen with debug info**

---

## 🎯 MOST COMMON ISSUE & FIX

**90% of the time, the issue is:**
- **RLS policies not set up**
- **test_resources table doesn't exist**

**FIX:** Run `RUN_THIS_SQL.sql` in Supabase SQL Editor!

**To verify SQL ran correctly, run this query in Supabase:**
```sql
-- Check if table exists
SELECT * FROM test_resources LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'test_resources';

-- Should show 3 policies:
-- 1. Anyone can view test resources
-- 2. Authenticated users can insert test resources
-- 3. Authenticated users can update test resources
```

---

## 🚀 NEXT STEPS

1. **Clear browser console** (right-click → Clear console)
2. **Try uploading again**
3. **Watch console logs carefully**
4. **Click "Retry / Refresh" if you see locked screen**
5. **Share console logs with me if still failing**

The detailed logging will show us EXACTLY where it's failing! 🔍
