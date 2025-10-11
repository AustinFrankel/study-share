# ⚡ Zapier Quick Start - 5 Minute Setup

Send emails automatically when users sign up! Here's how:

## Step 1: Get Your Zapier Webhook URL (2 min)

1. Go to [zapier.com](https://zapier.com) → **Create Zap**
2. Search for **"Webhooks by Zapier"** → Select **"Catch Hook"**
3. Copy the webhook URL (looks like `https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/`)

## Step 2: Add to Your App (30 sec)

Add this line to your `.env.local` file:

```bash
ZAPIER_WEBHOOK_USER_SIGNUP=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/
```

Then restart your server:
```bash
npm run dev
```

## Step 3: Test It (1 min)

1. Sign up for a new account in your app
2. Go back to Zapier → Click **"Test trigger"**
3. You should see the user data! ✅

## Step 4: Add Email Action (2 min)

1. In Zapier, click **Continue** → Search **"Gmail"** (or any email service)
2. Choose **"Send Email"**
3. Fill in:
   - **To:** `{{data__email}}`
   - **Subject:** "Welcome to our platform!"
   - **Body:** "Hi {{data__handle}}, welcome! 🎉"
4. Click **Test & Continue**
5. **Turn your Zap on** → Done! 🚀

## That's It!

Now every time someone signs up, they'll get a welcome email automatically!

---

## 📧 Email Template Ideas

### Welcome Email
```
Subject: Welcome to [Your App]! 🎉

Hi {{data__handle}},

Thanks for joining us! Your account is all set up.

Here's what you can do next:
→ Upload your first study material
→ Take a practice test
→ Explore resources

Questions? Just reply to this email!

Cheers,
[Your Team]
```

### Welcome Email with Tips
```
Subject: Welcome aboard, {{data__handle}}! Here's how to get started

Hi there! 👋

We're excited to have you on board. Here are 3 quick tips to get the most out of [Your App]:

1️⃣ Upload your study materials to organize everything in one place
2️⃣ Take practice tests to track your progress
3️⃣ Use our AI tools to get instant feedback

Need help? Check out our guide: [link]

Happy studying!
The [Your App] Team
```

---

## 🎯 More Automation Ideas

Once you have the basics working, try these:

- **Google Sheets:** Log all signups to a spreadsheet
- **Slack:** Get notified in your team channel
- **Mailchimp:** Add users to your mailing list
- **Airtable:** Build a custom CRM
- **Discord:** Send welcome messages in your server

See the full guide: `ZAPIER_INTEGRATION.md`

