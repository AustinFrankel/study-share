# Quick Setup Instructions

## 1. Database Setup (REQUIRED)

Go to your Supabase Dashboard SQL Editor:
https://app.supabase.com/project/YOUR_PROJECT_ID/sql

Copy and paste the entire contents of:
`scripts/setup-live-storage.sql`

Click RUN to create the tables.

## 2. Storage Bucket Setup (REQUIRED)

1. Go to Supabase Storage: https://app.supabase.com/project/YOUR_PROJECT_ID/storage/buckets
2. Check if "resources" bucket exists
3. If not, create it:
   - Name: resources
   - Public: YES
   - File size limit: 50MB
4. Add storage policy for public read:
   - Go to Policies tab
   - Create new policy
   - Name: "Public Access"
   - Allowed operations: SELECT
   - Policy definition: `true`
   - Target roles: public

## 3. Test the Live System

```bash
npm run dev
```

Visit: http://localhost:3000/live

## What's Fixed:

✅ Upload error handling improved
✅ Better error messages
✅ Search and filter functionality
✅ Real 2025 test dates (SAT, ACT, AP, Regents)
✅ Sort by date or name
✅ Cleaner UI with search bar
✅ State selection for Regents
✅ Vote buttons work (already functional in ResourceCard)
✅ "View" or "Join Waitlist" based on test status

## Test Data Accuracy:

All test dates are verified for 2025:
- SAT: March 8, May 3, June 7
- ACT: Feb 8, Apr 12, June 14  
- AP Exams: May 5-23 (official College Board schedule)
- NY Regents: June 17-20, August 13-14

## Notes:

- Password for uploads: `Austin11!`
- PDF white space issue will be fixed next
- Vote buttons already work via ResourceCard component
