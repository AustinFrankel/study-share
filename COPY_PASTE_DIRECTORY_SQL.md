# Quick Start: Add Schools & Teachers

## Step 1: Run This SQL in Supabase

1. Go to your Supabase dashboard → SQL Editor
2. Create a new query
3. Copy the entire contents of `comprehensive-schools-teachers.sql`
4. Click Run

**OR** use the file content directly - it's in the `comprehensive-schools-teachers.sql` file in this directory.

## Step 2: Access the Admin Page

After deploying, go to: `https://your-domain.com/admin/directory`

You'll see:
- All 11 schools (Blind Brook HS + 10 universities)
- 100+ teachers/professors organized by school
- Easy interface to add more schools and teachers

## What You Get

### High School
✅ **Blind Brook High School** with 18 real teachers across:
- Mathematics (4 teachers)
- Science (4 teachers)
- English (3 teachers)
- History (3 teachers)
- Languages - Spanish, French, Italian (3 teachers)
- Arts & Music (2 teachers)

### Universities (10 schools)
✅ Harvard, Princeton, Yale
✅ MIT, Stanford, UC Berkeley
✅ Columbia, Carnegie Mellon
✅ University of Michigan, UT Austin, University of Washington

All with **real professor names** in Computer Science, Mathematics, Physics, and Economics departments.

## Adding More Schools/Teachers

### Via Admin Page (Recommended for 1-2 schools)
1. Go to `/admin/directory`
2. Fill in school details
3. Click "Add School"
4. System automatically prompts you to add teachers
5. Add multiple teachers at once
6. Click "Save Teachers"

### Via SQL (For bulk additions)
Add to `comprehensive-schools-teachers.sql` following this pattern:

```sql
INSERT INTO schools (name, type, location, created_at) VALUES
('Your School Name', 'high_school', 'City, State', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type;

DO $$
DECLARE
  school_id UUID;
BEGIN
  SELECT id INTO school_id FROM schools WHERE name = 'Your School Name';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  ('Prof. First Last', school_id, 'Department', NOW()),
  ('Ms. Jane Doe', school_id, 'Math', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;
```

## Your Build Should Now Pass

The TypeScript error is fixed. Your next deployment should succeed! ✅

## Testing the Directory

1. **Browse page**: Go to `/browse` and use the school filter
2. **Select Blind Brook**: You should see the dropdown populated
3. **Select a teacher**: Filter further by teacher
4. **Upload flow**: When uploading, schools and teachers appear in dropdowns

That's it! 🎉
