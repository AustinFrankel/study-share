# Adding US Colleges and College-Level Subjects

This guide explains how to add all major US colleges and college-level subjects to your database.

## 📋 What's Included

The SQL script `us-colleges-and-subjects.sql` includes:

### 🏫 **200+ US Colleges and Universities**
- **Ivy League** (8 schools)
- **Top Public Universities** (25+ schools including all UC campuses)
- **Top Private Universities** (30+ schools)
- **Liberal Arts Colleges** (30+ schools)
- **Technology & Engineering Schools** (11 schools)
- **Business Schools** (10 top programs)
- **Art & Music Schools** (9 schools)
- **Medical Schools** (7 top programs)
- **HBCUs** (20 Historically Black Colleges)
- **State Universities** (40+ schools)
- **Additional Major Universities** (30+ schools)

### 📚 **350+ College-Level Subjects**

#### Sciences
- **Chemistry** (6 courses)
- **Physics** (12 courses)
- **Mathematics** (16 courses)
- **Biology** (15 courses)

#### Technology
- **Computer Science** (23 courses)
- **Engineering** (25+ courses across all disciplines)

#### Business & Economics
- **Economics** (8 courses)
- **Accounting & Finance** (9 courses)
- **Business Management** (8 courses)

#### Social Sciences
- **Psychology** (7 courses)
- **Sociology** (8 courses)
- **Political Science** (9 courses)
- **Anthropology** (4 courses)

#### Humanities
- **History** (10 courses)
- **Art History** (5 courses)
- **Philosophy** (10 courses)
- **Literature & Writing** (10 courses)
- **Media & Film** (4 courses)

#### Languages
- **15 languages** including Spanish, French, German, Chinese, Japanese, Arabic, etc.

#### Health Sciences
- **13 courses** including Anatomy, Physiology, Pharmacology, Public Health

#### Professional Fields
- **Law** (10 courses)
- **Architecture & Design** (8 courses)
- **Education** (5 courses)
- **Environmental Science** (5 courses)
- **Agriculture** (4 courses)
- **Communication** (5 courses)

## 🚀 How to Run the SQL Script

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on the "SQL Editor" icon in the left sidebar
   - Click "New Query"

3. **Copy and Paste the SQL**
   - Open `us-colleges-and-subjects.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Script**
   - Click the "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for the confirmation message
   - You should see: "Success. No rows returned"

### Option 2: Command Line (Advanced)

If you have the Supabase CLI installed:

```bash
supabase db execute < us-colleges-and-subjects.sql
```

## ✅ Verification

After running the script, verify the data was added:

### Check Schools Count
```sql
SELECT COUNT(*) FROM schools;
-- Should return 200+ schools
```

### Check Subjects Count
```sql
SELECT COUNT(*) FROM subjects;
-- Should return 350+ subjects (including existing high school subjects)
```

### Sample Schools
```sql
SELECT name FROM schools
WHERE name LIKE '%Harvard%'
   OR name LIKE '%Stanford%'
   OR name LIKE '%MIT%'
ORDER BY name;
```

### Sample Subjects
```sql
SELECT name FROM subjects
WHERE name LIKE '%Computer%'
   OR name LIKE '%Calculus%'
   OR name LIKE '%Chemistry%'
ORDER BY name;
```

## 📝 Important Notes

1. **No Duplicates**: The script uses `ON CONFLICT (name) DO NOTHING` to prevent duplicate entries. If a school or subject already exists, it will be skipped.

2. **Safe to Re-run**: You can run this script multiple times without creating duplicates.

3. **Existing Data**: This script won't affect any existing resources, classes, or other data in your database.

4. **High School Subjects**: This script adds college-level subjects. Your existing high school subjects (AP, Honors, etc.) will remain unchanged.

## 🎯 What This Enables

After running this script, users can:

1. ✅ **Select from 200+ US colleges** when uploading resources
2. ✅ **Choose college-level subjects** like "Organic Chemistry" or "Machine Learning"
3. ✅ **Filter by college** when browsing resources
4. ✅ **Find resources** from specific universities
5. ✅ **Share materials** from college courses

## 🔧 Troubleshooting

### Error: "relation schools does not exist"
- Make sure you've run all database migrations first
- Check that the `schools` table exists in your database

### Error: "duplicate key value violates unique constraint"
- This is expected if some schools/subjects already exist
- The script will skip duplicates and continue

### No schools appearing in dropdown
- Clear your browser cache
- Refresh the page
- Check that the upload form is properly fetching from the database

## 📊 Database Schema

The script assumes your database has these tables with these columns:

### Schools Table
```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Subjects Table
```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🆘 Need Help?

If you encounter any issues:

1. Check the Supabase logs in the dashboard
2. Verify your table structure matches the schema
3. Ensure you have proper database permissions
4. Contact support with any error messages

---

**Ready to add all US colleges and subjects?** Just run the SQL script in your Supabase dashboard! 🚀
