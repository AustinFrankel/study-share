#!/usr/bin/env node

/**
 * Clear User Data Script
 * 
 * This script removes all user-generated content from the database while
 * preserving the core structure (schools, subjects, etc.)
 * 
 * WARNING: This will permanently delete all user data!
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
})

async function clearUserData() {
  console.log('🧹 Starting user data cleanup...')
  
  try {
    // 1. Clear user-generated content (in dependency order)
    console.log('📝 Clearing comments...')
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (commentsError) {
      console.warn('⚠️  Comments error:', commentsError.message)
    } else {
      console.log('✅ Comments cleared')
    }

    console.log('🗳️  Clearing votes...')
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (votesError) {
      console.warn('⚠️  Votes error:', votesError.message)
    } else {
      console.log('✅ Votes cleared')
    }

    console.log('🏷️  Clearing resource tags...')
    const { error: resourceTagsError } = await supabase
      .from('resource_tags')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (resourceTagsError) {
      console.warn('⚠️  Resource tags error:', resourceTagsError.message)
    } else {
      console.log('✅ Resource tags cleared')
    }

    console.log('🚩 Clearing flags...')
    const { error: flagsError } = await supabase
      .from('flags')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (flagsError) {
      console.warn('⚠️  Flags error:', flagsError.message)
    } else {
      console.log('✅ Flags cleared')
    }

    console.log('🤖 Clearing AI derivatives...')
    const { error: aiError } = await supabase
      .from('ai_derivatives')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (aiError) {
      console.warn('⚠️  AI derivatives error:', aiError.message)
    } else {
      console.log('✅ AI derivatives cleared')
    }

    console.log('📁 Clearing files...')
    const { error: filesError } = await supabase
      .from('files')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (filesError) {
      console.warn('⚠️  Files error:', filesError.message)
    } else {
      console.log('✅ Files cleared')
    }

    console.log('📚 Clearing resources...')
    const { error: resourcesError } = await supabase
      .from('resources')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (resourcesError) {
      console.warn('⚠️  Resources error:', resourcesError.message)
    } else {
      console.log('✅ Resources cleared')
    }

    console.log('👥 Clearing users...')
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (usersError) {
      console.warn('⚠️  Users error:', usersError.message)
    } else {
      console.log('✅ Users cleared')
    }

    console.log('🎯 Clearing points ledger...')
    const { error: pointsError } = await supabase
      .from('points_ledger')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (pointsError) {
      console.warn('⚠️  Points ledger error:', pointsError.message)
    } else {
      console.log('✅ Points ledger cleared')
    }

    console.log('👨‍🏫 Clearing teachers...')
    const { error: teachersError } = await supabase
      .from('teachers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (teachersError) {
      console.warn('⚠️  Teachers error:', teachersError.message)
    } else {
      console.log('✅ Teachers cleared')
    }

    console.log('📖 Clearing classes...')
    const { error: classesError } = await supabase
      .from('classes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (classesError) {
      console.warn('⚠️  Classes error:', classesError.message)
    } else {
      console.log('✅ Classes cleared')
    }

    // 2. Clear storage bucket (if accessible)
    console.log('🗂️  Clearing storage bucket...')
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('resources')
        .list('', { limit: 1000 })
      
      if (listError) {
        console.warn('⚠️  Could not list storage files:', listError.message)
      } else if (files && files.length > 0) {
        const filePaths = files.map(file => file.name)
        const { error: deleteError } = await supabase.storage
          .from('resources')
          .remove(filePaths)
        
        if (deleteError) {
          console.warn('⚠️  Storage deletion error:', deleteError.message)
        } else {
          console.log(`✅ Cleared ${files.length} files from storage`)
        }
      } else {
        console.log('✅ Storage bucket is already empty')
      }
    } catch (storageError) {
      console.warn('⚠️  Storage access error:', storageError.message)
    }

    console.log('')
    console.log('🎉 User data cleanup completed!')
    console.log('')
    console.log('📋 Summary of cleared data:')
    console.log('   • All user accounts')
    console.log('   • All uploaded resources')
    console.log('   • All file attachments')
    console.log('   • All comments and votes')
    console.log('   • All AI-generated content')
    console.log('   • All teachers and classes')
    console.log('   • All points and gamification data')
    console.log('   • All flags and tags')
    console.log('   • All storage files')
    console.log('')
    console.log('✅ The website is now clean of user-generated content!')
    console.log('   Core structure (schools, subjects) has been preserved.')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

// Run the cleanup
clearUserData()
