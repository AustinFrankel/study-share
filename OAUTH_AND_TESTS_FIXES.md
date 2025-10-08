# OAuth Fixes & Site Improvements - October 2025

## ✅ Completed Fixes

### 1. Removed "PNG/JPG up to 5MB" Text
- **File**: `src/app/profile/page.tsx`
- **Change**: Removed the file size hint text from the avatar upload section
- **Location**: Profile page avatar upload area

### 2. Shortened Main Tagline
- **File**: `src/app/page.tsx`
- **Old**: "Find and share study guides, class notes, and past exams specific to your school, teacher, and class. Access AI-powered practice questions instantly."
- **New**: "Find study guides, notes, and past exams by class or teacher. Get AI practice questions instantly."
- **Impact**: More concise, mobile-friendly

### 3. Shortened Search Placeholder
- **File**: `src/components/SearchBar.tsx`
- **Old**: "Find study guides, notes, past exams by class or teacher..."
- **New**: "Search by class or teacher..."
- **Impact**: Cleaner, fits better on mobile

### 4. Fixed "Join the Waitlist" Button Cutoff on Mobile
- **File**: `src/app/live/page.tsx`
- **Changes**:
  - Changed text size from `text-sm sm:text-base` to `text-xs sm:text-sm md:text-base`
  - Added `truncate` class to button text spans
  - Reduced margins from `mr-2` to `mr-1 sm:mr-2`
- **Impact**: Button text no longer gets cut off on small mobile screens

### 5. Improved Mobile Profile Layout
- **File**: `src/app/profile/page.tsx`
- **Changes**:
  - Moved Edit and New Handle buttons below username on mobile
  - Changed from horizontal flex to vertical column layout on mobile
  - Username now uses `break-words` instead of `break-all`
  - Input fields and buttons stack vertically on mobile, horizontal on desktop
  - Added flex-wrap for better responsiveness
- **Impact**: Username fits properly across one line, buttons appear below on mobile

### 6. Adjusted Mobile Upload Button Position
- **File**: `src/components/Navigation.tsx`
- **Change**: Changed padding from `px-3` to `px-4` on mobile
- **Impact**: Upload button has slightly more padding, positioned better on mobile

---

## 🔧 OAuth & Magic Link Configuration Needed

### Issue 1: Google OAuth `redirect_uri_mismatch`

**Problem**: Google OAuth shows "Access blocked: Study Share's request is invalid" error.

**Root Cause**: The Google Cloud Console OAuth client doesn't have the correct Supabase callback URL configured.

**Fix Required**:

1. **Go to Google Cloud Console**:
   - Navigate to [Google Cloud Console](https://console.cloud.google.com)
   - Select your project
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID

2. **Add Authorized Redirect URI**:
   ```
   https://dnknanwmaekhtmpbpjpo.supabase.co/auth/v1/callback
   ```

3. **Save Changes**

### Issue 2: Magic Link Uses localhost Instead of studyshare.app

**Problem**: Magic link emails contain `localhost:3000` URLs instead of production domain.

**Root Cause**: The environment variable `NEXT_PUBLIC_SITE_URL` is set to `http://localhost:3000` in `.env.local`.

**Fix Required**:

1. **Update Vercel Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Update or add:
     ```
     NEXT_PUBLIC_SITE_URL=https://studyshare.app
     ```
   - Make sure to set this for **Production** environment
   - Click **Save**

2. **Update Supabase Configuration**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project: `dnknanwmaekhtmpbpjpo`
   - Navigate to **Authentication** → **URL Configuration**
   - Set **Site URL** to:
     ```
     https://studyshare.app
     ```
   - Under **Redirect URLs**, add:
     ```
     https://studyshare.app/auth/callback
     ```
   - Click **Save**

3. **Redeploy on Vercel**:
   - After updating environment variables, trigger a new deployment
   - The new deployment will pick up the updated `NEXT_PUBLIC_SITE_URL`

### Testing After Fixes

**Test Google OAuth**:
1. Go to `https://studyshare.app`
2. Click "Sign in with Google"
3. Should redirect successfully without errors

**Test Magic Link**:
1. Click "Sign in with Email"
2. Enter your email
3. Check your email for the magic link
4. Click the link - should redirect to `https://studyshare.app`, NOT `localhost:3000`

---

## 📋 Feature Request: Include Live Tests in Search/Browse

### Current State
- Live tests (SAT, ACT, AP Exams, etc.) are only visible on `/live` page
- Search and Browse pages only show uploaded study resources

### Requested Enhancement
Include live test countdowns and links in:
1. Search results page (`/search`)
2. Browse page (`/browse`)
3. Recent sections on homepage (`/`)

### Implementation Approach

This would require:

1. **Create a unified search/browse result type** that can include both:
   - Study resources (from `resources` table)
   - Live tests (from test dates constants)

2. **Update search logic** to:
   - Search through test names (SAT, ACT, AP exams)
   - Return test results alongside resource results
   - Prioritize upcoming tests in results

3. **Create a TestCard component** for search/browse:
   - Similar to ResourceCard but displays test countdown
   - Links to `/live/test?test={testId}` for past tests
   - Shows "Join Waitlist" for upcoming tests

4. **Modify these files**:
   - `src/app/search/page.tsx` - Add test search logic
   - `src/app/browse/page.tsx` - Include tests in browse
   - `src/app/page.tsx` - Show recent tests on homepage
   - Create `src/components/TestSearchCard.tsx` - Compact test display

### Example Implementation Snippet

```typescript
// In search/page.tsx or browse/page.tsx
import { STANDARDIZED_TESTS_2025, AP_EXAMS_2025 } from '@/lib/test-dates'

// Combine tests with resources
const allTests = [...STANDARDIZED_TESTS_2025, ...AP_EXAMS_2025]
const matchingTests = allTests.filter(test =>
  test.name.toLowerCase().includes(query.toLowerCase()) ||
  test.fullName.toLowerCase().includes(query.toLowerCase())
)

// Display both resources and tests
return (
  <>
    {matchingTests.length > 0 && (
      <section>
        <h2>Live Tests</h2>
        {matchingTests.map(test => (
          <TestSearchCard key={test.id} test={test} />
        ))}
      </section>
    )}

    <section>
      <h2>Study Resources</h2>
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </section>
  </>
)
```

### Recommended Next Steps

1. Clarify requirements:
   - Should tests appear mixed with resources or in a separate section?
   - Should all tests be shown or only relevant ones (e.g., upcoming)?
   - What should the priority/sorting be?

2. Create the TestSearchCard component

3. Update search and browse pages

4. Add tests to homepage recent section

**Note**: This feature was not implemented in this round of fixes. Would you like me to proceed with implementing this feature?

---

## Summary

All requested UI/mobile fixes have been completed ✅. The OAuth configuration requires manual updates in Google Cloud Console, Vercel, and Supabase (documented above). The live tests integration is a larger feature request that requires additional implementation work.
