import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: fileId } = await context.params

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })

    // Get file record from database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (dbError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if it's a text file
    const isTextFile = fileRecord.mime && (
      fileRecord.mime.startsWith('text/') ||
      fileRecord.mime === 'application/json' ||
      fileRecord.mime === 'application/xml' ||
      fileRecord.original_filename?.match(/\.(txt|md|json|xml|csv|log|js|ts|jsx|tsx|py|java|c|cpp|h|css|html|sql)$/i)
    )

    if (!isTextFile) {
      return NextResponse.json({ error: 'File is not a text file' }, { status: 400 })
    }

    // Download file from storage
    let fileData, storageError
    try {
      const result = await supabase.storage
        .from('resources')
        .download(fileRecord.storage_path)
      fileData = result.data
      storageError = result.error
    } catch (e) {
      // Fallback to resource-files bucket if resources doesn't exist
      const result = await supabase.storage
        .from('resource-files')
        .download(fileRecord.storage_path)
      fileData = result.data
      storageError = result.error
    }

    if (storageError || !fileData) {
      console.error('Storage error:', storageError)
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
    }

    // Convert blob to text
    const text = await fileData.text()
    
    return NextResponse.json({
      content: text,
      filename: fileRecord.original_filename,
      mime: fileRecord.mime
    })

  } catch (error) {
    console.error('Error getting file content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
