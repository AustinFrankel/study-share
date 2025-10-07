# 🚀 Quick Start Guide

## For Admins

### Upload a Test (3 steps)
1. Visit: `/live/upload?test=sat-mar&name=SAT March 2025`
2. Password: `Unlock`
3. Upload images → AI processes → Done!

### Export Waitlist Emails (3 clicks)
1. Visit: `/admin/waitlist`
2. Password: `Unlock`
3. Click "Export Email List" → Send to Mailchimp/SendGrid

---

## For Students

### Browse Tests
- **Upcoming tests**: `/live`
- **Past tests**: `/live/past`

### Join Waitlist
- Click upcoming test → Enter email → Get notified!

### Take Practice Test
- Click any green dot or past test → Bluebook interface → Start testing!

---

## Important URLs

| Page | URL | Purpose |
|------|-----|---------|
| Live Tests | `/live` | See all tests with countdowns |
| Past Tests | `/live/past` | Browse archive by category |
| Upload Test | `/live/upload` | Admin upload (requires password) |
| Waitlist Admin | `/admin/waitlist` | Export emails (requires password) |
| Take Test | `/live/test?test={id}` | Bluebook-style test interface |

---

## Passwords

- **Upload**: `Unlock`
- **Admin**: `Unlock`

---

## API Keys

- **Google Gemini AI**: `AIzaSyD4icVauYHyo7e0Tdtd5TqBjDrQHWKRgM4`
- **OCR.space**: `K84507617488957`

---

## Features Summary

✅ **AI-powered OCR** - Upload photos, AI extracts questions
✅ **Real-time countdowns** - Accurate to the second
✅ **Waitlist system** - Collect emails, export to CSV
✅ **Past tests archive** - Filter by SAT, ACT, AP, etc.
✅ **Bluebook interface** - Professional testing experience
✅ **Auto-save progress** - Never lose your work
✅ **Instant feedback** - See correct answers immediately

---

## Build & Deploy

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Troubleshooting

**Q: Test not showing after upload?**
A: Check `/admin/waitlist` to ensure test_id matches database

**Q: Countdown not accurate?**
A: Check test date format in `/src/lib/test-dates.ts` (should be `YYYY-MM-DDTHH:MM:SS`)

**Q: Can't export emails?**
A: Make sure Supabase is configured and `test_waitlist` table exists

**Q: Images not processing?**
A: Verify Google Gemini API key is valid in `/src/lib/gemini-ocr.ts`

---

## Support

For issues, check:
1. Browser console for errors
2. Network tab for API failures
3. Supabase dashboard for database issues
4. `/COMPLETE_IMPLEMENTATION_SUMMARY.md` for detailed documentation
