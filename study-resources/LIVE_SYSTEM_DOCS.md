# Live Test Countdown System - Documentation

## Overview

The Live Test Countdown system provides real-time countdowns to major standardized tests, with support for:
- SAT, ACT, MCAT, TOEFL, PSAT
- 20+ AP Exams (individual exams with specific dates)
- NY State Regents Exams (state-specific)

## Features

### 1. **Real-Time Countdowns**
- Live countdown timers showing days, hours, minutes, and seconds
- Visual progress indicators
- Color-coded test categories

### 2. **Test Categories**
- **College Admissions**: SAT, ACT, PSAT
- **Graduate Admissions**: MCAT
- **Language Proficiency**: TOEFL
- **AP Exams**: 20+ individual AP exams with specific dates
- **Regents Exams**: NY State Regents (requires state selection)

### 3. **Waitlist System**
Before test dates, users can:
- Join waitlist for email reminders
- Receive study resources and tips
- Get countdown notifications

### 4. **Post-Test Upload System**
After timer expires (test date passes):
- **Password-protected upload** (Password: `Austin11!`)
- Support for both image and text uploads
- Formatted document creation

### 5. **Progressive Access Model**
When viewing test materials:

#### Free Access (Problems 1-5)
- No login required
- Full access to first 5 problems

#### Ad Gate (Problems 6-8)
- Watch 15-second ad
- Unlocks next 3 problems
- One-time requirement per session

#### Account Gate (Problems 9+)
- Create free account
- Access more problems
- Track progress

#### Premium Paywall (Full Access)
- **$4.99 one-time payment**
- Unlimited access to all problems
- Download/print capability
- Lifetime access to test

## File Structure

```
src/app/live/
├── page.tsx              # Main countdown page with all tests
├── upload/
│   └── page.tsx         # Password-protected upload page
└── view/
    └── page.tsx         # Progressive access viewing page
```

## Database Schema

### `test_waitlist`
Stores waitlist signups before test dates.

```sql
- id: uuid
- test_id: text
- test_name: text
- email: text
- name: text
- user_id: uuid (optional)
- created_at: timestamptz
- notified: boolean
```

### `live_test_uploads`
Stores uploaded test materials after test dates.

```sql
- id: uuid
- test_id: text
- test_name: text
- uploader_id: uuid
- upload_type: 'image' | 'text'
- content: text (for text uploads)
- image_urls: text[] (for image uploads)
- created_at: timestamptz
- approved: boolean
```

### `test_purchases`
Tracks premium purchases for full access.

```sql
- id: uuid
- user_id: uuid
- test_id: text
- test_name: text
- amount: decimal(10,2)
- paid_at: timestamptz
```

## User Flow

### Before Test Date
1. User visits `/live`
2. Sees countdown timers
3. Clicks "Join Waitlist"
4. Enters name and email
5. Receives confirmation
6. Gets email reminders as test approaches

### After Test Date
1. Timer shows "Test Date Passed"
2. Button changes to "Upload Test Materials"
3. User clicks → redirected to `/live/upload`
4. Must enter password: `Austin11!`
5. Choose upload type (images or text)
6. Submit test materials
7. Automatically redirected to view page

### Viewing Test Materials
1. User visits `/live/view?test=ID&name=NAME`
2. Sees all problems with access gates
3. **Problems 1-5**: Free access
4. **Problem 6**: Ad gate appears
5. User watches 15-second ad
6. **Problems 6-8**: Now unlocked
7. **Problem 9**: Account gate appears
8. User signs in/creates account
9. **Problems 9+**: Unlocked for logged-in users
10. **Premium prompt**: $4.99 for lifetime access
11. After payment: Full unlimited access

## AP Exams (2025 Schedule)

### Sciences
- AP Biology (May 12)
- AP Chemistry (May 7)
- AP Physics 1 (May 7)
- AP Physics 2 (May 15)
- AP Environmental Science (May 13)

