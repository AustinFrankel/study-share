# 🎓 Live Test System - README

## 🎯 What Is This?

A complete **Live Test Countdown and Practice System** featuring:
- Real-time countdowns for SAT, ACT, PSAT, and AP Exams
- Waitlist collection system (email + name → database/Google Sheets)
- Full College Board Bluebook-style test interface
- Instant visual feedback (green ✓ / red ✗)
- All Bluebook features: calculator, highlighter, answer eliminator, timer, etc.

---

## 🚀 Quick Start

### 1. Run Database Migration
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy & paste: /supabase/migrations/20251006_test_waitlist.sql
# Click Run
```

### 2. Start Development
```bash
npm run dev
```

### 3. Visit Live Page
```
http://localhost:3000/live
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **[QUICK_START_LIVE_TESTS.md](QUICK_START_LIVE_TESTS.md)** | Quick start guide (3 steps) |
| **[LIVE_TEST_SYSTEM_GUIDE.md](LIVE_TEST_SYSTEM_GUIDE.md)** | Complete documentation (200+ lines) |
| **[WAITLIST_SETUP_GUIDE.md](WAITLIST_SETUP_GUIDE.md)** | Waitlist & Google Sheets setup |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | What was built & technical details |
| **[VISUAL_GUIDE_LIVE_TESTS.md](VISUAL_GUIDE_LIVE_TESTS.md)** | Visual mockups & UI examples |
| **[README_LIVE_TESTS.md](README_LIVE_TESTS.md)** | This file |

---

## ✨ Key Features

### Live Page (`/live`)
- ✅ SAT/ACT/PSAT at the very top
- ✅ AP Exams section below
- ✅ Status indicator dots (🔴🟠🟢⚪)
- ✅ Tests older than 1 week in archive section
- ✅ Real-time countdowns
- ✅ Join Waitlist button
- ✅ View Materials button

### Waitlist System
- ✅ Email & name collection
- ✅ Saves to Supabase `test_waitlist` table
- ✅ Export to CSV
- ✅ Optional Google Sheets sync

### Bluebook Test Interface (`/live/test`)
- ✅ 64-minute timer with auto-submit
- ✅ Calculator (draggable, minimize/maximize)
- ✅ Highlighter tool
- ✅ Answer eliminator
- ✅ Flag questions
- ✅ Question palette (grid navigation)
- ✅ Instant feedback (green ✓ / red ✗)
- ✅ Explanations after submission
- ✅ Results screen with score

---

## 📊 Routes

| Route | Description |
|-------|-------------|
| `/live` | Main countdown page with all tests |
| `/live/test?test=sat-mar` | Bluebook-style test interface |
| `/live/view?test=sat-mar` | Alternative view (paywall system) |
| `/live/upload?test=sat-mar` | Upload interface for admins |

---

## 🎨 Status Indicators

| Dot | Color | Meaning |
|-----|-------|---------|
| 🔴 | Red | Upcoming (>1 week away) |
| 🟠 | Orange | This Week (≤7 days) |
| 🟢 | Green | Available Now (materials ready) |
| ⚪ | Gray | Archived (>1 week old) |

---

## 🗂️ Database Tables

### `test_waitlist`
Stores email signups for notifications.
```sql
id, test_id, test_name, email, name, user_id, created_at, notified
```

### `test_resources`
Stores test questions in JSON format.
```sql
id, test_id, test_name, questions (JSONB), created_at, uploader_id
```

### `test_user_progress`
Tracks user answers and scores.
```sql
id, user_id, test_id, question_id, selected_answer, is_correct, time_spent
```

---

## 📁 Key Files

### Frontend
- `/src/app/live/page.tsx` - Main countdown page
- `/src/app/live/test/page.tsx` - Bluebook test interface
- `/src/lib/test-dates.ts` - Test configuration

### Backend
- `/supabase/migrations/20251006_test_waitlist.sql` - Database schema

### Documentation
- `QUICK_START_LIVE_TESTS.md` - Quick reference
- `LIVE_TEST_SYSTEM_GUIDE.md` - Full guide
- `WAITLIST_SETUP_GUIDE.md` - Waitlist setup
- `IMPLEMENTATION_SUMMARY.md` - Technical summary
- `VISUAL_GUIDE_LIVE_TESTS.md` - UI mockups

---

## 🔧 Configuration

### Add New Test
Edit `/src/lib/test-dates.ts`:
```typescript
{
  id: 'sat-new',
  name: 'SAT',
  fullName: 'SAT Reasoning Test - New Date',
  date: new Date('2025-12-01T08:00:00'),
  description: 'College Board standardized test',
  color: 'from-blue-500 to-blue-600',
  icon: '📚',
  category: 'College Admissions'
}
```

### Upload Questions
Insert into `test_resources` table:
```json
{
  "test_id": "sat-mar",
  "test_name": "SAT March 2025",
  "questions": [
    {
      "id": "q-1",
      "questionNumber": 1,
      "module": 1,
      "questionText": "Which choice best...",
      "choices": [
        { "letter": "A", "text": "..." },
        { "letter": "B", "text": "..." }
      ],
      "correctAnswer": "B",
      "explanation": "..."
    }
  ]
}
```

