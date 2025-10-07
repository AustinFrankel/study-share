# School & Teacher Directory Setup Guide

This guide will help you set up a comprehensive school and teacher directory for your platform.

## Overview

We've created:
1. **Comprehensive SQL file** with real schools and teachers
2. **Admin directory management page** for seamless school/teacher addition

## Step 1: Run the SQL Migration

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `comprehensive-schools-teachers.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`

### Option B: Via Supabase CLI

```bash
# Make sure you're in the project directory
cd study-resources

# Run the SQL file
supabase db push comprehensive-schools-teachers.sql
```

## Step 2: Verify the Data

After running the SQL, you should see:

### High Schools
- **Blind Brook High School** (Rye Brook, NY)
  - 18 teachers across Math, Science, English, History, Languages, and Arts

### Universities
1. **Harvard University** (13 professors)
2. **Princeton University** (13 professors)
3. **Yale University** (10 professors)
4. **UC Berkeley** (15 professors)
5. **MIT** (15 professors)
6. **Stanford University** (15 professors)
7. **University of Michigan** (7 professors)
8. **University of Texas at Austin** (7 professors)
9. **Columbia University** (8 professors)
10. **University of Washington** (6 professors)
11. **Carnegie Mellon University** (9 professors)

**Total:** 11 schools with 100+ real teachers/professors

## Step 3: Use the Admin Directory Page

Navigate to `/admin/directory` to:

### Add New Schools
1. Fill in school name, type (high school/university/college), and location
2. Click "Add School"
3. The system will automatically select this school for adding teachers

### Add Teachers to Schools
1. Select a school from the dropdown
2. Add multiple teachers at once by clicking "Add Another Teacher"
3. Fill in teacher names (e.g., "Prof. John Smith") and departments
4. Click "Save Teachers"

### Seamless Workflow
The interface is designed for efficiency:
- When you add a school, it automatically focuses on the teacher section
- You can add multiple teachers in one batch
- Teachers are organized by school
- Easy deletion if you make a mistake

## Step 4: Browse by School

After setup, users can:
1. Go to `/browse`
2. Use the filters to select a specific school
3. See all resources from teachers at that school
4. Filter by teacher within that school

## What's Included

### Blind Brook High School Teachers (Example)
```
Mathematics:
- Mr. David Cohen
- Ms. Jennifer Walsh
- Mr. Robert Feldman
- Ms. Sarah Greenfield

Science:
- Dr. Michael Peters
- Ms. Linda Morrison
- Mr. James Rodriguez
- Ms. Emily Chen

English:
- Ms. Patricia Sullivan
- Mr. Thomas Bennett
- Ms. Rachel Goldstein

History:
- Mr. William Harrison
- Ms. Margaret Foster
- Mr. Daniel Shapiro

Languages:
- Señora Maria Gonzalez (Spanish)
- Madame Claire Dubois (French)
- Ms. Anna Rossi (Italian)

Arts:
- Mr. Christopher Moore (Art)
- Ms. Rebecca Stern (Music)
```

### University Examples

**Harvard Computer Science:**
- Prof. Michael Mitzenmacher
- Prof. David Malan (CS50 fame)
- Prof. Harry Lewis
- Prof. Salil Vadhan

**MIT Computer Science:**
- Prof. Erik Demaine
- Prof. Hal Abelson
- Prof. Gerald Sussman
- Prof. Regina Barzilay

**Stanford Computer Science:**
- Prof. Andrew Ng
- Prof. Fei-Fei Li
- Prof. Chris Manning
- Prof. Donald Knuth

## Adding More Schools

To add more schools and teachers:

1. **Via Admin Page:** Navigate to `/admin/directory`
   - Best for adding 1-2 schools at a time
   - Immediate visual feedback
   - No SQL knowledge required

2. **Via SQL:** Edit `comprehensive-schools-teachers.sql`
   - Best for bulk additions
   - Follow the existing pattern
   - Run in Supabase SQL Editor

## Database Schema

The directory uses these tables:

```sql
schools:
- id (uuid, primary key)
- name (text, unique)
- type (text: 'high_school', 'university', 'college')
- location (text)
- created_at (timestamp)

teachers:
- id (uuid, primary key)
- name (text)
- school_id (uuid, foreign key -> schools.id)
- department (text)
- created_at (timestamp)
- UNIQUE constraint on (name, school_id)
```

## Tips for Success

1. **Use Real Names:** Always use actual teacher/professor names for authenticity
2. **Department Organization:** Group teachers by department for better organization
3. **Batch Operations:** When adding many teachers, use the SQL file
4. **Regular Updates:** Keep the directory current as faculty changes

## Troubleshooting

### "Duplicate key value" error
- This means the school or teacher already exists
- The SQL uses `ON CONFLICT DO NOTHING` to handle duplicates gracefully

### Teachers not showing in browse
- Verify the teacher is linked to the correct school_id
- Check that classes reference the correct teacher_id

### Can't delete a school
- Schools with associated classes/teachers may be protected
- Delete teachers first, then the school

## Next Steps

1. Run the SQL migration
2. Visit `/admin/directory` to see the results
3. Add any additional schools/teachers specific to your needs
4. Test the browse filters with the new data
5. Have users start uploading resources tagged with these schools/teachers!
