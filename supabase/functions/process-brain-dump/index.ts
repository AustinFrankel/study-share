// This is a Supabase Edge Function to process brain dump submissions

import { createClient } from '@supabase/supabase-js'
import { Request, Response } from 'node-fetch'

// Define types to avoid implicit any and unknown errors
interface BrainDump {
  id: string
  class_id: string
  title: string
  content: string
  contributor_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface MasterNote {
  id: string
  class_id: string
  content: string
  last_updated: string
  last_contributor_id: string
  version: number
}

interface ErrorWithCode extends Error {
  code?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default
      process.env.SUPABASE_URL ?? '',
      // Supabase API ANON KEY - env var exported by default
      process.env.SUPABASE_ANON_KEY ?? '',
      // Create client with Auth context of the user that called the function
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    )

    // Get the request body
    const requestBody = await req.json() as { brainDumpId: string }
    const { brainDumpId } = requestBody

    if (!brainDumpId) {
      return new Response(
        JSON.stringify({ error: 'Brain dump ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get the brain dump from the database
    const { data: brainDump, error: brainDumpError } = await supabaseClient
      .from('brain_dumps')
      .select('*')
      .eq('id', brainDumpId)
      .single()

    if (brainDumpError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch brain dump', details: brainDumpError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Process the brain dump content (placeholder for AI processing)
    // In a real implementation, this would use AI to clean and organize the content
    const processContent = (content: string): string => {
      // For now, just clean up whitespace and return the content
      return content.trim()
    }
    
    const processedContent = processContent((brainDump as BrainDump).content)

    // Check if a master note already exists for this class
    const { data: existingMasterNote, error: masterNoteError } = await supabaseClient
      .from('master_notes')
      .select('*')
      .eq('class_id', (brainDump as BrainDump).class_id)
      .single()

    // Create or update the master note
    let masterNote: MasterNote | null = null
    const typedError = masterNoteError as ErrorWithCode
    
    if (typedError && typedError.code === 'PGRST116') {
      // Create a new master note if one doesn't exist
      const { data: newMasterNote, error: createError } = await supabaseClient
        .from('master_notes')
        .insert({
          class_id: (brainDump as BrainDump).class_id,
          content: `## ${(brainDump as BrainDump).title}\n${processedContent}`,
          last_contributor_id: (brainDump as BrainDump).contributor_id,
          version: 1
        })
        .select()

      if (createError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create master note', details: createError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      masterNote = newMasterNote?.[0] as MasterNote
    } else if (!masterNoteError) {
      // Update the existing master note
      // In a real implementation, this would intelligently merge the content
      const updatedContent = `${(existingMasterNote as MasterNote).content}\n\n## ${(brainDump as BrainDump).title}\n${processedContent}`
      
      const { data: updatedMasterNote, error: updateError } = await supabaseClient
        .from('master_notes')
        .update({
          content: updatedContent,
          last_updated: new Date().toISOString(),
          last_contributor_id: (brainDump as BrainDump).contributor_id,
          version: (existingMasterNote as MasterNote).version + 1
        })
        .eq('id', (existingMasterNote as MasterNote).id)
        .select()

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update master note', details: updateError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      masterNote = updatedMasterNote?.[0] as MasterNote
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch master note', details: masterNoteError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update the brain dump status to approved
    const { error: updateError } = await supabaseClient
      .from('brain_dumps')
      .update({ status: 'approved' })
      .eq('id', brainDumpId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update brain dump status', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Brain dump processed successfully',
        masterNote
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const typedError = error as Error
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: typedError.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}