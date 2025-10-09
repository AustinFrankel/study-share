# Test Waitlist Setup Guide

## Overview
This guide explains how to set up the test waitlist system to collect emails and either view them in the Supabase dashboard or sync them to Google Sheets.

## Option 1: View Waitlist in Supabase Dashboard (Recommended)

### Step 1: Run the Migration
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `/supabase/migrations/20251006_test_waitlist.sql`
4. Click **Run**

### Step 2: View Waitlist Entries
1. Navigate to **Table Editor** in Supabase
2. Select the `test_waitlist` table
3. View all waitlist entries with:
   - Email address
   - Name
   - Test ID and name
   - Signup timestamp
   - Whether they've been notified

### Step 3: Export to CSV
1. In the Table Editor, click the **Download CSV** button
2. Use the CSV for your email campaigns

---

## Option 2: Sync to Google Sheets (Advanced)

### Prerequisites
- Google Cloud Project
- Google Sheets API enabled
- Service Account credentials

### Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google Sheets API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

### Step 2: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Name it "Supabase Waitlist Sync"
4. Click **Create and Continue**
5. Grant it **Editor** role
6. Click **Done**
7. Click on the service account you just created
8. Go to **Keys** tab
9. Click **Add Key** → **Create New Key**
10. Choose **JSON** format
11. Download the JSON key file

### Step 3: Set Up Google Sheet

1. Create a new Google Sheet
2. Name it "Test Waitlist"
3. Add headers in row 1:
   ```
   A1: Timestamp
   B1: Test ID
   C1: Test Name
   D1: Name
   E1: Email
   F1: User ID
   G1: Notified
   ```
4. Share the sheet with the service account email (from the JSON file)
   - Give it **Editor** access
5. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

### Step 4: Create Supabase Edge Function

1. Create a new file: `/supabase/functions/sync-waitlist-to-sheets/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the service account credentials
    const googleCredentials = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT') ?? '{}')
    const spreadsheetId = Deno.env.get('GOOGLE_SHEET_ID') ?? ''

    // Get new waitlist entries (not yet synced)
    const { data: entries, error } = await supabaseClient
      .from('test_waitlist')
      .select('*')
      .is('synced_to_sheets', null)
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ message: 'No new entries to sync' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get OAuth token from service account
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await createJWT(googleCredentials)
      })
    })
    const { access_token } = await tokenResponse.json()

    // Prepare rows for Google Sheets
    const rows = entries.map(entry => [
      entry.created_at,
      entry.test_id,
      entry.test_name,
      entry.name || '',
      entry.email,
      entry.user_id || '',
      entry.notified ? 'Yes' : 'No'
    ])

    // Append to Google Sheets
    await fetch(
      `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/Sheet1!A:G:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: rows })
      }
    )

    // Mark entries as synced
    const entryIds = entries.map(e => e.id)
    await supabaseClient
      .from('test_waitlist')
      .update({ synced_to_sheets: true })
      .in('id', entryIds)

    return new Response(
      JSON.stringify({
        message: `Synced ${entries.length} entries to Google Sheets`,
        count: entries.length
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function createJWT(credentials: any) {
  // Implementation for creating JWT token for Google API
  // This is a simplified version - use a proper JWT library
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const claim = btoa(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }))

  // Sign with private key (simplified - use proper crypto library)
  return `${header}.${claim}.signature`
}
```

### Step 5: Set Environment Variables

1. In Supabase Dashboard, go to **Settings** → **Edge Functions**
2. Add these secrets:
   ```
   GOOGLE_SERVICE_ACCOUNT=<paste your JSON key file contents>
   GOOGLE_SHEET_ID=<your sheet ID>
   ```

### Step 6: Deploy the Edge Function

```bash
supabase functions deploy sync-waitlist-to-sheets
```

### Step 7: Set Up Automatic Sync (Optional)

Create a cron job to run the sync function every hour:

1. Go to **Database** → **Extensions**
2. Enable **pg_cron** extension
3. Run this SQL:

```sql
SELECT cron.schedule(
  'sync-waitlist-hourly',
  '0 * * * *', -- Every hour
  $$
  SELECT
    net.http_post(
      url:='https://[YOUR_PROJECT_REF].supabase.co/functions/v1/sync-waitlist-to-sheets',
      headers:='{"Authorization": "Bearer [YOUR_ANON_KEY]"}'::jsonb
    ) as request_id;
  $$
);
```

---

## Option 3: Simple Email Export (Quick Start)

If you just need a quick way to get emails:

1. Go to Supabase **SQL Editor**
2. Run this query:

```sql
SELECT
  test_name,
  email,
  name,
  created_at
FROM test_waitlist
WHERE notified = false
ORDER BY test_name, created_at DESC;
```

3. Click **Download CSV**
4. Import into your email tool (Mailchimp, SendGrid, etc.)

---

## Notifying Users

When you send emails to waitlist users, mark them as notified:

```sql
UPDATE test_waitlist
SET
  notified = true,
  notified_at = NOW()
WHERE test_id = 'sat-mar' -- or whatever test ID
AND notified = false;
```

---

## Testing the Waitlist

1. Go to your live page: `/live`
2. Click on any upcoming test
3. Fill out the waitlist form
4. Check Supabase dashboard for the entry

---

## Security Notes

- The waitlist form is public (anyone can join)
- Email validation is done on the frontend
- Consider adding rate limiting to prevent spam
- Store Google credentials securely in Supabase secrets (never commit to git)
- Set up proper RLS policies (already done in migration)

---

## Troubleshooting

### Entries not appearing in Supabase
- Check if migration ran successfully
- Verify RLS policies are enabled
- Check browser console for errors

### Google Sheets sync not working
- Verify service account has access to the sheet
- Check that API is enabled in Google Cloud Console
- Verify environment variables are set correctly
- Check Edge Function logs in Supabase dashboard

### Need help?
- Check Supabase docs: https://supabase.com/docs
- Google Sheets API docs: https://developers.google.com/sheets/api
