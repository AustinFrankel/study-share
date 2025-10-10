import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Prefer service role key for cross-bucket access; gracefully fall back to anon for public buckets
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Next.js 15 requires awaiting params in Route Handlers
  const { id: fileId } = await context.params

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })

    // Get file record from database (be resilient to inconsistent schemas)
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .select('id, storage_path, original_filename, mime, path')
      .eq('id', fileId)
      .maybeSingle()

    if (dbError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // If the storage path is a placeholder from local seeding, short-circuit with a 404-friendly SVG
    if (fileRecord.storage_path && fileRecord.storage_path.startsWith('placeholder-')) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="100%" height="100%" fill="#f3f4f6"/><g fill="#9ca3af" font-family="sans-serif" text-anchor="middle"><text x="400" y="220" font-size="24">No image available</text><text x="400" y="255" font-size="14">This file was seeded without a storage object</text></g></svg>`
      const headers = new Headers()
      headers.set('Content-Type', 'image/svg+xml')
      headers.set('Cache-Control', 'public, max-age=60')
      return new Response(svg, { headers })
    }

    // Download file from storage - try both buckets for compatibility
    let fileData, storageError
    try {
      const result = await supabase.storage
        .from('resources')
        .download(fileRecord.storage_path || fileRecord.path)
      fileData = result.data
      storageError = result.error
    } catch (e) {
      // Fallback to resource-files bucket if resources doesn't exist
      const result = await supabase.storage
        .from('resource-files')
        .download(fileRecord.storage_path || fileRecord.path)
      fileData = result.data
      storageError = result.error
    }

    if (storageError || !fileData) {
      console.error('Storage error:', storageError)
      // Return lightweight SVG placeholder instead of JSON 404 so <img> shows something graceful
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="100%" height="100%" fill="#f3f4f6"/><g fill="#9ca3af" font-family="sans-serif" text-anchor="middle"><text x="400" y="220" font-size="24">Image unavailable</text><text x="400" y="255" font-size="14">Storage object missing</text></g></svg>`
      const headers = new Headers()
      headers.set('Content-Type', 'image/svg+xml')
      headers.set('Cache-Control', 'public, max-age=60')
      return new Response(svg, { headers, status: 404 })
    }

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', fileRecord.mime || 'application/octet-stream')
    
    // Safely encode filename for Content-Disposition header
    const safeFilename = fileRecord.original_filename || `file-${fileId}`
    // Remove or replace problematic characters that can't be encoded as ByteString
    const cleanFilename = safeFilename
      .replace(/[^\x00-\xFF]/g, '_') // Replace non-ASCII characters with underscore
      .replace(/[<>:"/\\|?*]/g, '_') // Replace file system reserved characters
      .substring(0, 100) // Limit filename length to prevent issues
    
    // Use inline so images render in <img> tags
    headers.set('Content-Disposition', `inline; filename="${cleanFilename}"`)

    // IMPORTANT: prevent long-lived caching so updated previews show immediately
    // Use no-store to bypass browser and proxy caches
    headers.set('Cache-Control', 'no-store, must-revalidate')

    return new Response(fileData, { headers })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
