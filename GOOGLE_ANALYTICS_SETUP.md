# Google Analytics Setup Guide

## ✅ Google Analytics Tag Installation

Your Google Analytics tracking is now configured to load from environment variables.

### What Was Done

1. **Added Google Analytics to Layout** (`src/app/layout.tsx`)
   - Installed gtag.js script in the `<head>` section
   - Loads from `NEXT_PUBLIC_GA_ID` environment variable
   - Only loads in production (`NODE_ENV === 'production'`)
   - Automatically tracks all pages

### Setup Instructions

1. Get your Google Analytics ID from [Google Analytics](https://analytics.google.com)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
3. Add to Vercel environment variables (Production only)
4. The tracking code will automatically load when deployed

### How It Works

The Google Analytics tag is now included in the root layout, which means:
- ✅ It loads on EVERY page of your site automatically
- ✅ No need to manually add it to new pages
- ✅ Tracks page views, user behavior, conversions
- ✅ Works on both development and production

### Verification

To verify Google Analytics is working:

1. **Real-time Reports**
   - Go to your Google Analytics dashboard
   - Navigate to: Reports → Real-time
   - Visit your site and you should see yourself in real-time

2. **Browser Console Check**
   - Open your site
   - Press F12 (Developer Tools)
   - Type: `dataLayer`
   - You should see an array with tracking data

3. **Google Tag Assistant**
   - Install [Google Tag Assistant Chrome Extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - Visit your site
   - Click the extension icon
   - Should show your GA ID as working

### Adding New Pages

**You don't need to do anything!** 

The tag is in the root layout, so:
- Any new page you create automatically gets tracked
- No manual tag installation needed per page
- Just create your pages normally in `src/app/`

### Example: Creating a New Page with Analytics

```tsx
// src/app/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      <h1>My New Page</h1>
      {/* Analytics already tracking - no extra code needed! */}
    </div>
  )
}
```

That's it! Google Analytics will automatically track this page.

### Custom Event Tracking (Optional)

If you want to track custom events (button clicks, form submissions, etc.):

```tsx
'use client'

export default function MyComponent() {
  const handleClick = () => {
    // Track custom event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'button_click', {
        event_category: 'engagement',
        event_label: 'Download Button'
      })
    }
  }

  return <button onClick={handleClick}>Download</button>
}
```

---

## Data You'll See in Analytics

- **Page Views**: Automatically tracked for all pages
- **User Sessions**: How long users stay on your site
- **Traffic Sources**: Where users come from (Google, direct, social)
- **User Demographics**: Age, location, device type
- **Behavior Flow**: Path users take through your site
- **Conversions**: If you set up goals in GA dashboard

---

## Next Steps

1. **Set Up Goals in Google Analytics**
   - Go to Admin → Goals
   - Create goals for important actions (sign-ups, uploads, etc.)

2. **Link to Google Search Console**
   - See which Google searches lead to your site
   - Monitor search performance

3. **Set Up Custom Reports**
   - Create dashboards for metrics you care about most

---

## Need Help?

- [Google Analytics Documentation](https://support.google.com/analytics)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
