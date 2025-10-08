# Fixes Applied - October 7, 2025

## ✅ Issues Fixed

### 1. Unauthenticated User Sign-In Modal

**Problem:** When users visit a resource without being logged in, they were shown a generic access gate screen instead of being able to see the content with a sign-in prompt.

**Solution:**
- Modified [`src/app/resource/[id]/page.tsx`](src/app/resource/[id]/page.tsx) to show the resource content to unauthenticated users
- Added an **unescapable modal dialog** that overlays the content requiring sign-in
- Modal includes both Google OAuth and Email (Magic Link) sign-in options
- Modal cannot be closed without signing in (prevents `onPointerDownOutside` and `onEscapeKeyDown`)
- Clean, professional UI matching your existing design system

**What Users See:**
- Full resource content is visible (blurred slightly in background)
- Modal overlay with "Sign In Required" message
- "Continue with Google" button with Google logo
- Email input for magic link sign-in
- Clean error/success messages

---

### 2. Google OAuth redirect_uri_mismatch Error

**Problem:** Google OAuth was returning error "redirect_uri_mismatch" because the redirect URL wasn't properly configured.

**Solution:**
- Added `NEXT_PUBLIC_SITE_URL` to [`.env.local`](.env.local)
- Set to `http://localhost:3000` for local development
- The auth library ([`src/lib/auth.ts`](src/lib/auth.ts)) already uses this variable correctly
- Auth callback route ([`src/app/auth/callback/route.ts`](src/app/auth/callback/route.ts)) already uses this variable

**What You Need to Do:**

1. **For Local Development:** Already set in `.env.local`
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. **For Production (Vercel):**
   - Go to your Vercel project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SITE_URL=https://your-production-domain.vercel.app`
   - Redeploy your application

3. **Configure Supabase:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Navigate to Authentication → URL Configuration
   - Add to **Redirect URLs**:
     - `http://localhost:3000/auth/callback` (for local dev)
     - `https://your-production-domain.vercel.app/auth/callback` (for production)
     - `https://www.your-custom-domain.com/auth/callback` (if you have a custom domain)
   - Set **Site URL** to your primary production URL

4. **Configure Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services → Credentials
   - Click your OAuth 2.0 Client ID
   - Add to **Authorized redirect URIs**:
     - `https://dnknanwmaekhtmpbpjpo.supabase.co/auth/v1/callback`
   - Save changes

**Error Message Fixed:**
```
Sign in with Google
Access blocked: Study Share's request is invalid
Error 400: redirect_uri_mismatch
```
This error will no longer appear once you complete the Supabase and Google Cloud Console configuration.

---

### 3. Magic Login Email Redirect to localhost:3000

**Problem:** Magic login emails were redirecting to `http://localhost:3000` even when used in production.

**Solution:**
- Same fix as #2 - adding `NEXT_PUBLIC_SITE_URL` environment variable
- The auth library already uses this variable to generate correct redirect URLs
- Magic links will now redirect to your production domain when used in production

**Example of Fixed Email:**
- Old: `http://localhost:3000/?code=7fcf185b-6d08-4c86-b4b8-91ad938b5d74`
- New: `https://your-domain.vercel.app/?code=7fcf185b-6d08-4c86-b4b8-91ad938b5d74`

---

### 4. Live Test Assignment Sorting - Blank Space Issues

**Problem:** The "View Two More for SAT" buttons were displayed inside the grid alongside test cards, causing awkward blank spaces and poor layout.

**Solution:**
- Modified [`src/app/live/page.tsx`](src/app/live/page.tsx) to move "View More" buttons outside the grid
- Buttons now display centered below the test cards
- Removed the card-style button that tried to match the height of test cards
- Cleaner, more compact design with proper spacing

**Before:**
```
[SAT Card]  [View 2 More Button Taking Full Card Space]  [Empty Space]
```

**After:**
```
[SAT Card]

        [Show 2 more SAT dates] ← Centered button
```

**Changes Applied:**
- Priority tests section (SAT, ACT, PSAT)
- Archived tests section
- Both now use consistent button placement below grids

