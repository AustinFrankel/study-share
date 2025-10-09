# October 8, 2025 - UI Fixes & Feature Additions

## Changes Made

### 1. ACT Test Dates Added ✅
**File:** `src/lib/test-dates.ts`
- Added 7 ACT test dates for 2025-2026:
  - September 20, 2025
  - October 26, 2025
  - December 14, 2025
  - February 7, 2026
  - April 4, 2026
  - June 13, 2026
  - July 18, 2026
- All ACT tests have purple gradient color (`from-purple-500 to-purple-600`) and 📊 icon
- Priority sorting includes ACT alongside SAT and PSAT

### 2. Admin: Waitlist Button Removed ✅
**File:** `src/components/Footer.tsx`
- Removed the "Admin: Waitlist" link from the Product navigation section
- Footer now only shows: Browse Resources, Upload Materials, My Profile

### 3. Test Sorting Fixed ✅
**File:** `src/app/live/page.tsx`
- Updated sorting logic to show:
  - **Upcoming tests:** Closest date first (October before November)
  - **Past tests:** Most recent first (October before September)
- Only tests within 30 days of today (Oct 8, 2025) will show
- This means only SAT Oct 4 (past), PSAT Oct 15 (7 days), ACT Oct 26 (18 days), and possibly SAT Nov 8 will appear
- 2026 tests (200+ days away) are automatically filtered out

### 4. Profile Page Fixed for Non-Signed-In Users ✅
**File:** `src/app/profile/page.tsx`
- Fixed freezing issue when visiting user profiles without being signed in
- Added logic to fetch target user data even when `!user` (not authenticated)
- Non-authenticated users can now view:
  - User profile information
  - User stats and rank
  - Recent resources uploaded by that user
- Only own profile features require authentication

### 5. User Search Functionality Added ✅
**File:** `src/app/search/page.tsx`
- Added user search to main search page
- New features:
  - **Search users by handle:** Shows matching users with avatar, handle, and points
  - **Follow/Unfollow:** Click to follow users, button shows "Following" when followed
  - **Block users:** Block button (red X icon) to block users
  - Blocked users are hidden from search results
  - Can't follow or see your own profile in results
  - Users sorted by total points (highest first)

### 6. Database Tables Created ✅
**File:** `study-resources/USER_FOLLOWS_BLOCKS.sql`
- Created `user_follows` table:
  - Tracks follower_id → followed_id relationships
  - Unique constraint prevents duplicate follows
  - Check constraint prevents self-following
- Created `user_blocks` table:
  - Tracks blocker_id → blocked_id relationships
  - Unique constraint prevents duplicate blocks
  - Check constraint prevents self-blocking
- Added indexes for performance
- Implemented Row Level Security (RLS) policies

## To Run the SQL Migration

Run this command to create the database tables:
```bash
cd /Users/austinfrankel/Downloads/AnswersHelp
node study-resources/scripts/db-run-sql.js --file study-resources/USER_FOLLOWS_BLOCKS.sql
```

Or run it directly in your Supabase SQL editor.

## User Interface Changes

### Search Page (http://localhost:3000/search?q=username)
- New "Users" section appears when searching
- Each user card shows:
  - Avatar (with gradient fallback)
  - Handle (clickable, links to profile)
  - Total points
  - "Follow" button (changes to "Following" when followed)
  - "Block" button (red X icon)
- Loading states on buttons during follow/block actions

### Live Page (http://localhost:3000/live)
- ACT tests now appear alongside SAT and PSAT
- Tests sorted by proximity (closest upcoming first)
- Past tests sorted by recency (most recent first)
- Only tests within 30 days shown

### Profile Pages (http://localhost:3000/profile?user=username)
- No longer freezes for non-signed-in users
- Public profiles viewable by anyone
- Shows user stats, resources, and activity

## Technical Notes

1. **30-Day Filter:** The filter is working correctly. Tests more than 30 days in the future won't appear (this is why 2026 AP exams at 200+ days don't show).

2. **Test Ordering:** 
   - Within same test type (SAT, ACT, etc.), upcoming tests show closest first
   - Past tests show most recent first (October 2025 before September 2025)

3. **User Relationships:**
   - Following is one-way (like Twitter/X)
   - Blocking automatically removes any existing follow relationship
   - Blocked users are filtered out of all search results

4. **Performance:**
   - User search limited to 10 results
   - Indexes added for fast follow/block queries
   - RLS policies ensure users can only modify their own follows/blocks

## Files Modified
1. `src/lib/test-dates.ts` - Added ACT dates
2. `src/components/Footer.tsx` - Removed admin button
3. `src/app/live/page.tsx` - Fixed test sorting
4. `src/app/profile/page.tsx` - Fixed profile viewing for non-authenticated users
5. `src/app/search/page.tsx` - Added user search, follow, and block functionality
6. `study-resources/USER_FOLLOWS_BLOCKS.sql` - New database migration

## Next Steps
1. Run the SQL migration to create user_follows and user_blocks tables
2. Test the follow/block functionality
3. Consider adding follower counts to user profiles
4. Consider adding a "Following" feed on the home page
