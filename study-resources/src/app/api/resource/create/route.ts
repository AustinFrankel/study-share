import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for validation and insertion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      subtitle,
      type,
      class_id,
      uploader_id,
      public: isPublic = true,
      difficulty,
      study_time
    } = body || {}

    if (!title || !type || !class_id || !uploader_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })

    // Global uniqueness on case-insensitive title
    const { data: existing, error: dupErr } = await supabase
      .from('resources')
      .select('id')
      .ilike('title', title.trim())
      .limit(1)

    if (dupErr) {
      // If validation fails for some reason, still block to avoid duplicates unexpectedly
      return NextResponse.json({ error: dupErr.message }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'A resource with this title already exists.' }, { status: 409 })
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('resources')
      .insert({
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        type,
        class_id,
        uploader_id,
        public: isPublic,
        difficulty,
        study_time
      })
      .select()
      .single()

    if (insertErr || !inserted) {
      return NextResponse.json({ error: insertErr?.message || 'Failed to create resource' }, { status: 500 })
    }

    return NextResponse.json(inserted)
  } catch (e: any) {
    const message = e?.message || 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