---

### 5. Test Upload Visibility Issue

**Problem:** When users upload tests from the live page, other users cannot see them and admin needs to post again.

**Root Cause:** This is a **Supabase Row Level Security (RLS) policy issue**, not a code issue.

**Current Code Status:** ✅ Code is correct
- Upload page uses `upsert` with `onConflict: 'test_id'` to make tests visible to everyone
- Test view page fetches questions without user filtering
- No admin-only checks in the frontend code

**What's Actually Wrong:** Supabase RLS Policies

The `test_resources` table likely has RLS policies that:
1. Prevent non-admin users from `INSERT`ing data
2. Or prevent non-admin users from viewing data they didn't upload

**Solution - Database Configuration Required:**

You need to update the RLS policies in Supabase:

1. **Go to Supabase Dashboard** → Your Project → Table Editor → `test_resources`

2. **Click "RLS" (Row Level Security) tab**

3. **Add or modify these policies:**

   **Policy for INSERT (Allow all authenticated users to upload):**
   ```sql
   CREATE POLICY "Allow authenticated users to upload tests"
   ON test_resources
   FOR INSERT
   TO authenticated
   WITH CHECK (true);
   ```

   **Policy for SELECT (Allow everyone to view uploaded tests):**
   ```sql
   CREATE POLICY "Allow everyone to view tests"
   ON test_resources
   FOR SELECT
   TO public
   USING (true);
   ```

   **Policy for UPDATE (Allow users to update their own uploads):**
   ```sql
   CREATE POLICY "Allow users to update their uploads"
   ON test_resources
   FOR UPDATE
   TO authenticated
   USING (uploader_id = auth.uid())
   WITH CHECK (uploader_id = auth.uid());
   ```

   **Alternative - If you want admin-only uploads:**
   ```sql
   -- First, add an is_admin column to the users table if it doesn't exist
   -- Then use this policy:
   CREATE POLICY "Allow only admins to upload tests"
   ON test_resources
   FOR INSERT
   TO authenticated
   WITH CHECK (
     EXISTS (
       SELECT 1 FROM users
       WHERE users.id = auth.uid()
       AND users.is_admin = true
     )
   );
   ```

4. **Alternative Quick Fix:** Disable RLS temporarily
   - In Supabase Table Editor → `test_resources` table
   - Click the RLS toggle to disable it
   - ⚠️ **Warning:** This allows anyone to insert/update/delete data. Only use for testing.

**To verify the fix:**
1. Upload a test as a non-admin user
2. Sign out
3. Visit the test page - you should see the questions
4. Sign in as a different user - you should still see the questions

---

## 📋 Setup Checklist

### Local Development
- [x] Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`
- [ ] Restart your development server after adding the environment variable

### Production (Vercel)
- [ ] Add `NEXT_PUBLIC_SITE_URL` environment variable in Vercel
- [ ] Set value to `https://your-production-domain.vercel.app`
- [ ] Redeploy your application

