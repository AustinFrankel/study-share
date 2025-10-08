# Critical Fixes Applied - October 7, 2025 (Part 3)

## Issues Fixed

### 1. ✅ Resources Not Showing in "Recent Resources" on Homepage
**Problem**: After uploading resources, they weren't appearing in the "Recent Resources" section on the homepage, even though they appeared correctly in the Browse page.

**Root Cause**:
- The homepage didn't have a mechanism to detect when new resources were uploaded
- The Browse page had refresh detection logic (added in Part 2), but the homepage was missing this
- Users navigating to homepage after upload wouldn't see their new content

**Solution**:
- **File**: `src/app/page.tsx`
  - Added `useSearchParams` import from Next.js
  - Added refresh detection `useEffect` hook similar to Browse page
  - When `?refresh=timestamp` parameter is detected, forces a fresh fetch of resources
  - Logs refresh action for debugging purposes

**Changes**:
```typescript
// Added import
import { useSearchParams } from 'next/navigation'

// Added refresh detection
const searchParams = useSearchParams()

useEffect(() => {
  const refresh = searchParams?.get('refresh')
  if (refresh && isSupabaseConfigured) {
    console.log('🔄 Forcing homepage refresh due to new upload')
    fetchResources()
  }
}, [searchParams?.get('refresh')])
```

---

### 2. ✅ StorageApiError: Invalid Key with Spaces and Special Characters
**Problem**: When uploading files with spaces, apostrophes, or special characters in the filename (e.g., "Austin's Screenshot 2025-10-07 at 5.05.50 PM.png"), Supabase Storage API rejected the upload with an "Invalid key" error.

**Root Cause**:
- Supabase Storage bucket paths cannot contain certain special characters including:
  - Spaces
  - Apostrophes (')
  - Other special characters
- The code was using raw filenames without sanitization
- This affected both profile picture uploads and resource file uploads

**Solution**:
- **File 1**: `src/app/profile/page.tsx` (Profile Picture Upload)
  - Added filename sanitization in `handleAvatarFileChange`
  - Replaces spaces and apostrophes with underscores
  - Removes all special characters except alphanumeric, dots, underscores, and hyphens

- **File 2**: `src/components/UploadWizard.tsx` (Resource File Upload)
  - Added file extension sanitization in `handleSubmit`
  - Sanitizes extension to prevent storage path errors
  - Removes special characters from file extensions

**Changes**:
```typescript
// Profile picture upload fix
const sanitizedFileName = file.name
  .replace(/['\s]+/g, '_')  // Replace spaces and apostrophes with underscores
  .replace(/[^a-zA-Z0-9._-]/g, '')  // Remove other special characters
const filePath = `${user.id}/${Date.now()}-${sanitizedFileName}`

// Resource file upload fix
const fileExt = uploadFile.file.name.split('.').pop()
const sanitizedExt = fileExt?.replace(/[^a-zA-Z0-9]/g, '') || 'file'
const fileName = `${resource.id}/${uploadFile.id}.${sanitizedExt}`
```

---

### 3. ✅ Upload Wizard Resetting to Step 1/4 on Errors
**Problem**: When a file upload failed (e.g., due to the invalid filename issue above), users were sometimes sent back to step 1/4 of the wizard, losing their progress and having to re-enter all information.

**Root Cause**:
- When upload failed, the error handling didn't properly maintain wizard state
- File objects were marked with errors but progress wasn't reset cleanly
- Error messages weren't clear about what went wrong or how to fix it
- Upload progress indicators remained at partial completion, confusing users

**Solution**:
- **File**: `src/components/UploadWizard.tsx`
  - Improved error handling in the file upload loop
  - Ensures failed files remain in the files array (for retry)
  - Explicitly sets `uploaded: false` on failed files
  - Resets upload progress to 0 on failure
  - Clears processing status message
  - Provides clearer error message with guidance
  - Stays on step 4 so users can see the error and retry
  - Added comment explaining the behavior

**Changes**:
```typescript
catch (error) {
  console.error(`Error uploading ${uploadFile.file.name}:`, error)
  setFiles(prev => prev.map(f =>
    f.id === uploadFile.id ? { ...f, error: 'Upload failed', progress: 0, uploaded: false } : f
  ))
  const errorMsg = error instanceof Error ? error.message : 'Unknown error'
  setError(`Failed to upload ${uploadFile.file.name}: ${errorMsg}. Please try removing and re-adding the file.`)
  setLoading(false)
  setUploadProgress(0)
  setProcessingStatus('')
  // Don't reset to step 1 - stay on step 4 so user can see the error and retry
  return
}
```

---

## Testing Recommendations

### 1. Homepage Refresh Testing
- [ ] Upload a new resource through `/upload`
- [ ] Wait for the success message and auto-redirect
- [ ] Verify the newly uploaded resource appears in "Recent Resources" on homepage
- [ ] Check browser console for `🔄 Forcing homepage refresh` message
- [ ] Verify resource details are correct

### 2. Filename Sanitization Testing
**Profile Pictures:**
- [ ] Navigate to profile page
- [ ] Upload an image with spaces in filename (e.g., "my avatar.jpg")
- [ ] Upload an image with apostrophe (e.g., "John's photo.png")
- [ ] Upload an image with special chars (e.g., "test@image#1.jpg")
- [ ] Verify all uploads succeed without "Invalid key" errors
- [ ] Check that images display correctly after upload

**Resource Files:**
- [ ] Navigate to upload page
- [ ] Upload file with spaces (e.g., "Chapter 5 Notes.pdf")
- [ ] Upload file with apostrophe (e.g., "Austin's Screenshot.png")
- [ ] Upload file with mixed special chars
- [ ] Verify all uploads succeed
- [ ] Verify files can be downloaded from resource page

### 3. Upload Error Handling Testing
- [ ] Start a new resource upload
- [ ] Progress to step 4 (final upload step)
- [ ] If upload fails for any reason, verify:
  - User stays on step 4 (not sent back to step 1)
  - Error message is displayed clearly
  - Error message includes helpful guidance
  - Upload progress is reset to 0
  - Processing status is cleared
  - Files remain in the list (can be retried or removed)

---

## Files Modified

1. **src/app/page.tsx**
   - Added `useSearchParams` import
   - Added refresh detection logic for homepage resource updates

2. **src/app/profile/page.tsx**
   - Added filename sanitization for profile picture uploads
   - Prevents storage errors from special characters

3. **src/components/UploadWizard.tsx**
   - Added file extension sanitization for resource uploads
   - Improved error handling to prevent wizard reset
   - Enhanced error messages with user guidance

---

## Impact

- **Reliability**: Resources now consistently appear on homepage after upload
- **UX**: Users can upload files with any filename without encountering cryptic storage errors
- **Error Recovery**: Upload failures no longer lose user progress, allowing easy retry
- **Data Integrity**: Filenames are automatically sanitized while preserving file content

---

## Notes

- All fixes are backward compatible
- No database schema changes required
- No additional dependencies added
- Sanitization preserves file extensions and content
- Only affects storage path naming, not display names
- Console logging retained for debugging

---

## Related Issues Resolved

These fixes resolve the following user-reported issues:
1. "Recent Resources View All No resources yet Be the first to upload study materials!" - Resources now appear after upload
2. "Invalid key: b309d267-c453-4e08-9035-834b452b92d6/1759872661404-Austin's Screenshot 2025-10-07 at 5.05.50 PM.png" - Filenames are now sanitized
3. "when i upload a photo it still takes me back to 1/4" - Wizard no longer resets on upload errors