### Math & Computer Science
- AP Calculus AB (May 6)
- AP Calculus BC (May 6)
- AP Statistics (May 15)
- AP Computer Science A (May 8)
- AP Computer Science Principles (May 15)

### Humanities
- AP English Language (May 14)
- AP English Literature (May 9)
- AP Art History (May 5)

### Social Sciences
- AP US History (May 6)
- AP European History (May 9)
- AP World History (May 14)
- AP US Government (May 12)
- AP Psychology (May 8)

### Languages
- AP French Language (May 13)
- AP Spanish Language (May 8)

## Regents Exams (NY State)

### Math
- Algebra I (June 17)
- Geometry (June 18)
- Algebra II (June 19)

### Sciences
- Living Environment (June 18)
- Earth Science (June 20)
- Chemistry (June 19)
- Physics (June 20)

### English
- English Language Arts (June 17)

### Social Studies
- US History & Government (June 17)
- Global History & Geography (June 18)

## Configuration

### Upload Password
Set in `/src/app/live/upload/page.tsx`:
```typescript
const UPLOAD_PASSWORD = 'Austin11!'
```

### Paywall Price
Set in `/src/app/live/view/page.tsx`:
```typescript
amount: 4.99
```

### Ad Duration
Set in `/src/app/live/view/page.tsx`:
```typescript
const [adCountdown, setAdCountdown] = useState(15) // 15 seconds
```

### Access Gates
- Free: Problems 0-4 (first 5)
- Ad Gate: Problems 5-7 (next 3)
- Account Gate: Problems 8+
- Premium: All problems

## Payment Integration

Currently uses a simulated payment. To integrate real payments:

1. **Install Stripe**:
```bash
npm install @stripe/stripe-js
```

2. **Update handlePayment** in `view/page.tsx`:
```typescript
const handlePayment = async () => {
  // Initialize Stripe
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)
  
  // Create checkout session
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    body: JSON.stringify({
      testId,
      testName,
      amount: 4.99
    })
  })
  
  const session = await response.json()
  await stripe.redirectToCheckout({ sessionId: session.id })
}
```

3. **Create API route** `/api/create-checkout/route.ts`

## Styling

- Uses Tailwind CSS
- Gradient color schemes per test
- Responsive design (mobile-first)
- Animated countdown timers
- Smooth transitions and hover effects

## Security

- Upload page password-protected
- RLS policies on all tables
- User authentication required for purchases
- Content approval system in place

## Future Enhancements

1. **Email Notifications**: Integrate with SendGrid/Mailgun
2. **Real Payment Processing**: Stripe integration
3. **Ad Network**: Integrate Google AdSense
4. **More Exams**: GRE, GMAT, LSAT, etc.
5. **Study Tools**: Flashcards, practice questions
6. **Analytics**: Track user progress
7. **Social Features**: Study groups, forums

## Troubleshooting

### Migration Not Applied
Run this SQL directly in Supabase dashboard:
```bash
# Copy content from:
supabase/migrations/025_live_test_tables.sql
# Paste into Supabase SQL Editor
```

### Upload Not Working
- Check password is exactly: `Austin11!`
- Verify Supabase storage bucket exists
- Check RLS policies

### Payment Not Processing
- Currently simulated
- Implement Stripe for production
- Test with Stripe test mode first

## Testing

### Test Countdown Display
1. Visit `/live`
2. Verify all tests show correct dates
3. Check countdown updates every second

### Test Upload Flow
1. Wait for test date to pass (or modify date in code for testing)
2. Click "Upload Test Materials"
3. Enter password: `Austin11!`
4. Upload sample content
5. Verify redirect to view page

### Test Access Gates
1. Visit view page
2. Scroll through problems
3. Verify gates appear at correct positions
4. Test ad, auth, and paywall flows

## Support

For issues or questions:
- Check console for errors
- Verify database migrations applied
- Review RLS policies
- Check environment variables
