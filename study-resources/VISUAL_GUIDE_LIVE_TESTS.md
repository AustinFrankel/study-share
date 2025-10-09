# 📸 Visual Guide - Live Test System

## What You'll See

### 1. **Live Page** (`/live`)

```
┌─────────────────────────────────────────────────────────┐
│                    📅 Live Test Countdown                │
│         Track upcoming exams with real-time countdowns    │
│                                                           │
│    🔴 Upcoming  🟠 This Week  🟢 Available  ⚪ Archived  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  SAT, ACT & PSAT                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │🔴          │  │🟠          │  │🟢          │     │
│  │            │  │            │  │            │     │
│  │  📚 SAT    │  │  ✏️ ACT    │  │  📝 PSAT  │     │
│  │            │  │            │  │            │     │
│  │  March 8   │  │  April 12  │  │  Oct 15    │     │
│  │            │  │            │  │            │     │
│  │  ⏱️ 45 days │  │  ⏱️ 6 days │  │  ✓ Passed │     │
│  │            │  │            │  │            │     │
│  │[Waitlist]  │  │[Waitlist]  │  │[Materials] │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      AP Exams                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │🔴       │  │🔴       │  │🔴       │  │🔴       ││
│  │         │  │         │  │         │  │         ││
│  │🧠 Psych │  │⚗️ Chem  │  │🧬 Bio   │  │📐 Calc  ││
│  │May 6    │  │May 13   │  │May 16   │  │May 7    ││
│  │[Wait]   │  │[Wait]   │  │[Wait]   │  │[Wait]   ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                           │
│  (20+ more AP exams...)                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              ⚪ Past Tests (Archived)                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │⚪           │  │⚪           │                     │
│  │             │  │             │                     │
│  │  📚 SAT Jan │  │  ✏️ ACT Dec │                     │
│  │  Jan 25     │  │  Dec 14     │                     │
│  │  [Materials]│  │  [Materials]│                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

### 2. **Waitlist Dialog**

```
┌────────────────────────────────────────┐
│  📚 Join SAT Waitlist                  │
├────────────────────────────────────────┤
│                                        │
│  📅 Sat, Mar 8, 2025                   │
│  ⏱️ 45 days remaining                  │
│                                        │
│  Name:  [________________]             │
│                                        │
│  Email: [________________]             │
│                                        │
│  ℹ️ What you'll get:                   │
│  • Email reminders before test day     │
│  • Study tips and resources            │
│  • Test preparation checklist          │
│  • Access to practice materials        │
│                                        │
│  [        Join Waitlist        ] 🔔    │
│                                        │
│  We respect your privacy. Unsubscribe  │
│  anytime.                              │
└────────────────────────────────────────┘
```

---

### 3. **Bluebook Test Interface** (`/live/test`)

#### Start Screen
```
┌────────────────────────────────────────────────────────┐
│         Digital SAT Practice Test                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Test ID: sat-mar                                      │
│  Total Questions: 27                                   │
│  Time Limit: 64 minutes                                │
│                                                        │
│  ℹ️ Instructions:                                      │
│  • You can navigate within the current module only     │
│  • Use the question palette to jump to any question    │
│  • Flag questions for review                           │
│  • Use the built-in calculator, highlighter, etc.      │
│  • Answers auto-save and auto-submit when time expires │
│  • Do NOT close your device during the test            │
│                                                        │
│  [          Begin Test          ]                      │
└────────────────────────────────────────────────────────┘
```

#### Test Interface
```
┌─────────────────────────────────────────────────────────────┐
│ Digital SAT - Module 1 of 2  │  Reading & Writing  │ 👁️ ⏱️ 01:03:45 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────┐
│  Question 1              │  Progress                       │
│                          │  ─────────────                  │
│  [Passage Box]           │  5 / 14                         │
│  Lorem ipsum dolor sit   │  Answered                       │
│  amet, consectetur...    │                                 │
│  [scroll if needed]      │  Questions                      │
│                          │  ┌─┬─┬─┬─┬─┬─┐                 │
│  Which choice best       │  │1│2│3│4│5│6│                 │
│  describes the main      │  └─┴─┴─┴─┴─┴─┘                 │
│  purpose of the passage? │  ┌─┬─┬─┬─┬─┬─┐                 │
│                          │  │7│8│9│10│11│12│               │
│  ┌─────────────────────┐ │  └─┴─┴─┴─┴─┴─┘                 │
│  │ ⓐ To explain a      │ │  ┌─┬─┐                         │
│  │   complex concept   │ │  │13│14│                       │
│  └─────────────────────┘ │  └─┴─┘                         │
│  ┌─────────────────────┐ │                                 │
│  │ ⓑ To present        │ │  [Submit Module]                │
│  │   contrasting views │ │                                 │
│  └─────────────────────┘ │                                 │
│  ┌─────────────────────┐ │                                 │
│  │ ⓒ To describe a     │ │                                 │
│  │   historical event  │ │                                 │
│  └─────────────────────┘ │                                 │
│  ┌─────────────────────┐ │                                 │
│  │ ⓓ To analyze        │ │                                 │
│  │   literary techniques│ │                                 │
│  └─────────────────────┘ │                                 │
│                          │                                 │
│  🚩 🖍️ ❌ 🧮              │                                 │
│  [< Previous] [Next >]   │                                 │
└──────────────────────────┴─────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🧮 Calculator                  [-][×]  │
│  ┌───────────────┐                      │
│  │           0   │                      │
│  └───────────────┘                      │
│  ┌─┬─┬─┬─┐                              │
│  │7│8│9│/│                              │
│  ├─┼─┼─┼─┤                              │
│  │4│5│6│*│                              │
│  ├─┼─┼─┼─┤                              │
│  │1│2│3│-│                              │
│  ├─┼─┼─┼─┤                              │
│  │0│.│=│+│                              │
│  └─┴─┴─┴─┘                              │
└─────────────────────────────────────────┘
```

#### With Answer Selected
```
┌─────────────────────────┐
│ ⓐ To explain a          │ (not selected)
│   complex concept       │
└─────────────────────────┘
┌─────────────────────────┐
│ 🔵 To present           │ ← SELECTED (blue)
│   contrasting views     │
└─────────────────────────┘
┌─────────────────────────┐
│ ⓒ To describe a         │ (not selected)
│   historical event      │
└─────────────────────────┘
┌─────────────────────────┐
│ ⓓ To analyze            │ ❌ ← ELIMINATED (grayed + strikethrough)
│   literary techniques   │
└─────────────────────────┘
```

#### With Instant Feedback (After Submit)
```
┌─────────────────────────┐
│ ⓐ To explain a          │ (not selected)
│   complex concept       │
└─────────────────────────┘
┌─────────────────────────┐
│ ✅ To present           │ ← CORRECT (green + checkmark)
│   contrasting views     │
└─────────────────────────┘
┌─────────────────────────┐
│ ⓒ To describe a         │ (not selected)
│   historical event      │
└─────────────────────────┘
┌─────────────────────────┐
│ ⓓ To analyze            │ (not selected)
│   literary techniques   │
└─────────────────────────┘

