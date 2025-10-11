# 🚀 Zapier Configuration Quick Reference

## Your Webhook URL
```
https://hooks.zapier.com/hooks/catch/24943038/u59h2ms/
```

## Gmail Action Configuration

### Required Fields
| Field | Value | Notes |
|-------|-------|-------|
| **To** | `{{data__email}}` | ⚠️ This fixes your current error |
| **Subject** | `{{data__email_subject}}` | Pre-formatted personalized subject |
| **Body** | See full template below | Complete waitlist welcome email |
| **From Name** | `Study Share` | Your brand name |
| **From Email** | `studysharehq@gmail.com` | Your Gmail address |

### Complete Email Body Template
```
{{data__personalized_greeting}}

Welcome to Study Share! 🎉

**You're on the waitlist!**
You're currently position #{{data__waitlist_position}} on our waitlist. We estimate you'll get access in approximately {{data__days_until_access}} days (around {{data__estimated_access_date}}).

**What is Study Share?**
Study Share is an AI-powered test preparation platform where students can:
• Upload and share study materials with classmates
• Take practice tests with instant feedback
• Access AI-powered study tools
• Collaborate on exam preparation

**You're signing up for: {{data__subject_area}} - {{data__test_type}}**

**📚 Test Tips for Your Upcoming Exam:**

Since you're about {{data__days_until_access}} days away from your test, here are some essential study tips:

1️⃣ **Review Your Weak Areas**
   Focus on topics you struggle with most. Don't waste time on what you already know.

2️⃣ **Practice Active Recall**
   Instead of just re-reading notes, quiz yourself. Try to explain concepts out loud.

3️⃣ **Take Practice Tests**
   Simulate real test conditions. Time yourself and review every answer.

4️⃣ **Get Enough Sleep**
   Your brain consolidates memories during sleep. Aim for 7-9 hours nightly.

5️⃣ **Stay Hydrated & Eat Well**
   Your brain needs fuel! Avoid heavy meals before studying.

6️⃣ **Create a Study Schedule**
   Break your remaining time into focused study blocks with breaks.

7️⃣ **Stay Positive**
   Confidence matters. You've prepared, and you're ready for this!

**🎯 What Happens Next?**

1. **Wait for Access:** We'll email you when it's your turn
2. **Get Started:** Upload your study materials
3. **Take Practice Tests:** Get instant feedback on your performance
4. **Track Progress:** See how you're improving over time

**📱 Stay Connected**
Follow us on social media for study tips and platform updates:
• Twitter: @StudyShareHQ
• Instagram: @studyshare.app

**Questions?**
Just reply to this email - we're here to help!

**Good luck on your test, {{data__first_name}}! You've got this! 🍀**

Best regards,
The Study Share Team

---
Study Share - AI-Powered Test Preparation
Making studying smarter, not harder.

P.S. Share Study Share with friends who might also benefit - they can join the waitlist too!
```

## Available Data Fields

| Field | Example | Description |
|-------|---------|-------------|
| `{{data__email}}` | user@example.com | User's email |
| `{{data__email_subject}}` | Welcome to Study Share - You're #42 on the waitlist! | Personalized subject |
| `{{data__personalized_greeting}}` | Hi Cobalt! | Greeting with first name |
| `{{data__first_name}}` | Cobalt | First part of username |
| `{{data__waitlist_position}}` | 42 | Position on waitlist |
| `{{data__days_until_access}}` | 3 | Days until access |
| `{{data__estimated_access_date}}` | 1/15/2024 | Estimated access date |
| `{{data__subject_area}}` | Test Preparation | What they're studying |
| `{{data__test_type}}` | Practice Tests | Type of tests |

## Quick Setup Steps

1. ✅ **Fix the "To" field:** Set to `{{data__email}}`
2. ✅ **Set Subject:** Use `{{data__email_subject}}`
3. ✅ **Copy Email Body:** Use the template above
4. ✅ **Test:** Click "Retest step" in Zapier
5. ✅ **Activate:** Turn on your Zap

## Test Commands

```bash
# Test the webhook (run this first)
npm run test:zapier:signup

# Check your server is running with new webhook data
npm run dev
```

## Troubleshooting

**Error: "To field is empty"**
- Make sure you're using `{{data__email}}` exactly as shown
- Check Zapier's "Data in" tab to see available fields

**Email not personalizing**
- Verify field names match exactly (case-sensitive)
- Test webhook first to ensure data is being sent

**Webhook not firing**
- Restart your dev server: `npm run dev`
- Check console logs for webhook attempts

---

## 🎯 What This Email Does

✅ **Explains what Study Share is** - AI-powered test prep platform
✅ **Confirms their subject area** - Test Preparation/Practice Tests  
✅ **Shows waitlist position** - Personalized position number
✅ **Provides study tips** - 7 actionable tips for test prep
✅ **Sets expectations** - What happens next
✅ **Personalizes everything** - Uses their name and position
✅ **Stores all info correctly** - All data sent to Zapier for tracking

Your waitlist welcome emails are now fully automated! 🚀
