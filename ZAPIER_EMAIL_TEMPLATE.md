# 📧 Zapier Email Configuration Guide

## 🎯 Complete Email Setup for Waitlist Welcome

Based on your webhook URL: `https://hooks.zapier.com/hooks/catch/24943038/u59h2ms/`

## 🔧 Zapier Configuration

### Step 1: Fix the "To" Field Error

In your Zapier Gmail action, set the **"To"** field to:
```
{{data__email}}
```

This will pull the user's email address from the webhook data.

### Step 2: Email Subject Line

Set the **"Subject"** field to:
```
{{data__email_subject}}
```

This will use the personalized subject line from the webhook.

### Step 3: Email Body (Clean, no markdown)

- If your Gmail action supports HTML, set the Body to:

```
{{data__email_html}}
```

- If you prefer plain text, set the Body to:

```
{{data__email_text}}
```

Both fields are included in the webhook payload and contain a clean greeting (e.g., "Hi {{data__first_name}},"), no markdown asterisks, and properly hyperlinked resources.

### Step 4: From Name

Set the "From Name" field to:
```
Study Share
```

### Step 5: From Email

Set the "From Email" field to:
```
studysharehq@gmail.com
```

## 🧪 Testing Your Configuration

### Test the Webhook First

1. Go to your terminal and run:
```bash
cd study-resources
npm run test:zapier:signup
```

2. Check Zapier to see if the webhook was received

3. Look at the data structure - you should see all the new fields:
   - `data__email`
   - `data__email_subject`
   - `data__personalized_greeting`
   - `data__waitlist_position`
   - `data__days_until_access`
   - `data__estimated_access_date`
   - `data__first_name`
   - etc.

### Test the Email Action

1. In Zapier, click "Retest step" on your Gmail action
2. The email should now send successfully
3. Check your inbox for the test email

## 📊 Data Fields Available

Your webhook now sends these fields to Zapier:

| Field | Example Value | Description |
|-------|---------------|-------------|
| `data__email` | user@example.com | User's email address |
| `data__email_subject` | Welcome to Study Share - You're #42 on the waitlist! | Pre-formatted subject line |
| `data__personalized_greeting` | Hi Cobalt! | Personalized greeting |
| `data__user_name` | cobalt-penguin-123 | Full username |
| `data__first_name` | Cobalt | First part of username |
| `data__waitlist_position` | 42 | Position on waitlist |
| `data__estimated_access_date` | 1/15/2024 | When they'll get access |
| `data__days_until_access` | 3 | Days until access |
| `data__subject_area` | Test Preparation | What they're studying |
| `data__test_type` | Practice Tests | Type of tests |

## 🎨 Alternative Email Templates

### Short Version
```
{{data__personalized_greeting}}

Welcome to Study Share! 🎉

You're position #{{data__waitlist_position}} on our waitlist. 
Estimated access: {{data__estimated_access_date}} ({{data__days_until_access}} days)

Study Share is an AI-powered test prep platform where you can upload study materials, take practice tests, and get instant feedback.

**Quick study tip for your upcoming test:** Focus on your weakest areas first. Don't waste time reviewing what you already know!

Good luck, {{data__first_name}}! 🍀

Best,
Study Share Team
```

### Formal Version
```
Dear {{data__first_name}},

Thank you for joining the Study Share waitlist.

**Waitlist Information:**
- Position: #{{data__waitlist_position}}
- Estimated Access Date: {{data__estimated_access_date}}
- Days Remaining: {{data__days_until_access}}

**About Study Share:**
Study Share is an innovative test preparation platform designed to help students succeed through AI-powered study tools, collaborative learning, and comprehensive practice tests.

**Study Recommendation:**
With {{data__days_until_access}} days until your test, we recommend focusing on active recall techniques and taking timed practice tests to simulate exam conditions.

We look forward to welcoming you to our platform soon.

Best regards,
The Study Share Team
```

## 🔧 Troubleshooting

### If the "To" field is still empty:
1. Make sure you're using `{{data__email}}` exactly as shown
2. Check that the webhook is receiving data (test with the script first)
3. Look at the "Data in" tab in Zapier to see all available fields

### If the email isn't personalizing:
1. Verify the field names match exactly (case-sensitive)
2. Test the webhook first to ensure data is being sent
3. Check Zapier's data preview to see what's available

### If you want to customize the waitlist position:
Edit the `triggerUserSignup` function in `/study-resources/src/lib/zapier-webhooks.ts` and change:
```typescript
const waitlistPosition = Math.floor(Math.random() * 150) + 1
```

To use a real waitlist system, you'd replace this with actual database queries.

## 🚀 Next Steps

1. **Test the webhook:** `npm run test:zapier:signup`
2. **Configure Zapier:** Use the template above
3. **Test the email:** Send a test email in Zapier
4. **Turn on the Zap:** Activate your automation
5. **Monitor:** Check Zapier task history for successful sends

Your waitlist welcome emails are now ready to go! 🎉
