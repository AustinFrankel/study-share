import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: resourceId } = await context.params
  if (!resourceId) {
    return NextResponse.json({ error: 'Missing resource id' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  })

  try {
    // Collect storage paths then delete storage objects (best-effort)
    const { data: files } = await supabase
      .from('files')
      .select('storage_path')
      .eq('resource_id', resourceId)

    const paths = (files || [])
      .map((f: any) => f?.storage_path)
      .filter((p: string | null): p is string => Boolean(p))

    if (paths.length > 0) {
      try {
        await supabase.storage.from('resources').remove(paths)
      } catch (e) {
        // Fallback bucket name if project uses a different one
        try { await supabase.storage.from('resource-files').remove(paths) } catch {}
      }
    }

    // Delete child rows first (be resilient even if tables/policies differ)
    try { await supabase.from('files').delete().eq('resource_id', resourceId) } catch {}
    try { await supabase.from('ai_derivatives').delete().eq('resource_id', resourceId) } catch {}
    try { await supabase.from('resource_tags').delete().eq('resource_id', resourceId) } catch {}
    try { await supabase.from('votes').delete().eq('resource_id', resourceId) } catch {}
    try { await supabase.from('flags').delete().eq('resource_id', resourceId) } catch {}
    try { await supabase.from('comments').delete().eq('resource_id', resourceId) } catch {}
    try { await supabase.from('points_ledger').delete().eq('resource_id', resourceId) } catch {}

    // Finally delete the resource itself
    const { error: resErr } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId)

    if (resErr) {
      return NextResponse.json({ error: resErr.message || 'Failed to delete resource' }, { status: 500 })
    }

    // Best-effort: remove any remaining storage artifacts by prefix
    try {
      const prefix = `${resourceId}/`
      const list = await supabase.storage.from('resources').list(prefix, { limit: 1000 })
      const leftovers = (list.data || []).map((f: any) => `${prefix}${f.name}`)
      if (leftovers.length > 0) {
        try { await supabase.storage.from('resources').remove(leftovers) } catch {}
      }
    } catch {}

    return NextResponse.json({ success: true })
  } catch (e: any) {
    const message = e?.message || 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