┌────────────────────────────────────────┐
│ ℹ️ Explanation:                         │
│ The correct answer is B because the    │
│ passage presents multiple perspectives │
│ on the topic, allowing readers to      │
│ consider different viewpoints.         │
└────────────────────────────────────────┘
```

#### Results Screen
```
┌────────────────────────────────────────┐
│                                        │
│           ✅ Test Complete!            │
│      Your answers have been submitted  │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  Your Score                    │   │
│  │                                │   │
│  │  Correct Answers:   22 / 27    │   │
│  │  Percentage:        81%        │   │
│  └────────────────────────────────┘   │
│                                        │
│  [   Review Answers   ]                │
│  [   Back to Tests    ]                │
│                                        │
└────────────────────────────────────────┘
```

---

### 4. **Question Palette States**

```
Unanswered:   [ 1 ]  ← White background, gray border
Answered:     [ 2 ]  ← Blue background, white text
Flagged:      [ 3 ]  ← Orange background, orange text
Current:      ( 4 )  ← Ring around it (blue)
```

---

### 5. **Tool Icons & States**

```
🚩  Flag         → Orange when active
🖍️  Highlighter → Yellow when active
❌  Eliminator   → Red when active
🧮  Calculator   → Opens draggable window
⏱️  Timer        → Shows/hides with eye icon
👁️  Eye          → Toggle timer visibility
```

---

### 6. **Status Dot Legend**

```
┌────────────────────────────────────────────────────┐
│  🔴 Upcoming    More than 1 week away              │
│  🟠 This Week   Within 7 days                      │
│  🟢 Available   Test date passed, materials ready  │
│  ⚪ Archived    Over 1 week old                    │
└────────────────────────────────────────────────────┘
```

---

### 7. **Mobile Layout**

```
┌──────────────────────┐
│  📅 Live Test        │
│     Countdown        │
│                      │
│  🔴🟠🟢⚪ Legend      │
├──────────────────────┤
│  SAT, ACT & PSAT     │
├──────────────────────┤
│  ┌────────────────┐  │
│  │🔴             │  │
│  │               │  │
│  │  📚 SAT       │  │
│  │  March 8      │  │
│  │               │  │
│  │  ⏱️ 45 days    │  │
│  │               │  │
│  │  [Waitlist]   │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │🟠             │  │
│  │  ✏️ ACT       │  │
│  │  [Waitlist]   │  │
│  └────────────────┘  │
├──────────────────────┤
│  AP Exams            │
├──────────────────────┤
│  (Grid of AP cards)  │
└──────────────────────┘
```

---

## Color Codes

### Live Page
- **Background**: `#F6F7F9` (light gray)
- **Cards**: `#FFFFFF` (white)
- **Primary**: `#0E66FF` (blue)
- **Borders**: `#E6E7EB` (light gray)

