# Profile + Live Page Fix Runbook

Use this runbook to fix the profile not loading and the Live page button flicker, and to enable Join Waitlist / View Materials.

What this does
- Fixes notifications join (400 errors)
- Ensures user_points view works (prevents 406)
- Creates waitlist + resources tables for Live
- Gives you verification queries and troubleshooting

Before you start
- Open Supabase SQL Editor for your project.
- Copy ONLY the content inside the code fences. The first line in the SQL editor should be a SQL comment.
- If you see: syntax error near '-' your editor converted hyphens into an en-dash. Use these blocks with /* ... */ comments to avoid that.

---

## 1) Fix notifications FKs and policies (copy/paste into SQL editor)

```sql
/* BEGIN: Notifications FKs + policies */
/* Point FKs to public.users (not auth.users) */
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey,
  DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT notifications_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;

/* Extra columns (safe if already exist) */
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS link text;

/* Helpful indexes */
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

/* RLS + policies */
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);
/* END: Notifications FKs + policies */
```

Verification (optional):
```sql
-- Replace with a real user id if you want to test
-- SELECT n.*, u.handle AS sender_handle
-- FROM public.notifications n
-- LEFT JOIN public.users u ON u.id = n.sender_id
-- WHERE n.recipient_id = '00000000-0000-0000-0000-000000000000';
```

---

## 2) Ensure user_points view exists (prevents 406)

```sql
/* BEGIN: user_points view */
DROP VIEW IF EXISTS public.user_points;

CREATE VIEW public.user_points AS
SELECT
  user_id,
  SUM(delta) AS total_points,
  COUNT(*) AS transaction_count
FROM public.points_ledger
GROUP BY user_id;

GRANT SELECT ON public.user_points TO anon, authenticated;
/* END: user_points view */
```

Verification:
```sql
SELECT * FROM public.user_points LIMIT 5;
```

---

## 3) Create test_waitlist table (Join Waitlist works)

```sql
/* BEGIN: test_waitlist table + RLS */
CREATE TABLE IF NOT EXISTS public.test_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  test_name text NOT NULL,
  email text NOT NULL,
  name text,
  user_id uuid,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_waitlist_test_id ON public.test_waitlist(test_id);
CREATE INDEX IF NOT EXISTS idx_test_waitlist_email ON public.test_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_test_waitlist_created_at ON public.test_waitlist(created_at DESC);

ALTER TABLE public.test_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS test_waitlist_read ON public.test_waitlist;
CREATE POLICY test_waitlist_read ON public.test_waitlist
  FOR SELECT USING (true);

DROP POLICY IF EXISTS test_waitlist_insert ON public.test_waitlist;
CREATE POLICY test_waitlist_insert ON public.test_waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
/* END: test_waitlist table + RLS */
```

Verification:
```sql
SELECT * FROM public.test_waitlist LIMIT 5;
```

---

## 4) Create test_resources table (View Materials works)

```sql
/* BEGIN: test_resources table + RLS */
CREATE TABLE IF NOT EXISTS public.test_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL UNIQUE,
  test_name text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  uploader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_resources_test_id ON public.test_resources(test_id);
CREATE INDEX IF NOT EXISTS idx_test_resources_created_at ON public.test_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_resources_uploader_id ON public.test_resources(uploader_id);

ALTER TABLE public.test_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view test resources" ON public.test_resources;
CREATE POLICY "Anyone can view test resources"
  ON public.test_resources FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert test resources" ON public.test_resources;
CREATE POLICY "Authenticated users can insert test resources"
  ON public.test_resources FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update test resources" ON public.test_resources;
CREATE POLICY "Authenticated users can update test resources"
  ON public.test_resources FOR UPDATE TO authenticated
  USING (true);
/* END: test_resources table + RLS */
```

Seed example (optional):
```sql
INSERT INTO public.test_resources (test_id, test_name, questions)
VALUES (
  'PSAT-2025-10-15',
  'PSAT/NMSQT',
  '[{"id":"q1","text":"Sample PSAT question?","choices":["A","B","C","D"],"answer":"B"}]'::jsonb
)
ON CONFLICT (test_id) DO NOTHING;
```

Verification:
```sql
SELECT id, test_id, test_name, jsonb_array_length(questions) AS q_count
FROM public.test_resources
ORDER BY created_at DESC
LIMIT 5;
```

---

## 5) Frontend steps
- Stop and restart your dev server (or hard refresh the browser cache).
- Visit /profile → it should load without 400/406 errors.
- Visit /live →
  - For upcoming tests, click "Join Waitlist" → dialog opens and submits.
  - For past/archived tests (or ones you seeded in test_resources), click "View Materials" → routes to /live/test?test=<id> without flicker.

---

## Troubleshooting
- 400 on notifications: confirm the notifications FKs point to public.users and that policies exist.
- 406 on user_points: ensure the view exists and GRANT SELECT to anon, authenticated.
- Waitlist insert blocked: confirm RLS policies allow INSERT for anon/authenticated.
- Live button flicker: hard refresh after deploy; the UI changes reduce re-render flicker.

Done.
