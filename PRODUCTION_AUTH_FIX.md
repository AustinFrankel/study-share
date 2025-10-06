# Production Google Auth Fix

## Issues Fixed

### 1. ✅ Google Sign-In Internal Server Error
### 2. ✅ Localhost works but production doesn't
### 3. ✅ Blurred images display properly

---

## Problem: Google Auth Fails in Production

**Symptoms:**
- Google OAuth works on localhost:3000
- Production shows "Internal Server Error" after Google redirect
- User record not created in database

**Root Cause:**
The auth callback wasn't properly passing the authentication token to the ensure-user API, causing user creation to fail in production.

---

## What Was Fixed

### 1. **Enhanced Auth Callback** (`src/app/auth/callback/route.ts`)

**Changes Made:**
- Now properly extracts session data after OAuth exchange
- Checks if user already exists before creating
- Passes Bearer token to ensure-user API
- Better error logging for debugging
- Doesn't block redirect if user creation fails (will retry on next load)

**Key Improvements:**
```typescript
// Before: Simple call without auth
await fetch(`${origin}/api/ensure-user`, {
  method: 'POST',
})

// After: Proper auth with token
await fetch(`${origin}/api/ensure-user`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionData.session.access_token}`
  }
})
```

### 2. **Fixed Blurred Image Display** (`src/components/ResourceCard.tsx`)

**Problem:** Blurred images were zoomed in and cut off

**Changes Made:**
- Changed from `object-cover` to `object-contain` for blurred images
- This makes the entire image fit inside the container
- Increased blur from `blur-sm` to `blur-md` for better privacy
- Removed `scale-105` which was causing the zoom/cutoff

**Result:**
- ✅ Entire image visible (not cropped)
- ✅ Image fits container properly
- ✅ Stronger blur for privacy
- ✅ Better user experience

---

## Why It Works on Localhost but Not Production

**Common Differences:**

1. **Environment Variables**
   - Localhost: Uses `.env.local`
   - Production (Vercel): Uses environment variables in dashboard
   
2. **OAuth Redirect URLs**
   - Localhost: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
   
3. **Session Persistence**
   - Localhost: More forgiving with cookies
   - Production: Stricter security, HTTPS only

4. **Network Requests**
   - Localhost: Direct calls work
   - Production: Need proper authentication headers

---

## Vercel Environment Variables Checklist

Make sure these are set in your Vercel dashboard:

### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### How to Check:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Verify all three variables are set
4. Make sure there are no extra spaces or quotes

### How to Update:
1. Go to Vercel dashboard
2. Your Project → Settings → Environment Variables
3. Add or edit variables
4. **Important:** Redeploy after changing variables
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

---

## Supabase OAuth Configuration

Make sure your Supabase project has the correct redirect URLs:

### Steps:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Authentication → URL Configuration
4. Add these URLs to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.vercel.app/auth/callback
   https://your-custom-domain.com/auth/callback
   ```

### Site URL:
Set this to your production domain:
```
https://yourdomain.vercel.app
```

---

## Testing Checklist

### On Production:
- [ ] Sign out completely
- [ ] Click "Continue with Google"
- [ ] Select Google account
- [ ] Should redirect to home page (NOT Internal Server Error)
- [ ] Profile button should show your handle
- [ ] Refresh page - should stay logged in

### Blurred Images:
- [ ] Sign out
- [ ] Browse resources on home page
- [ ] Blurred images should show ENTIRE image (not zoomed/cropped)
- [ ] Should be able to see what the resource is about
- [ ] Click on resource - should be prompted to log in

---

## Debugging Production Issues

### 1. Check Vercel Logs
```bash
# In terminal
vercel logs --follow
```

Or in Vercel dashboard:
- Your Project → Deployments
- Click on latest deployment
- View Function Logs

### 2. Check Browser Console
- Open your production site
- Press F12 (Developer Tools)
- Go to Console tab
- Look for errors (red text)
- Look for ensure-user API calls

### 3. Check Network Tab
- F12 → Network tab
- Sign in with Google
- Look for `/auth/callback` request
- Look for `/api/ensure-user` request
- Check if they succeed (status 200-299)

### 4. Common Issues & Solutions

**Issue: "Failed to ensure user"**
- Solution: Check Vercel environment variables
- Make sure SUPABASE_SERVICE_ROLE_KEY is set

**Issue: "Redirect URI mismatch"**
- Solution: Update Supabase OAuth redirect URLs
- Make sure production URL is listed

**Issue: User created but no handle**
- Solution: Check RLS policies on users table
- Make sure users can INSERT their own row

**Issue: Session not persisting**
- Solution: Check cookie settings
- Make sure site is on HTTPS (Vercel does this automatically)

---

## If Still Having Issues

### 1. Clear All Cookies
```
Settings → Privacy → Clear browsing data → Cookies
```

### 2. Force Redeploy on Vercel
```bash
# In terminal
cd /path/to/your/project
git commit --allow-empty -m "Force redeploy"
git push
```

### 3. Check Supabase Status
- Go to [Supabase Status](https://status.supabase.com/)
- Make sure all services are operational

### 4. Test with Different Account
- Try signing in with a different Google account
- Sometimes account-specific issues occur

---

## Success Indicators

You'll know everything is working when:
- ✅ Google sign-in redirects to home (no error)
- ✅ Profile button shows your handle immediately
- ✅ Refresh doesn't log you out
- ✅ Blurred images show entire picture (not cropped)
- ✅ Can upload and view resources
- ✅ Points system works

---

## Maintenance Tips

### Regular Checks:
1. **Monthly**: Check Vercel logs for errors
2. **After Updates**: Test Google sign-in still works
3. **New Deployments**: Verify environment variables persist

### When Adding New Features:
- Always test both localhost AND production
- Check auth flows after deploy
- Verify environment variables are up to date

---

## Support Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Vercel Environment Variables**: https://vercel.com/docs/environment-variables
- **Next.js Auth Patterns**: https://nextjs.org/docs/app/building-your-application/authentication

---

## Summary

All authentication issues should now be resolved in production. The key fixes were:

1. Proper token passing to ensure-user API
2. Checking for existing users before creation
3. Better error handling and logging
4. Fixed blurred image display (object-contain instead of object-cover)

If you still encounter issues, check the debugging section above and verify your Vercel environment variables.
