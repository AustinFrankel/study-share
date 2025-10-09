# StudyShare Pricing Strategy & Stripe Integration Guide
**Date:** October 8, 2025  
**Status:** Strategic Planning Document

---

## 📊 Executive Summary

Based on market analysis of EdTech competitors (Khan Academy, Quizlet, Course Hero) and student spending patterns, I recommend a **hybrid freemium + tiered pricing model** that balances accessibility with revenue generation.

**Recommended Pricing:**
- **Free Tier:** Access to community-uploaded resources (current feature)
- **Test Access (À la carte):** $7.99 per practice test
- **Premium Monthly:** $14.99/month (3-5 tests/month + resources)
- **All-Access Annual:** $99.99/year (~$8.33/month, unlimited)

---

## 🎯 Market Analysis

### Current EdTech Pricing Landscape (2025)

| Platform | Model | Price | What Students Get |
|----------|-------|-------|-------------------|
| **Quizlet Plus** | Subscription | $7.99/month | Study tools, no ads |
| **Course Hero** | Subscription | $39.95/month | Homework help, documents |
| **Chegg Study** | Subscription | $19.95/month | Textbook solutions |
| **Khan Academy** | Free + Donations | $0 | SAT prep, courses |
| **Princeton Review** | One-time | $399-799 | SAT/ACT courses |
| **UWorld SAT** | Subscription | $49-89/month | SAT practice questions |

### Key Insights:
1. **Students prefer monthly subscriptions** over large upfront costs
2. **Price sensitivity:** Most students spend $10-20/month on study tools
3. **Test prep market:** Willing to pay premium ($50-100) for SAT/ACT resources
4. **Bundling wins:** All-access passes convert better than single purchases

---

## 💰 Recommended Pricing Model

### **Three-Tier Strategy**

#### 🆓 **Tier 1: Free (Community)**
**Price:** $0  
**What's Included:**
- ✅ Upload and share study resources
- ✅ View community-uploaded notes, guides, and materials
- ✅ Basic search and filtering
- ✅ Vote and comment on resources
- ✅ Profile with stats and leaderboard
- ❌ No access to official practice tests
- ❌ No AI-generated study materials
- ❌ Limited resource views (5 per day)

**Purpose:** Drive user acquisition, build community, network effects

---

#### 🎓 **Tier 2: Premium (Monthly)**
**Price:** $14.99/month  
**What's Included:**
- ✅ Everything in Free
- ✅ **3-5 practice test credits per month** (carry over 2 months)
- ✅ Unlimited resource views
- ✅ AI-generated summaries and practice questions
- ✅ Ad-free experience
- ✅ Priority support
- ✅ Early access to new tests
- ✅ Download resources as PDF

**Target Audience:** Students preparing for 1-2 upcoming tests  
**Expected Conversion:** 8-12% of active users  
**Monthly Churn:** ~20-25% (normal for student apps)

---

#### 🚀 **Tier 3: All-Access (Annual)**
**Price:** $99.99/year (~$8.33/month - 44% savings!)  
**What's Included:**
- ✅ Everything in Premium
- ✅ **Unlimited practice test access** (all SAT, ACT, PSAT, AP exams)
- ✅ Exclusive masterclass content
- ✅ 1-on-1 monthly study coaching session (15 min)
- ✅ Custom study plan generator
- ✅ College admissions resources
- ✅ Premium badge on profile

**Target Audience:** Serious test preppers, students taking multiple exams  
**Expected Conversion:** 2-4% of active users (high LTV)  
**Annual Churn:** ~40-50%

---

#### 💎 **À La Carte: Single Test Access**
**Price:** $7.99 per test  
**What's Included:**
- ✅ Lifetime access to one specific practice test
- ✅ AI-generated explanations for that test
- ✅ Score tracking and analytics

**Target Audience:** One-time users, students needing just one test  
**Purpose:** Capture revenue from non-subscribers, impulse purchases

---

## 📈 Revenue Projections

### Conservative Scenario (Year 1)

| Metric | Value |
|--------|-------|
| **Total Users** | 10,000 |
| **Free Users** | 8,800 (88%) |
| **Premium Monthly** | 800 (8%) @ $14.99 = $11,992/month |
| **All-Access Annual** | 300 (3%) @ $99.99 = $29,997 (one-time) |
| **À La Carte Sales** | 100 (1%) @ $7.99 = $799/month |
| **Monthly Recurring Revenue (MRR)** | ~$12,791 |
| **Annual Recurring Revenue (ARR)** | ~$183,489 |

