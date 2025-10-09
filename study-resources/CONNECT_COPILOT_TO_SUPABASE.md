# 🔌 How to Connect GitHub Copilot to Your Supabase Database

This guide shows you how to give GitHub Copilot direct access to your Supabase backend so it can help you edit tables, run queries, and fix database issues.

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Get Your Supabase Connection Details

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click on your project
3. Go to **Settings** → **Database** (in the left sidebar)
4. Find the **Connection String** section
5. Copy the **Connection string** (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### Step 2: Get Your Supabase API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon/public key** (the long string under "Project API keys")

### Step 3: Share the Info with Copilot

In your chat with GitHub Copilot, paste this information:

```
Here are my Supabase credentials for direct database access:

Project URL: [PASTE YOUR PROJECT URL]
API Key (anon): [PASTE YOUR ANON KEY]

Connection String: [PASTE YOUR CONNECTION STRING]

I need you to:
1. Check my test_resources table
2. Fix any RLS policies that prevent tests from showing up
3. Verify uploaded tests are publicly visible
```

---

## 🛠️ What Copilot Can Do With This Access

Once connected, Copilot can:
- ✅ Run SQL queries directly on your database
- ✅ Check and fix Row Level Security (RLS) policies
- ✅ View table structures and data
- ✅ Debug why uploaded tests aren't showing up
- ✅ Create/modify tables and indexes
- ✅ Fix authentication and permission issues

---

## 🔐 Security Notes

**Important:**
- The connection string contains your database password - don't share this publicly
- Only share this with GitHub Copilot in private chat
- You can reset your database password anytime in Supabase Settings
- Your API keys are safe to use with Copilot as they're client-side keys

---

## 🚀 Example: Fixing Test Visibility

After sharing your credentials, you can ask Copilot:

> "Check if the test_resources table exists and if the RLS policies allow public read access. Then verify if there are any uploaded tests in the table."

Copilot will:
1. Query your database directly
2. Check the policies
3. Tell you exactly what's wrong
4. Provide the SQL fix to run

---

## 📊 Current Issues to Fix

Tell Copilot to check these specific things:

1. **Test Visibility**
   ```sql
   SELECT * FROM test_resources LIMIT 5;
   ```
   
2. **RLS Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'test_resources';
   ```

3. **Test Count**
   ```sql
   SELECT COUNT(*) FROM test_resources;
   ```

---

## 🔄 Alternative: Use Supabase SQL Editor

If you don't want to share credentials, you can:

1. Ask Copilot to generate SQL scripts
2. Copy the SQL
3. Run it in **Supabase Dashboard** → **SQL Editor**
4. Report back the results to Copilot

This way Copilot can still help without direct access.

---

## 💡 Quick Reference

| What You Need | Where to Find It |
|---------------|------------------|
| Project URL | Settings → API → Project URL |
| API Key | Settings → API → anon/public key |
| Connection String | Settings → Database → Connection string |
| SQL Editor | Supabase Dashboard → SQL Editor |
| Table Editor | Supabase Dashboard → Table Editor |

---

## ✅ After Copilot Fixes Things

Once Copilot has:
- Fixed your RLS policies
- Verified test visibility
- Checked the database structure

You can test by:
1. Uploading a test at `/live/upload`
2. Checking if it appears on `/live`
3. Verifying everyone can see it (test in incognito mode)

---

## 🆘 Still Having Issues?

Share this with Copilot:

> "I've uploaded a test but it's not showing up. Here are my current RLS policies:
> [paste output from: SELECT * FROM pg_policies WHERE tablename = 'test_resources']
> 
> And here's what's in the table:
> [paste output from: SELECT test_id, test_name, created_at FROM test_resources]"

---

## 📝 Summary

1. Get your Supabase Project URL and API keys from Settings
2. Get your database connection string from Settings → Database
3. Share them with Copilot in private chat
4. Ask Copilot to fix your database issues
5. Copilot will run queries and provide fixes
6. Apply the fixes in SQL Editor or let Copilot do it directly

**That's it!** Now Copilot can directly help with your backend. 🎉