### Export Waitlist
1. Supabase Dashboard → Table Editor
2. Select `test_waitlist`
3. Click "Download CSV"
4. Import to email tool

---

## 🎯 How It Works

### User Journey
```
1. Visit /live
2. See countdown for upcoming tests
3. Click test card
4. If upcoming → Join waitlist (email + name)
5. If past → Take practice test
6. Use tools (calculator, highlighter, etc.)
7. Submit test
8. See instant feedback (green ✓ / red ✗)
9. Review explanations
10. View score
```

### Admin Journey
```
1. Add test dates to test-dates.ts
2. Upload questions to test_resources table
3. Users join waitlist
4. Export emails from Supabase
5. Send notifications
6. Users take practice tests
7. Track progress in test_user_progress table
```

---

## 🎨 Design System

### Colors (Bluebook-compliant)
```
Background:   #F6F7F9
Cards:        #FFFFFF
Primary:      #0E66FF
Success:      #10B981
Error:        #EF4444
Warning:      #F97316
```

### Typography
```
Questions:    18px, line-height 1.45
Choices:      16px, line-height 1.4
UI labels:    13px, line-height 1.2
Headings:     20-22px, semi-bold
```

### Spacing
```
Container:    max-width 1100px
Gutters:      24-32px
Card padding: 24px
Gaps:         12px
Radius:       12px
```

---

## ✅ Features Checklist

### Live Page
- [x] SAT, ACT, PSAT at top
- [x] AP Exams section
- [x] Status dots (4 colors)
- [x] Archive section
- [x] Real-time countdowns
- [x] Waitlist system

### Test Interface
- [x] Module-based flow
- [x] Timer (64 min)
- [x] Calculator
- [x] Highlighter
- [x] Answer eliminator
- [x] Flag questions
- [x] Question palette
- [x] Instant feedback
- [x] Results screen

### Backend
- [x] Database tables
- [x] Migration SQL
- [x] RLS policies
- [x] Progress tracking

---

## 🚀 Deployment

### Local Development
```bash
npm run dev
# Visit: http://localhost:3000/live
```

### Production Build
```bash
npm run build
npm start
# Deploy to Vercel/Netlify
```

### Database Setup
```bash
# Supabase Dashboard → SQL Editor
# Run: /supabase/migrations/20251006_test_waitlist.sql
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Waitlist not saving | Run migration SQL |
| Test not loading | Demo questions load automatically |
| Timer not working | Click "Begin Test" |
| Calculator not showing | Check z-index (should be z-50) |
| Status dots not showing | Check if `mounted` state is true |

---

## 📈 Analytics (Future)

Track these metrics:
- Waitlist signups per test
- Test completion rates
- Average scores
- Time per question
- Most flagged questions
- Most eliminated answers

---

## 🔒 Security

- ✅ RLS policies on all tables
- ✅ Input validation
- ✅ Auto-save to prevent data loss
- ✅ User authentication required for progress tracking
- ✅ Public waitlist (anyone can join)

---

## 🎉 Success Criteria - ALL MET ✅

| Requirement | Status |
|------------|--------|
| SAT/ACT/PSAT at top | ✅ |
| AP Exams below | ✅ |
| Remove non-MC APs | ✅ |
| Status dots | ✅ |
| Archive section | ✅ |
| Waitlist system | ✅ |
| Backend storage | ✅ |
| Bluebook interface | ✅ |
| Instant feedback | ✅ |
| All tools | ✅ |

---

## 📞 Support

For issues or questions:
1. Check `LIVE_TEST_SYSTEM_GUIDE.md` - Full documentation
2. See `QUICK_START_LIVE_TESTS.md` - Quick reference
3. Review `WAITLIST_SETUP_GUIDE.md` - Waitlist setup
4. Read `VISUAL_GUIDE_LIVE_TESTS.md` - UI examples

---

## 🏆 What's Included

### ✅ Functional
- Live countdown page
- Status indicators
- Waitlist collection
- Bluebook test interface
- Instant feedback
- Database schema
- Admin tools

### ✅ Documentation
- 5 comprehensive guides
- Visual mockups
- Code comments
- Setup instructions

### ✅ Quality
- Production-ready
- Responsive design
- Cross-browser compatible
- Security best practices
- Performance optimized

---

## 🚀 Next Steps

1. **Run migration** → Execute SQL in Supabase
2. **Test locally** → `npm run dev` → Visit `/live`
3. **Upload questions** → Add to `test_resources` table
4. **Export waitlist** → Download CSV from Supabase
5. **Deploy** → Push to production

---

**Ready to go! Visit `/live` to see your Live Test System in action.** 🎓

For detailed documentation, see: **[LIVE_TEST_SYSTEM_GUIDE.md](LIVE_TEST_SYSTEM_GUIDE.md)**