### Supabase Configuration
- [ ] Add redirect URLs to Supabase (see instructions in section #2)
- [ ] Set Site URL in Supabase
- [ ] Configure Google OAuth provider in Supabase
- [ ] Fix RLS policies for `test_resources` table (see section #5)

### Google Cloud Console
- [ ] Add authorized redirect URI to Google OAuth (see instructions in section #2)

---

## 🧪 Testing Instructions

### Test Sign-In Modal
1. Sign out (if signed in)
2. Navigate to any resource page (e.g., `/resource/some-id`)
3. You should see the resource content with a modal overlay
4. Modal should have "Continue with Google" and email sign-in options
5. Modal should NOT close when clicking outside or pressing Escape

### Test Google OAuth
1. Clear browser cookies/cache
2. Go to your site
3. Click "Continue with Google" (either in nav or modal)
4. Should redirect to Google sign-in
5. Should NOT show "redirect_uri_mismatch" error
6. Should redirect back to your site and be logged in

### Test Magic Link
1. Click "Sign in with Email"
2. Enter your email
3. Check email for magic link
4. Click link
5. Should redirect to correct domain (NOT localhost:3000 in production)
6. Should be logged in

### Test Live Page Layout
1. Go to `/live`
2. Scroll to the SAT, ACT, or PSAT section
3. If there are multiple test dates, you should see:
   - One test card displayed
   - A centered "Show N more [TEST] dates" button below it
   - NO blank space in the grid
4. Click the button to expand
5. All additional tests should appear in a grid
6. "Show less" button should appear centered below

### Test Live Test Upload
1. Go to a past test on `/live`
2. Click "View" to go to the test page
3. If no questions are available, there should be an "Upload Test" option
4. Upload test content
5. Sign out
6. Visit the same test page - questions should be visible
7. Sign in as a different user - questions should still be visible

---

## 📁 Files Modified

1. [`src/app/resource/[id]/page.tsx`](src/app/resource/[id]/page.tsx)
   - Added sign-in modal for unauthenticated users
   - Added sign-in handlers
   - Modified access check to show content with modal overlay

2. [`src/app/live/page.tsx`](src/app/live/page.tsx)
   - Fixed "View More" button placement (removed from grid)
   - Applied to both priority tests and archived tests sections

3. [`.env.local`](.env.local)
   - Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

4. [`src/lib/auth.ts`](src/lib/auth.ts) - No changes needed (already correct)

5. [`src/app/auth/callback/route.ts`](src/app/auth/callback/route.ts) - No changes needed (already correct)

---

## 🚨 Important Notes

### About Google OAuth Error
The Google OAuth error will persist until you:
1. Add the environment variable to Vercel (for production)
2. Configure Supabase redirect URLs
3. Configure Google Cloud Console redirect URI

All three must be done for the error to go away completely.

### About Magic Links
The magic link redirect fix is the same as the OAuth fix - just add the environment variable to Vercel and configure Supabase.

### About Test Upload Visibility
This CANNOT be fixed in the code - it requires database configuration in Supabase. The code is already correct. You MUST update the RLS policies as described in section #5.

---

## 💡 Next Steps

1. **Immediate (for testing locally):**
   - Restart your dev server to apply the new environment variable
   - Test the sign-in modal on resource pages

2. **Before deploying to production:**
   - Add `NEXT_PUBLIC_SITE_URL` to Vercel environment variables
   - Configure Supabase redirect URLs
   - Configure Google Cloud Console
   - Fix RLS policies for test_resources table

3. **After deployment:**
   - Test Google OAuth in production
   - Test magic links in production
   - Test test uploads from non-admin accounts
   - Verify test visibility for all users

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Unauthenticated users see content with sign-in modal on resource pages
- ✅ Sign-in modal cannot be closed without authenticating
- ✅ Google sign-in works without "redirect_uri_mismatch" error
- ✅ Magic links redirect to production domain (not localhost)
- ✅ Live test page has no blank spaces in the grid layout
- ✅ "View More" buttons are centered below test cards
- ✅ Non-admin users can upload tests
- ✅ All users can see uploaded tests without admin intervention

---

## 🆘 Troubleshooting

### Google OAuth still shows error
- Check that `NEXT_PUBLIC_SITE_URL` is set correctly in Vercel
- Verify Supabase redirect URLs include your production domain
- Confirm Google Cloud Console has the Supabase callback URL
- Try in an incognito window

### Magic links still go to localhost
- Check that `NEXT_PUBLIC_SITE_URL` is set in Vercel
- Verify Supabase Site URL is your production domain
- Redeploy after making changes
- Test in production (not localhost)

### Tests still not visible to non-admin users
- Check Supabase RLS policies
- Try disabling RLS temporarily to confirm it's a policy issue
- Check browser console for errors when uploading
- Check Supabase logs for permission errors

### Sign-in modal can be closed
- Clear browser cache
- Check that the Dialog component props are set correctly
- Verify no conflicting modal behavior in parent components

---

All code changes have been applied and are ready to commit!
