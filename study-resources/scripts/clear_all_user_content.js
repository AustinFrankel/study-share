#!/usr/bin/env node

// This script deletes ALL user-generated content from the database
// WARNING: This is destructive and cannot be undone!
// It keeps the users table but deletes everything else.

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearAllUserContent() {
  console.log('🚨 WARNING: This will delete ALL user-generated content!')
  console.log('Starting deletion in 3 seconds... Press Ctrl+C to cancel')

  await new Promise(resolve => setTimeout(resolve, 3000))

  try {
    console.log('🗑️ Deleting user-generated content...')

    // Delete in reverse dependency order to avoid FK constraints

    // Activity and points (depend on users/resources)
    console.log('Deleting activity_log...')
    await supabase.from('activity_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting points_ledger...')
    await supabase.from('points_ledger').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting user_points...')
    await supabase.from('user_points').delete().neq('user_id', '00000000-0000-0000-0000-000000000000')

    // Notifications
    console.log('Deleting notifications...')
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Brain dump and master notes
    console.log('Deleting brain_dump...')
    await supabase.from('brain_dump').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting master_notes...')
    await supabase.from('master_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Comments and related (depend on resources)
    console.log('Deleting comment_votes...')
    await supabase.from('comment_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting comments...')
    await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Resource-related tables
    console.log('Deleting resource_ratings...')
    await supabase.from('resource_ratings').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting resource_tags...')
    await supabase.from('resource_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting flags...')
    await supabase.from('flags').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting votes...')
    await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting ai_derivatives...')
    await supabase.from('ai_derivatives').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Files (depend on resources)
    console.log('Deleting files...')
    await supabase.from('files').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Resources
    console.log('Deleting resources...')
    await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Classes, teachers, schools (user-generated)
    console.log('Deleting classes...')
    await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting teachers...')
    await supabase.from('teachers').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('Deleting schools...')
    await supabase.from('schools').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Tags (might be user-generated)
    console.log('Deleting tags...')
    await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Storage cleanup - delete all files from resources and avatars buckets
    console.log('Cleaning up storage buckets...')
    try {
      // Get all files from resources bucket
      const { data: resourceFiles } = await supabase.storage.from('resources').list('', { limit: 1000 })
      if (resourceFiles && resourceFiles.length > 0) {
        const paths = resourceFiles.map(f => f.name)
        await supabase.storage.from('resources').remove(paths)
      }

      // Get all files from avatars bucket
      const { data: avatarFiles } = await supabase.storage.from('avatars').list('', { limit: 1000 })
      if (avatarFiles && avatarFiles.length > 0) {
        const paths = avatarFiles.map(f => f.name)
        await supabase.storage.from('avatars').remove(paths)
      }
    } catch (storageError) {
      console.warn('Storage cleanup failed (non-critical):', storageError.message)
    }

    // Clear avatar URLs from users (but keep users)
    console.log('Clearing avatar URLs from users...')
    await supabase.from('users').update({ avatar_url: null }).neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('✅ All user-generated content has been deleted!')
    console.log('Users table preserved, but avatars cleared.')

  } catch (error) {
    console.error('❌ Error deleting content:', error)
    process.exit(1)
  }
}

// Run the script
clearAllUserContent()