### Status Dots
- **Red**: `#EF4444` (upcoming)
- **Orange**: `#F97316` (this week)
- **Green**: `#10B981` (available)
- **Gray**: `#9CA3AF` (archived)

### Bluebook Interface
- **Background**: `#F6F7F9`
- **Cards**: `#FFFFFF`
- **Selected**: `#0E66FF` (blue)
- **Correct**: `#10B981` (green)
- **Wrong**: `#EF4444` (red)
- **Flagged**: `#F97316` (orange)
- **Eliminated**: `opacity: 0.45`

---

## Typography Examples

```
┌─────────────────────────────────────────┐
│  Heading (22px, semi-bold)              │
│                                         │
│  Question Text (18px, line-height 1.45) │
│  This is what a question looks like     │
│  with proper spacing and readability.   │
│                                         │
│  Answer Choice (16px, line-height 1.4)  │
│                                         │
│  UI Label (13px, line-height 1.2)       │
└─────────────────────────────────────────┘
```

---

## Animation Examples

### Pulse Animation (Status Dots)
```
🔴 → 🔴 (slightly larger) → 🔴 → 🔴 (slightly larger)
   (0.5s intervals, smooth transition)
```

### Hover Effect (Cards)
```
Card at rest:        shadow-sm
Card on hover:       shadow-2xl + translate-y(-8px)
                     (0.3s smooth transition)
```

### Timer Warning (Last 5 minutes)
```
Normal:   ⏱️ 00:05:00 (gray background)
Warning:  ⏱️ 00:04:59 (red background, pulsing)
```

---

## Responsive Breakpoints

```
Mobile (< 640px):    Single column, stacked layout
Tablet (640-1024px): 2 columns for cards
Desktop (> 1024px):  3 columns for cards, 2-col test interface
```

---

## User Flow Diagram

```
Start → /live
         ↓
    Select Test
         ↓
    ┌────┴────┐
    ↓         ↓
Upcoming    Past
    ↓         ↓
Waitlist    Test Interface
    ↓         ↓
 Success    Take Test
    ↓         ↓
  Done    Submit & Review
            ↓
        View Results
            ↓
          Done
```

---

## Key Interactions

### 1. **Select Answer**
Click → Border turns blue → Fill letter circle → Save to state

### 2. **Eliminate Answer**
Toggle eliminator → Click X → Gray out + strikethrough → Save

### 3. **Flag Question**
Click flag → Turn orange → Show in palette → Save

### 4. **Submit Test**
Click submit → Show loading → Calculate score → Display results

### 5. **Review Mode**
Click review → Re-enter test → Show green/red feedback → Read explanations

---

## Database Flow

```
Waitlist Signup:
User fills form → Click submit → POST to Supabase → Save to test_waitlist

Test Progress:
Answer question → Auto-save to state → Submit test →
POST to test_user_progress → Calculate score → Show results

Load Questions:
Open test → GET from test_resources → Parse JSON →
Display questions → Start timer
```

---

This visual guide shows exactly what users will see and interact with in your Live Test System! 🎨
