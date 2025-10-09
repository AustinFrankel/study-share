import { supabase } from './supabase'
import { BrainDump, MasterNote } from './types'

/**
 * Fetches brain dumps for a specific class
 */
export async function fetchBrainDumps(classId: string) {
  const { data, error } = await supabase
    .from('brain_dumps')
    .select('*, contributor:users(*), class:classes(*)')
    .eq('class_id', classId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as BrainDump[]
}

/**
 * Fetches the master note for a specific class
 */
export async function fetchMasterNote(classId: string) {
  const { data, error } = await supabase
    .from('master_notes')
    .select('*, last_contributor:users(*), class:classes(*)')
    .eq('class_id', classId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "No rows returned" error
  return data as MasterNote | null
}

/**
 * Submits a new brain dump
 */
export async function submitBrainDump(brainDump: {
  class_id: string
  title: string
  content: string
  contributor_id: string
}) {
  const { data, error } = await supabase
    .from('brain_dumps')
    .insert([{
      ...brainDump,
      status: 'pending'
    }])
    .select()

  if (error) throw error
  
  // Trigger the edge function to process the brain dump
  // This would be implemented in a production environment
  // processBrainDump(data[0].id)
  
  return { brainDump: data[0] as BrainDump }
}

/**
 * Processes a brain dump (to be called by the edge function)
 */
export async function processBrainDump(brainDumpId: string) {
  try {
    // In a production environment, this would call the Supabase Edge Function
    const { data, error: invokeError } = await supabase.functions.invoke('process-brain-dump', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: { brainDumpId }
    })

    if (invokeError) throw invokeError
    return data
  } catch (error) {
    console.error('Error processing brain dump:', error)
    // For development purposes, simulate successful processing
    // This allows the feature to work even without the Edge Function deployed
    const { data, error: updateError } = await supabase
      .from('brain_dumps')
      .update({ status: 'approved' })
      .eq('id', brainDumpId)
      .select()

    if (updateError) throw updateError
    
    // Get the brain dump details
    const { data: brainDump, error: brainDumpError } = await supabase
      .from('brain_dumps')
      .select('*')
      .eq('id', brainDumpId)
      .single()

    if (brainDumpError) throw brainDumpError

    // Check if a master note already exists
    const { data: existingMasterNote, error: masterNoteError } = await supabase
      .from('master_notes')
      .select('*')
      .eq('class_id', brainDump.class_id)
      .single()

    // Create or update master note
    if (masterNoteError && masterNoteError.code === 'PGRST116') {
      // Create new master note if it doesn't exist
      const { data: newMasterNote, error: createError } = await supabase
        .from('master_notes')
        .insert({
          class_id: brainDump.class_id,
          content: `## ${brainDump.title}\n${brainDump.content}`,
          last_contributor_id: brainDump.contributor_id,
          version: 1
        })
        .select()

      if (createError) throw createError
      return { success: true, masterNote: newMasterNote[0] }
    } else if (!masterNoteError) {
      // Update existing master note
      const updatedContent = `${existingMasterNote.content}\n\n## ${brainDump.title}\n${brainDump.content}`
      
      const { data: updatedMasterNote, error: masterUpdateError } = await supabase
        .from('master_notes')
        .update({
          content: updatedContent,
          last_updated: new Date().toISOString(),
          last_contributor_id: brainDump.contributor_id,
          version: existingMasterNote.version + 1
        })
        .eq('id', existingMasterNote.id)
        .select()

      if (masterUpdateError) throw masterUpdateError
      return { success: true, masterNote: updatedMasterNote[0] }
    } else {
      throw masterNoteError
    }
  }
}