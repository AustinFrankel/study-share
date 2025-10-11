# 🎯 Zapier Integration - Complete Overview

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      Your Next.js App                            │
│                                                                   │
│  User Action              Webhook Trigger        Environment     │
│  ───────────              ───────────────        ────────────    │
│                                                                   │
│  👤 User Signs Up   →   triggerUserSignup()  →   ZAPIER_WEBHOOK_ │
│                                                   USER_SIGNUP     │
│                                                      ↓            │
│  📤 User Uploads    →   triggerUserUpload()  →   ZAPIER_WEBHOOK_ │
│                                                   USER_UPLOAD     │
│                                                      ↓            │
│  ✅ Test Complete   →   triggerTestCompleted() → ZAPIER_WEBHOOK_ │
│                                                   TEST_COMPLETED  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                            ↓ HTTPS POST
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                          Zapier                                  │
│                                                                   │
│  📥 Receive Webhook  →  🔍 Process Data  →  ⚡ Trigger Action    │
│                                                                   │
│  Example Actions:                                                │
│  • 📧 Send Email (Gmail, SendGrid, etc.)                        │
│  • 📊 Log to Google Sheets                                       │
│  • 💬 Send Slack notification                                    │
│  • 📋 Add to Mailchimp                                           │
│  • 🗄️ Save to Airtable                                          │
│  • 📱 Send SMS via Twilio                                        │
│  • ... 5,000+ apps available!                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🎬 Example Flow: Welcome Email on Signup

```
1. New User Signs Up
   ↓
2. App creates user in database
   ↓
3. App calls triggerUserSignup()
   ↓
4. Webhook sent to Zapier with:
   {
     "event": "user.signup",
     "timestamp": "2024-01-01T12:00:00Z",
     "data": {
       "user_id": "abc-123",
       "email": "user@example.com",
       "handle": "cobalt-penguin-42"
     }
   }
   ↓
5. Zapier receives webhook
   ↓
6. Zapier sends welcome email via Gmail
   ↓
7. User receives email! 🎉
```

## 📁 Files Modified

### ✅ New Files Created

1. **`/study-resources/src/lib/zapier-webhooks.ts`**
   - Main webhook integration library
   - Contains helper functions for triggering events
   - Handles errors gracefully

2. **`/ZAPIER_INTEGRATION.md`**
   - Complete integration guide
   - Examples and troubleshooting

3. **`/study-resources/ZAPIER_QUICK_START.md`**
   - 5-minute setup guide
   - Email template examples

4. **`/ZAPIER_SETUP_OVERVIEW.md`** (this file)
   - Visual overview and architecture

### ✅ Files Updated

1. **`/study-resources/src/app/api/ensure-user/route.ts`**
   - Added webhook trigger on new user creation
   - Lines modified: Added import and trigger call

2. **`/study-resources/src/components/UploadWizard.tsx`**
   - Added webhook trigger on successful upload
   - Lines modified: Added import and trigger call after upload completes

## 🔧 Environment Variables Needed

Add these to your `.env.local` file:

```bash
# Required for signup emails
ZAPIER_WEBHOOK_USER_SIGNUP=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/

# Optional: For upload notifications
ZAPIER_WEBHOOK_USER_UPLOAD=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/

# Optional: For test completion notifications
ZAPIER_WEBHOOK_TEST_COMPLETED=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/
```

## 🚀 Quick Setup Checklist

- [ ] Create Zapier account
- [ ] Create new Zap with "Webhooks by Zapier" trigger
- [ ] Copy webhook URL from Zapier
- [ ] Add `ZAPIER_WEBHOOK_USER_SIGNUP` to `.env.local`
- [ ] Restart dev server (`npm run dev`)
- [ ] Test by creating a new user account
- [ ] Check Zapier to see if webhook was received
- [ ] Add email action in Zapier (Gmail, etc.)
- [ ] Test email sending
- [ ] Turn on your Zap
- [ ] Done! 🎉

## 📊 Data Sent to Zapier

