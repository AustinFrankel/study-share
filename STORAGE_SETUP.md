# Storage Bucket Setup Instructions

## Issue: "No image available" when uploading files

If you see "No image available" or images aren't displaying after upload, this is likely because the Supabase storage bucket isn't configured correctly.

## Solution: Set up the storage bucket

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Bucket name**: `resources`
   - **Public bucket**: ✅ **Yes** (must be public for images to display)
   - **File size limit**: `10MB`
5. Click **Create bucket**

### Method 2: Using SQL (Alternative)

Run this SQL command in your Supabase SQL editor:

```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true);
```

## Important Notes

- The bucket **must** be named `resources` (not `resource-files` or anything else)
- The bucket **must** be public for images to display in the browser
- After creating the bucket, try uploading a file again
- If it still doesn't work, check the browser console for specific error messages

## Troubleshooting

If you're still having issues:

1. Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly in `.env.local`
2. Verify the storage bucket exists and is public in your Supabase dashboard
3. Try uploading a small image file (under 1MB) first
4. Check the browser console for any error messages during upload

The application will try to upload to `resources` bucket first, and if that fails, it will try `resource-files` as a fallback.
