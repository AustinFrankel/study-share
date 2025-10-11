# 🔗 Zapier Integration Guide

This guide shows you how to connect your application with Zapier to automate workflows like sending emails when users sign up.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
- [Available Triggers](#available-triggers)
- [Example Automations](#example-automations)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Your application can now send webhook events to Zapier, allowing you to automate tasks like:
- ✉️ Send welcome emails when users sign up
- 📊 Log user activity to Google Sheets
- 💬 Send Slack notifications for important events
- 🎉 Much more!

## 🚀 Setup Instructions

### Step 1: Create a Zapier Account

1. Go to [zapier.com](https://zapier.com) and create an account (free tier works great!)
2. Click **"Create Zap"** in the dashboard

### Step 2: Set Up the Webhook Trigger

1. **Search for trigger:** Type "Webhooks by Zapier"
2. **Select event:** Choose **"Catch Hook"**
3. **Copy webhook URL:** Zapier will show you a unique URL like:
   ```
   https://hooks.zapier.com/hooks/catch/12345678/abcdefg/
   ```
4. **Keep this tab open** - we'll test it in a moment

### Step 3: Add Webhook URL to Your Environment

1. Open your `.env.local` file (or create one if it doesn't exist)
2. Add the webhook URL for the event you want to trigger:

```bash
# For user signup events
ZAPIER_WEBHOOK_USER_SIGNUP=https://hooks.zapier.com/hooks/catch/12345678/abcdefg/

# For user upload events (optional)
ZAPIER_WEBHOOK_USER_UPLOAD=https://hooks.zapier.com/hooks/catch/12345678/hijklmn/

# For test completion events (optional)
ZAPIER_WEBHOOK_TEST_COMPLETED=https://hooks.zapier.com/hooks/catch/12345678/opqrstu/
```

3. **Restart your dev server** for changes to take effect:
   ```bash
   npm run dev
   ```

### Step 4: Test Your Webhook

1. **Trigger the event** in your app (e.g., create a new user account)
2. Go back to your Zapier tab - you should see a test event appear!
3. Click **"Test & Review"** to see the data that was sent

### Step 5: Add Your Action (e.g., Send Email)

1. Click **"Continue"** in Zapier
2. **Choose an action app:** Search for "Gmail", "SendGrid", "Mailgun", or any email service
3. **Select action:** Choose "Send Email"
4. **Map the data:**
   - To: `{{data__email}}` (the user's email)
   - Subject: "Welcome to [Your App Name]!"
   - Body: Use `{{data__handle}}`, `{{data__user_id}}`, etc. to personalize

5. **Test the action** to make sure the email sends
6. **Turn on your Zap** and you're done! 🎉

## 🎪 Available Triggers

Your app currently sends these webhook events:

### 1. User Signup (`user.signup`)

**Triggered when:** A new user creates an account

**Data sent:**
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

**Environment variable:** `ZAPIER_WEBHOOK_USER_SIGNUP`

### 2. User Upload (`user.upload`)

**Triggered when:** A user uploads study materials

**Data sent:**
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

**Environment variable:** `ZAPIER_WEBHOOK_USER_UPLOAD`

### 3. Test Completed (`test.completed`)

**Triggered when:** A user finishes a practice test

**Data sent:**
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

**Environment variable:** `ZAPIER_WEBHOOK_TEST_COMPLETED`

## 💡 Example Automations

### 1. Welcome Email on Signup

**Trigger:** Webhooks by Zapier - Catch Hook  
**Action:** Gmail - Send Email

**Email Template:**
```
Subject: Welcome to [Your App]! 🎉

Hi {{data__handle}},

Welcome to our platform! We're excited to have you here.

Your account has been created successfully. Here's what you can do next:
- Upload your first study material
- Take a practice test
- Explore our resources

Need help? Just reply to this email!

Best regards,
The [Your App] Team
```

### 2. Log New Signups to Google Sheets

**Trigger:** Webhooks by Zapier - Catch Hook  
**Action:** Google Sheets - Create Spreadsheet Row

**Columns:**
- Timestamp: `{{timestamp}}`
- User ID: `{{data__user_id}}`
- Email: `{{data__email}}`
- Handle: `{{data__handle}}`

### 3. Slack Notification for New Users

**Trigger:** Webhooks by Zapier - Catch Hook  
**Action:** Slack - Send Channel Message

**Message:**
```
🎉 New user signed up!
• Handle: {{data__handle}}
• Email: {{data__email}}
• Time: {{timestamp}}
```

### 4. Add User to Mailchimp List

**Trigger:** Webhooks by Zapier - Catch Hook  
**Action:** Mailchimp - Add/Update Subscriber

**Settings:**
- Email: `{{data__email}}`
- First Name: `{{data__handle}}`
- Tags: "New User", "Onboarding"

### 5. Score-based Congratulations Email

**Trigger:** Webhooks by Zapier - Catch Hook (test.completed)  
**Filter:** Only continue if `{{data__score}}` >= 90  
**Action:** Gmail - Send Email

**Email:**
```
Subject: Congratulations on Your Excellent Score! 🌟

Hi {{data__handle}},

Amazing work! You scored {{data__score}} out of {{data__total_questions}} on "{{data__test_title}}"!

You're in the top performers. Keep up the great work!
```

## 🔧 Adding More Triggers

Want to trigger Zapier on other events? It's easy!

### Option 1: Use Existing Helper Functions

In your code, import and call the webhook functions:

```typescript
import { triggerUserUpload } from '@/lib/zapier-webhooks'

// In your upload success handler:
await triggerUserUpload(
  { id: user.id, email: user.email, handle: user.handle },
  { id: resource.id, title: resource.title, file_count: 3 }
)
```

### Option 2: Create Custom Events

```typescript
import { triggerCustomEvent } from '@/lib/zapier-webhooks'

await triggerCustomEvent(
  'ZAPIER_WEBHOOK_MY_CUSTOM_EVENT',
  'my.custom.event',
  {
    custom_field: 'value',
    another_field: 123
  }
)
```

Then add the environment variable:
```bash
ZAPIER_WEBHOOK_MY_CUSTOM_EVENT=https://hooks.zapier.com/hooks/catch/...
```

## 🐛 Troubleshooting

### Webhook Not Firing?

1. **Check environment variable:** Make sure you copied the full URL including trailing slash
2. **Restart server:** After adding env vars, restart your dev server with `npm run dev`
3. **Check console logs:** Look for `✅ Zapier webhook sent:` or error messages
4. **Verify event triggered:** Make sure the event actually happened (e.g., a NEW user signup, not existing user login)

### Webhook Sent But Zapier Not Receiving?

1. **Check Zapier URL:** Make sure you copied the correct URL
2. **Test manually:** Use a tool like Postman to send a test POST request to your webhook URL
3. **Check Zapier dashboard:** Go to your Zap's history to see if requests are being received

### Email Not Sending?

1. **Test your action in Zapier:** Click "Test & Review" on your action step
2. **Check spam folder:** Welcome emails often end up in spam
3. **Verify email service connection:** Make sure your Gmail/SendGrid account is connected properly

### Need More Data in Webhook?

Edit `/Users/austinfrankel/Downloads/AnswersHelp/study-resources/src/lib/zapier-webhooks.ts` and add more fields to the `data` object:

```typescript
export async function triggerUserSignup(user: {
  id: string
  email?: string
  handle?: string
  created_at?: string
  // Add more fields as needed
  phone?: string
  plan?: string
}) {
  // ... existing code ...
  await sendZapierWebhook(webhookUrl, 'user.signup', {
    user_id: user.id,
    email: user.email,
    handle: user.handle,
    created_at: user.created_at || new Date().toISOString(),
    phone: user.phone, // New field
    plan: user.plan,   // New field
    welcome_message: `Welcome to the platform, ${user.handle || 'user'}!`,
  })
}
```

## 📚 Resources

- [Zapier Documentation](https://zapier.com/help)
- [Webhooks by Zapier Guide](https://zapier.com/apps/webhook/integrations)
- [Zapier Email Services](https://zapier.com/apps/categories/email)

## 🎯 Next Steps

Now that you have Zapier set up, consider automating:
- User onboarding sequences
- Admin notifications for important events
- Data synchronization with CRM systems
- Social media posting
- Analytics tracking

Happy automating! 🚀