### User Signup Event

```json
{
  "event": "user.signup",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "user_id": "uuid-here",
    "email": "user@example.com",
    "handle": "cobalt-penguin-123",
    "created_at": "2024-01-01T12:00:00.000Z",
    "welcome_message": "Welcome to the platform, cobalt-penguin-123!"
  }
}
```

### User Upload Event

```json
{
  "event": "user.upload",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "user_id": "uuid-here",
    "email": "user@example.com",
    "handle": "cobalt-penguin-123",
    "resource_id": "resource-uuid",
    "resource_title": "Biology Chapter 5",
    "file_count": 3
  }
}
```

### Test Completed Event

```json
{
  "event": "test.completed",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "user_id": "uuid-here",
    "email": "user@example.com",
    "handle": "cobalt-penguin-123",
    "test_id": "test-uuid",
    "test_title": "Biology Practice Test",
    "score": 85,
    "total_questions": 50
  }
}
```

## 💡 Common Use Cases

### 1. Welcome Email Series
**Trigger:** User Signup  
**Actions:** 
- Send immediate welcome email
- Wait 1 day → Send getting started tips
- Wait 3 days → Send feature highlights
- Wait 7 days → Request feedback

### 2. Upload Confirmation
**Trigger:** User Upload  
**Actions:**
- Send email confirming upload
- Log to Google Sheets for tracking
- Notify team in Slack

### 3. Achievement Notifications
**Trigger:** Test Completed (with filter: score >= 90)  
**Actions:**
- Send congratulations email
- Award badge in external system
- Share to social media

### 4. Admin Alerts
**Trigger:** Any event  
**Actions:**
- Send to Slack channel
- Log to admin dashboard
- Update analytics

### 5. Data Backup
**Trigger:** User Signup + Upload  
**Actions:**
- Save to Google Sheets
- Backup to Airtable
- Export to data warehouse

## 🐛 Troubleshooting Guide

### Problem: Webhook not firing

**Check:**
1. ✅ Environment variable is set correctly
2. ✅ Server was restarted after adding env var
3. ✅ Event actually triggered (new user, not existing)
4. ✅ Console logs show webhook attempt

**Solution:**
```bash
# Check your .env.local file
cat .env.local | grep ZAPIER

# Restart server
npm run dev

# Check logs when triggering event
# Look for: ✅ Zapier webhook sent: user.signup
```

### Problem: Zapier not receiving data

**Check:**
1. ✅ Webhook URL is correct (including trailing slash)
2. ✅ Zapier Zap is turned ON
3. ✅ Check Zapier task history

**Solution:**
- Go to Zapier → Your Zap → Task History
- Look for recent webhook attempts
- Click to see full payload

### Problem: Email not sending

**Check:**
1. ✅ Zapier action is configured
2. ✅ Email service is connected
3. ✅ Test action worked in Zapier
4. ✅ Check spam folder

**Solution:**
- Test the action step in Zapier
- Check email service status
- Verify recipient email is correct

## 📚 Additional Resources

- **Quick Start:** `/study-resources/ZAPIER_QUICK_START.md`
- **Full Guide:** `/ZAPIER_INTEGRATION.md`
- **Code:** `/study-resources/src/lib/zapier-webhooks.ts`
- **Zapier Docs:** https://zapier.com/help

## 🎓 Next Steps

1. **Start Simple:** Set up welcome email first
2. **Test Thoroughly:** Make sure emails are sending
3. **Add More Triggers:** Upload notifications, test completions
4. **Get Creative:** Try Slack, Sheets, or other integrations
5. **Monitor:** Check Zapier task history regularly

## 💬 Need Help?

If you run into issues:

1. Check the troubleshooting guide above
2. Look at console logs in your app
3. Check Zapier task history
4. Read the full integration guide
5. Test with a simple "echo" Zap first

---

**Happy Automating!** 🚀

Remember: Webhooks are non-critical. If they fail, they won't break your app - users will still be created and uploads will still work!

