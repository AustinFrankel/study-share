# Storage Bucket Setup Instructions

## Issue: "No image available" when uploading files

If you see "No image available" or images aren't displaying after upload, this is likely because the Supabase storage bucket isn't configured correctly.

## Solution: Set up the storage buckets

This project uses two buckets:
- `resources` for study files and images
- `avatars` for user profile photos

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - For study assets:
     - Bucket name: `resources`
     - Public bucket: Yes
   - For profile photos:
     - Bucket name: `avatars`
     - Public bucket: Yes (public read is required for avatars to display)
5. Click **Create bucket** for each

### Method 2: Using SQL (Alternative)

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create public buckets
insert into storage.buckets (id, name, public)
values
  ('resources', 'resources', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true)
on conflict (id) do nothing;
```

Optional but recommended: Restrictive write policies for avatars so users can only manage their own files.

```sql
-- Allow public read of avatars
create policy if not exists "Public read access to avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Allow authenticated users to upload into a folder that matches their user id
create policy if not exists "Users can upload their own avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Allow users to update their own avatar files
create policy if not exists "Users can update their own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Allow users to delete their own avatar files
create policy if not exists "Users can delete their own avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );
```

## Important Notes

- The buckets must be named exactly `resources` and `avatars`
- Both buckets should be public for read access
- The app uploads avatar files to `avatars/<user_id>/<timestamp>-<filename>`
- If uploads fail with "Bucket not found", create the bucket(s) above and try again

## Troubleshooting

If you're still having issues:

1. Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`
2. Verify the `resources` and `avatars` buckets exist and are public in your Supabase dashboard
3. Try uploading a small image file (under 1MB) first
4. Check the browser console for any error messages during upload

The application uploads profile images to the `avatars` bucket and study files to the `resources` bucket.