### Growth Scenario (Year 2)

| Metric | Value |
|--------|-------|
| **Total Users** | 50,000 |
| **Premium Monthly** | 5,000 (10%) @ $14.99 = $74,950/month |
| **All-Access Annual** | 2,000 (4%) @ $99.99 = $199,980 (one-time) |
| **À La Carte Sales** | 500 @ $7.99 = $3,995/month |
| **MRR** | ~$78,945 |
| **ARR** | ~$1,147,340 |

---

## 🎯 Pricing Psychology & Strategy

### Why This Model Works:

1. **Anchoring Effect:** $99.99 annual makes $14.99 monthly look reasonable
2. **Loss Aversion:** "3-5 test credits per month" creates urgency to use them
3. **Sunk Cost Fallacy:** Annual plan reduces churn (students don't want to waste $100)
4. **Price Segmentation:** Captures different willingness-to-pay levels
5. **Network Effects:** Free tier builds community, which drives Premium conversions

### Competitive Advantages:

- **Lower than Course Hero** ($39.95/month) but similar value
- **More flexible than Princeton Review** (no $400+ upfront cost)
- **Better than UWorld** ($49-89/month) for multi-test prep
- **Community aspect** (unique value proposition)

---

## 🔧 Alternative Models Considered

### ❌ **Rejected: Pay-Per-Test Only**
**Price:** $9.99 per test  
**Why Rejected:**
- High friction for repeat users
- No recurring revenue (unpredictable cash flow)
- Doesn't encourage platform engagement
- Hard to build community

### ❌ **Rejected: Single Premium Tier**
**Price:** $19.99/month (unlimited)  
**Why Rejected:**
- Misses high-value customers willing to pay more
- No annual commitment option (higher churn)
- Doesn't capture casual users ($8 single test)

### ✅ **Keep as Option: Educational Institution Plan**
**Price:** $499/year per teacher (30 student seats)  
**Future Opportunity:** B2B sales to schools

---

## 🛠️ Stripe Integration Guide

### **Step 1: Set Up Stripe Account**

```bash
# Install Stripe
npm install stripe @stripe/stripe-js

# Install Stripe React components
npm install @stripe/react-stripe-js
```

### **Step 2: Environment Variables**

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### **Step 3: Create Stripe Products**

In Stripe Dashboard, create:

1. **Premium Monthly**
   - Product Name: "StudyShare Premium - Monthly"
   - Price: $14.99/month
   - Recurring: Monthly
   - Product ID: `price_premium_monthly`

2. **All-Access Annual**
   - Product Name: "StudyShare All-Access - Annual"
   - Price: $99.99/year
   - Recurring: Yearly
   - Product ID: `price_all_access_annual`

3. **Single Test Access**
   - Product Name: "Practice Test - Single Access"
   - Price: $7.99
   - One-time payment
   - Product ID: `price_single_test`

### **Step 4: Database Schema**

```sql
-- Add to existing schema
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL, -- 'premium_monthly', 'all_access_annual'
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  test_credits_remaining INTEGER DEFAULT 0,
  test_credits_reset_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE test_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  price_paid DECIMAL(10, 2),
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  stripe_payment_id TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL, -- 'succeeded', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_test_purchases_user_id ON test_purchases(user_id);
```

### **Step 5: Create Stripe API Routes**

**File:** `src/app/api/stripe/create-checkout-session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, planType } = await req.json()

    // Create or retrieve Stripe customer
    const { data: user } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = user?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId }
      })
      customerId = customer.id

      // Save customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: planType === 'single_test' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: { userId, planType }
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
```

**File:** `src/app/api/stripe/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
      break
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, planType } = session.metadata!

  if (session.mode === 'subscription') {
    // Handle subscription creation
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    const testCredits = planType === 'premium_monthly' ? 5 : 999999 // Unlimited for annual

    await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      test_credits_remaining: testCredits,
      test_credits_reset_date: new Date(subscription.current_period_end * 1000)
    })
  } else {
    // Handle one-time test purchase
    await supabase.from('test_purchases').insert({
      user_id: userId,
      test_id: session.metadata!.testId,
      test_name: session.metadata!.testName,
      price_paid: (session.amount_total || 0) / 100,
      stripe_payment_intent_id: session.payment_intent as string
    })
  }

  // Log payment
  await supabase.from('payment_history').insert({
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    stripe_payment_id: session.payment_intent as string,
    description: planType,
    status: 'succeeded'
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Reset test credits on successful renewal
  if (invoice.subscription) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('stripe_subscription_id', invoice.subscription)
      .single()

    const credits = sub?.plan_type === 'premium_monthly' ? 5 : 999999

    await supabase
      .from('subscriptions')
      .update({
        test_credits_remaining: credits,
        test_credits_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .eq('stripe_subscription_id', invoice.subscription)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Notify user, mark subscription as past_due
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription as string)
}
```

### **Step 6: Create Pricing Page Component**

**File:** `src/app/pricing/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Zap, Crown } from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string, planType: string) => {
    if (!user) {
      router.push('/signin?redirect=/pricing')
      return
    }

    setLoading(planType)

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, planType })
      })

      const { sessionId } = await res.json()

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(m => 
        m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      )
      await stripe?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-center mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Unlock unlimited practice tests and study resources
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <Card className="p-8 border-2">
            <h3 className="text-2xl font-bold mb-2">Community</h3>
            <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500">/forever</span></p>
            <Button className="w-full mb-6" variant="outline">Current Plan</Button>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Upload & share resources</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Community study materials</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>5 resource views/day</span>
              </li>
            </ul>
          </Card>

          {/* Premium Monthly */}
          <Card className="p-8 border-4 border-indigo-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-indigo-500" />
              <h3 className="text-2xl font-bold">Premium</h3>
            </div>
            <p className="text-4xl font-bold mb-6">$14.99<span className="text-lg text-gray-500">/month</span></p>
            <Button 
              className="w-full mb-6 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleSubscribe('price_premium_monthly', 'premium_monthly')}
              disabled={loading === 'premium_monthly'}
            >
              {loading === 'premium_monthly' ? 'Processing...' : 'Get Started'}
            </Button>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-semibold">3-5 practice tests/month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Unlimited resource views</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>AI-generated summaries</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Ad-free experience</span>
              </li>
            </ul>
          </Card>

          {/* All-Access Annual */}
          <Card className="p-8 border-2 border-purple-300">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-purple-500" />
              <h3 className="text-2xl font-bold">All-Access</h3>
            </div>
            <p className="text-4xl font-bold mb-1">$99.99<span className="text-lg text-gray-500">/year</span></p>
            <p className="text-sm text-green-600 font-semibold mb-5">Save 44% vs monthly!</p>
            <Button 
              className="w-full mb-6 bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSubscribe('price_all_access_annual', 'all_access_annual')}
              disabled={loading === 'all_access_annual'}
            >
              {loading === 'all_access_annual' ? 'Processing...' : 'Go All-Access'}
            </Button>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Unlimited practice tests</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>All Premium features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>1-on-1 monthly coaching</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Premium badge</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

---

## 🎯 Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Stripe account (Business account recommended)
- [ ] Create products and prices in Stripe Dashboard
- [ ] Install Stripe packages (`npm install stripe @stripe/stripe-js @stripe/react-stripe-js`)
- [ ] Add environment variables
- [ ] Create database tables (subscriptions, test_purchases, payment_history)
- [ ] Add stripe_customer_id column to users table

### Phase 2: API Development (Week 2-3)
- [ ] Build `/api/stripe/create-checkout-session` endpoint
- [ ] Build `/api/stripe/webhook` endpoint
- [ ] Test webhook locally with Stripe CLI (`stripe listen --forward-to localhost:3000/api/stripe/webhook`)
- [ ] Implement subscription management endpoints (cancel, resume, update)

### Phase 3: Frontend (Week 3-4)
- [ ] Create pricing page (`/pricing`)
- [ ] Add "Upgrade" buttons throughout app
- [ ] Build subscription management dashboard (`/account/subscription`)
- [ ] Add payment success/failure pages
- [ ] Implement access control checks (middleware for premium content)

### Phase 4: Testing (Week 4-5)
- [ ] Test subscriptions with Stripe test cards
- [ ] Test webhook events (subscription created, updated, canceled)
- [ ] Test payment failures and retries
- [ ] Test credit system (deduction, reset on renewal)
- [ ] Stress test concurrent purchases

### Phase 5: Launch (Week 5-6)
- [ ] Switch to live Stripe keys
- [ ] Set up webhook endpoint in Stripe Dashboard (production URL)
- [ ] Configure Stripe email notifications
- [ ] Add analytics tracking (Mixpanel, Google Analytics)
- [ ] Create marketing materials
- [ ] Announce launch to users

---

## 🔒 Security Considerations

1. **Never expose secret keys** in client code
2. **Always verify webhooks** with signature validation
3. **Store payment data in Stripe**, not your database (PCI compliance)
4. **Use HTTPS** for all payment pages
5. **Implement rate limiting** on checkout endpoints
6. **Log all payment events** for audit trail
7. **Handle failed payments gracefully** (retry logic, user notifications)

---

## 📧 Communication Strategy

### Email Sequences

**Welcome Email (Free User):**
- Subject: "Welcome to StudyShare! 🎓"
- Content: Tour of features, call-to-action to upgrade

**Trial Reminder (Day 3):**
- Subject: "You're running out of free views"
- Content: Usage stats, upgrade benefits

**Subscription Confirmation:**
- Subject: "You're now a StudyShare Premium member! 🎉"
- Content: What's included, how to access tests

**Payment Failed:**
- Subject: "Action required: Update your payment method"
- Content: Link to update card, grace period notice

**Cancellation Save:**
- Subject: "We'd hate to see you go..."
- Content: Feedback survey, 20% discount offer

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Target (Year 1) |
|--------|----------------|
| **Free-to-Paid Conversion** | 8-12% |
| **Monthly Churn** | <25% |
| **Annual Churn** | <50% |
| **Average Revenue Per User (ARPU)** | $3-5 |
| **Customer Lifetime Value (LTV)** | $60-120 |
| **Customer Acquisition Cost (CAC)** | <$20 |
| **LTV:CAC Ratio** | >3:1 |

---

## 🚀 Growth Tactics

1. **Free Trial:** Offer 7-day Premium trial (requires credit card)
2. **Referral Program:** Give 1 free test credit for each friend referred
3. **Student Discounts:** 20% off with .edu email
4. **Annual Prepay Incentive:** 2 months free when paying annually
5. **Bundle with Schools:** B2B sales to school districts ($499/teacher/year)
6. **Seasonal Promotions:** Black Friday (30% off annual), Back-to-School (free month)

---

## 💡 Future Expansion Ideas

1. **Enterprise Plan:** $2,999/year for schools (unlimited seats)
2. **Tutoring Marketplace:** Take 20% commission on tutor bookings
3. **Custom Test Creation:** $49 one-time fee for teachers to create custom tests
4. **White Label:** License platform to other educational institutions ($10k setup + $2k/month)
5. **API Access:** Developer tier at $99/month for API access
6. **Premium Content:** Partner with test prep companies, take 30% revenue share

---

## 🎓 Recommended: Master Membership

### **Option: All-In-One Membership**

Instead of separating test access from resource access, I recommend a **unified membership** that includes:

✅ **Single membership unlocks everything:**
- Practice tests (SAT, ACT, PSAT, AP)
- Community resources (notes, study guides)
- AI-generated summaries
- Ad-free experience

**Why this works better:**
1. **Simpler to understand** (one price, everything unlocked)
2. **Higher perceived value** (more features for the same price)
3. **Reduced decision fatigue** (no "which tier?" confusion)
4. **Better conversion** (clearer value proposition)
5. **Lower churn** (users engaged with multiple features)

**Alternative: Separate Subscriptions (NOT RECOMMENDED)**
- "Test Access Only" ($9.99/month) - just tests
- "Resources Only" ($7.99/month) - just study materials
- **Problem:** Confusing, lower AOV, harder to market

---

## 🎯 Final Recommendation

**Implement the three-tier model:**
1. Free (community access)
2. Premium Monthly ($14.99 - 3-5 tests/month + all resources)
3. All-Access Annual ($99.99 - unlimited tests + all resources)

**Plus:**
- À la carte single test ($7.99)
- Future B2B plan for schools ($499/year)

This balances accessibility, revenue potential, and simplicity. Start with this, then iterate based on user feedback and conversion data.

---

## 📞 Next Steps

1. **Review this document** with your team
2. **Set up Stripe account** and create test products
3. **Implement database schema** changes
4. **Build API endpoints** for checkout and webhooks
5. **Create pricing page** frontend
6. **Test thoroughly** with Stripe test mode
7. **Launch with soft rollout** to 10% of users
8. **Monitor metrics** and iterate

**Questions? Need help with implementation? Let me know!** 🚀
