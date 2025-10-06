# 🚀 Quick Start - Live Test System

## Setup in 3 Steps

### Step 1: Run Database Migration
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy & paste from: `/supabase/migrations/20251006_test_waitlist.sql`
4. Click **Run**

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Test the System
1. Go to: `http://localhost:3000/live`
2. Click on any test to see the interface
3. Join waitlist or take a practice test

---

## 📋 What You Get

### `/live` - Main Page
- Real-time countdowns for all tests
- SAT/ACT/PSAT at top
- AP Exams section
- Archived tests at bottom
- Status dots (red/orange/green/gray)

### `/live/test?test=sat-mar` - Bluebook Interface
- Full College Board Bluebook experience
- Timer (64 minutes)
- Calculator (draggable)
- Highlighter tool
- Answer eliminator
- Flag questions
- Instant feedback (green ✓ / red ✗)

---

## 🎯 Quick Actions

### Add a New Test
Edit `/src/lib/test-dates.ts`:
```typescript
{
  id: 'sat-new',
  name: 'SAT',
  fullName: 'SAT Reasoning Test - New Date',
  date: new Date('2025-12-01T08:00:00'),
  color: 'from-blue-500 to-blue-600',
  icon: '📚',
  category: 'College Admissions'
}
```

### View Waitlist Emails
1. Supabase Dashboard → Table Editor
2. Select `test_waitlist` table
3. Download CSV

### Remove Non-MC AP Exams (Already Done)
Removed from `/src/lib/test-dates.ts`:
- AP Art History
- AP Music Theory
- AP Studio Art
(Any AP without multiple choice)

---

## ✨ Key Features

| Feature | Status | Location |
|---------|--------|----------|
| SAT/ACT/PSAT Priority | ✅ | `/live` |
| AP Exams Section | ✅ | `/live` |
| Status Indicators | ✅ | `/live` |
| Archived Section | ✅ | `/live` |
| Waitlist System | ✅ | Database + Dialog |
| Bluebook Interface | ✅ | `/live/test` |
| Instant Feedback | ✅ | `/live/test` |
| All Bluebook Tools | ✅ | `/live/test` |

---

## 🎨 Status Dots Meaning

- 🔴 **Red** = Upcoming (>1 week away)
- 🟠 **Orange** = This Week (≤7 days)
- 🟢 **Green** = Available Now (materials ready)
- ⚪ **Gray** = Archived (>1 week old)

---

## 📊 Database Tables

### `test_waitlist`
- Stores emails for notifications
- Fields: email, name, test_id, created_at

### `test_resources`
- Stores test questions in JSON
- Fields: test_id, questions (JSONB)

### `test_user_progress`
- Tracks user answers & scores
- Fields: user_id, test_id, question_id, selected_answer, is_correct

---

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `/src/app/live/page.tsx` | Main countdown page |
| `/src/app/live/test/page.tsx` | Bluebook test interface |
| `/src/lib/test-dates.ts` | Test configuration |
| `/supabase/migrations/20251006_test_waitlist.sql` | Database schema |
| `LIVE_TEST_SYSTEM_GUIDE.md` | Full documentation |
| `WAITLIST_SETUP_GUIDE.md` | Waitlist & Google Sheets |

---

## 🐛 Common Issues

**Waitlist not saving?**
→ Run the migration SQL first

**Test not loading?**
→ Demo questions load automatically, DB is optional

**Timer not working?**
→ Click "Begin Test" to start

---

## 🎉 You're All Set!

Navigate to `/live` to see your new Live Test System in action!

For detailed documentation, see: `LIVE_TEST_SYSTEM_GUIDE.md`
