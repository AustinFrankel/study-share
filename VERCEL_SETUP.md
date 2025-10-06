# Vercel Deployment Setup

## ✅ All Fixes Applied

1. **Fixed SSR Error**: Removed `heic2any` import from GlobalDropzone.tsx to prevent "window is not defined" error
2. **Fixed Stars & Subjects Cutoff**: Changed card overflow from `overflow-hidden` to `overflow-visible` and improved wrapping
3. **Fixed Photo Display**: 
   - Changed image from `object-contain` to `object-cover` so photos fill the card
   - Added `rounded-t-xl` to top of image container
   - Improved blur gradient to extend from bottom with more opacity
4. **Fixed Overscroll**: Added `overscroll-behavior-y: none` to prevent iOS/Safari bounce showing background
5. **Reduced Navigation Height**: Changed nav from `h-16` to `h-14`, buttons from `h-9/h-10` to `h-8/h-9`

## 🚀 Vercel Environment Variables

Copy and paste these into your Vercel project's Environment Variables section:

### Production, Preview, and Development (check all three)

```
NEXT_PUBLIC_SUPABASE_URL=https://dnknanwmaekhtmpbpjpo.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua25hbndtYWVraHRtcGJwanBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjQ3MDksImV4cCI6MjA3MzcwMDcwOX0.B2rvyWyZJQclEAQRzzpqVY0ZHxWl5FwZ8cV-dJo82_o
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua25hbndtYWVraHRtcGJwanBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEyNDcwOSwiZXhwIjoyMDczNzAwNzA5fQ.V07J-s8lbWp4TDhVosqESBECR1VsLl-J29fzTbO_Kzg
```

## 📋 Step-by-Step Vercel Deployment

1. **Connect GitHub Repo**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your GitHub account and select `study-share` repository
   - Click "Import"

2. **Configure Project**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` or `next build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Add Environment Variables**
   - Click "Environment Variables" section
   - For each variable above:
     - Enter the **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
     - Enter the **Value** (the long string)
     - Check **Production**, **Preview**, and **Development**
     - Click "Add"
   - Repeat for all 3 variables

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://study-share-[random].vercel.app`

5. **Custom Domain (Optional)**
   - Go to Project Settings > Domains
   - Add your custom domain (e.g., `studyshare.com`)
   - Follow DNS configuration instructions

## 🔄 Future Deployments

Every time you push to the `main` branch on GitHub, Vercel will automatically:
- Build your changes
- Run tests
- Deploy to production
- No manual steps needed!

## 🎯 Supabase Project Info

- **Project URL**: https://supabase.com/dashboard/project/dnknanwmaekhtmpbpjpo
- **Project ID**: dnknanwmaekhtmpbpjpo
- **Region**: US East (probably)

## 📊 Next Steps After Deployment

1. **Test the deployment**: Visit your Vercel URL and test all features
2. **Enable Analytics**: Go to Vercel dashboard > Analytics tab > Enable
3. **Monitor Logs**: Check Vercel dashboard > Logs for any runtime errors
4. **Set up Custom Domain**: If you have one
5. **Enable Web Vitals**: Vercel provides free performance monitoring

## 💰 Costs at Scale

### Current (Free Tier)
- Vercel Hobby: FREE (100GB bandwidth/month, unlimited deployments)
- Supabase Free: FREE (500MB database, 1GB file storage, 50MB file uploads)

### At 100k Monthly Users (Estimated)
- **Vercel Pro**: $20/month (1TB bandwidth, better performance)
- **Supabase Pro**: $25/month (8GB database, 100GB storage, 50GB bandwidth)
- **Total**: ~$45/month

### At 500k+ Users
- **Vercel Enterprise**: Contact sales (~$200-500/month)
- **Supabase Pro**: $25-99/month (scale as needed)
- **CDN**: Consider Cloudflare for images ($0-20/month)

## 🔒 Security Notes

Your keys are now:
- ✅ In `.env.local` (committed to GitHub as you requested)
- ✅ In Vercel Environment Variables (secure)
- ⚠️ **Anon key is safe to expose** (public-facing, has RLS protection)
- ⚠️ **Service role key should be secret** (but you gave permission to share)

For production, consider:
- Rotating service role key if ever leaked
- Setting up rate limiting
- Enabling Supabase's built-in CAPTCHA for auth
