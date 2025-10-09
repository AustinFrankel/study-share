# Setup Instructions for Study Share

## 🔧 Database Setup (REQUIRED)

### Step 1: Run the Resource Ratings Migration

**Go to your Supabase Dashboard:**
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `/supabase/migrations/026_resource_ratings.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will create the `resource_ratings` table needed for star ratings to work.

### Step 2: Verify Storage Setup

**Check your Storage bucket:**
1. In Supabase Dashboard, click **Storage** in the left sidebar
2. Verify you have a bucket named `resources`
3. If not, create it:
   - Click **Create bucket**
   - Name it `resources`
   - Make it **Public** (or configure RLS policies as needed)

### Step 3: Run Previous Migrations (If Not Already Done)

If you haven't already run the other migrations, run them in order in the SQL Editor:
- `001_initial_schema.sql`
- `002_indexes.sql`
- `003_rls_policies.sql`
- ... (all migrations in numbered order)

## 🎨 What Was Fixed

### 1. ✅ Star Ratings Database
- Created `resource_ratings` table with proper RLS policies
- Fixed "table not found" error when rating resources
- Stars now work correctly without entering the post

### 2. ✅ Image Display
- Fixed images being cut off at the top
- Changed from `object-cover` to `object-contain` for full image visibility
- Images now display properly within their containers

### 3. ✅ Blank Space Removal
- Removed huge blank space when no image exists on a resource card
- Cards now only show image container when an image is present

### 4. ✅ Star Rating Visual Improvements
- Thicker star outlines (strokeWidth: 2.5)
- Better contrast with darker gray for unfilled stars (text-gray-400)
- Stars are more visible and look better

### 5. ✅ Navigation Bar Improvements
- **Full "Study Share" logo always visible** (no more "SS" abbreviation)
- **Better button spacing** - not too cluttered
- Consistent button heights (h-9 on mobile, h-10 on desktop)
- Better spacing between elements (space-x-2 to space-x-3)
- Larger icons in profile/notification buttons

### 6. ✅ Google Sign-In Styling
- **Removed bland "or" text** - now says "Or continue with"
- Better visual separator with full-width divider
- Improved button styling with gray hover (not blue)
- Better button height (h-12) and padding
- More professional appearance

### 7. ✅ Vote Buttons Work Correctly
- Up/down vote buttons now work on all pages without entering the post
- Properly styled with correct sizes

## 🚀 How to Test

1. **Test Star Ratings:**
   - Go to homepage
   - Click on any star (1-5) on a resource card
   - Should work without errors
   - Should see rating update immediately

2. **Test Vote Buttons:**
   - Click up/down arrows on any resource card
   - Should work without entering the post
   - Vote count should update

3. **Test Mobile Responsiveness:**
   - Press F12 to open DevTools
   - Click the device toggle icon (or Cmd/Ctrl + Shift + M)
   - Select "iPhone SE" or similar small device
   - Navigate around the site
   - Check that:
     - "Study Share" logo is fully visible
     - Buttons are not too cluttered
     - Images display correctly
     - No weird blank spaces

4. **Test Google Sign-In:**
   - Sign out if logged in
   - Click "Profile" or "Sign In"
   - Check the modal looks good
   - Verify "Or continue with" divider looks professional

## 📝 Notes

- **Upload Password:** Still "Austin11!" for testing
- **Google OAuth:** The app name shown in Google's consent screen is controlled by your Google Cloud Console project settings, not the code
- **To change the app name in Google OAuth:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Select your project
  3. Go to **APIs & Services** > **OAuth consent screen**
  4. Edit the **Application name** field
  5. Save changes

## 🔐 Supabase App Name

The name shown next to "supabase" in Google's account chooser comes from your **Supabase project settings**:

1. Go to your Supabase Dashboard
2. Click **Settings** (gear icon) in the left sidebar
3. Go to **General** settings
4. Change the **Project name** to "Study Share"
5. This will update what users see when authenticating

## ✅ All Fixed Issues Summary

- ✅ Resource ratings database table created
- ✅ Star rating errors fixed
- ✅ Images no longer cut off at the top
- ✅ Blank spaces removed when no image present
- ✅ Star outlines thicker and more visible
- ✅ Vote buttons work without entering posts
- ✅ Navigation shows full "Study Share" logo always
- ✅ Better button spacing (not cluttered)
- ✅ Google sign-in looks much better
- ✅ "Or continue with" divider improved

Everything should now work perfectly! 🎉
