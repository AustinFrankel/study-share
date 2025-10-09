# OAuth Setup Guide - Fix Google Sign-In & Magic Links

## Problem
- Google OAuth shows "redirect_uri_mismatch" error
- Magic links redirect to localhost:3000 instead of your production URL
- Sign-in works locally but fails in production

## Solution

### Step 1: Update Supabase OAuth Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**

### Step 2: Configure Redirect URLs

Add the following URLs to **Redirect URLs** section:

#### For Local Development:
```
http://localhost:3000/auth/callback
```

#### For Production (replace with your actual domain):
```
https://your-domain.vercel.app/auth/callback
https://www.your-domain.com/auth/callback
```

**Important:** Make sure to add ALL domains where your app is hosted (Vercel preview URLs, production URL, custom domain, etc.)

### Step 3: Set Site URL

In the **Site URL** field, set your primary production URL:
```
https://your-domain.vercel.app
```

OR if you have a custom domain:
```
https://www.your-domain.com
```

### Step 4: Configure Google OAuth Provider

1. In Supabase, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Enter your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### Step 5: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:

```
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

Replace `YOUR-PROJECT-REF` with your actual Supabase project reference (found in your Supabase URL).

### Step 6: Verify Environment Variables

Make sure your `.env.local` has the correct values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

**Important:** `NEXT_PUBLIC_SITE_URL` should be your production URL, NOT localhost:3000

### Step 7: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

4. Redeploy your application for changes to take effect

## Testing

### Test Google OAuth:
1. Clear browser cookies and cache
2. Go to your production site
3. Click "Continue with Google"
4. Should redirect successfully without errors

### Test Magic Link:
1. Click "Sign in with Email"
2. Enter your email
3. Check your email for the magic link
4. Click the link - should redirect to your production site, not localhost

## Common Issues

### Issue: Still redirecting to localhost:3000
**Solution:** Check that `NEXT_PUBLIC_SITE_URL` is set correctly in Vercel environment variables and redeploy

### Issue: redirect_uri_mismatch error
**Solution:** 
1. Verify the redirect URI in Google Cloud Console matches your Supabase callback URL EXACTLY
2. Make sure you added your production domain to Supabase redirect URLs

### Issue: Magic link works locally but not in production
**Solution:** 
1. Make sure `NEXT_PUBLIC_SITE_URL` is set to production URL, not localhost
2. Verify Supabase Site URL is set to production domain
3. Redeploy after making changes

## Files Modified

The following files have been updated to fix these issues:

1. `/src/lib/auth.ts` - Uses `NEXT_PUBLIC_SITE_URL` for redirect URLs
2. `/src/app/auth/callback/route.ts` - Uses proper redirect URL from environment

## Need Help?

If you're still experiencing issues:
1. Check browser console for errors
2. Check Vercel function logs
3. Verify all URLs match exactly (including https vs http)
4. Make sure to redeploy after any environment variable changes
