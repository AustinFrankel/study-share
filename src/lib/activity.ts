import { supabase } from './supabase'

export type ActivityAction = 'upload' | 'delete' | 'comment' | 'vote' | 'download' | 'edit' | 'upvote' | 'downvote' | 'rate'

interface LogActivityOptions {
  userId: string
  action: ActivityAction
  resourceId?: string
  resourceTitle?: string
  pointsChange?: number
  metadata?: Record<string, unknown>
}

export async function logActivity({
  userId,
  action,
  resourceId,
  resourceTitle,
  pointsChange = 0,
  metadata = {}
}: LogActivityOptions) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { isSupabaseConfigured } = require('./supabase')
    
    if (!isSupabaseConfigured) {
      console.log(`Activity logged (mock): ${action} by ${userId}`)
      return
    }

    const { error } = await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        action_type: action,
        resource_id: resourceId,
        resource_title: resourceTitle,
        points_change: pointsChange,
        metadata
      })

    if (error) {
      console.warn('Failed to log activity (non-critical):', error.message)
    } else {
      console.log(`Activity logged: ${action} by ${userId}`)
    }
  } catch (error) {
    console.warn('Error logging activity (non-critical):', error)
  }
}

export async function getUserActivity(userId: string, limit: number = 20) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { isSupabaseConfigured } = require('./supabase')
    
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - returning mock activity data')
      return [
        {
          id: 'mock-1',
          action_type: 'upload' as ActivityAction,
          resource_title: 'Sample Study Guide',
          created_at: new Date().toISOString(),
          points_change: 1,
          metadata: { type: 'study_guide' }
        },
        {
          id: 'mock-2',
          action_type: 'comment' as ActivityAction,
          resource_title: 'Practice Problems Set',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          points_change: 0,
          metadata: {}
        }
      ]
    }

    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Database error, falling back to mock data:', error.message)
      return [
        {
          id: 'fallback-1',
          action_type: 'upload' as ActivityAction,
          resource_title: 'Recent Upload',
          created_at: new Date().toISOString(),
          points_change: 1,
          metadata: { type: 'notes' }
        }
      ]
    }
    return data || []
  } catch (error) {
    console.error('Error fetching user activity:', error)
    // Return empty array instead of failing completely
    return []
  }
}

export function getActivityMessage(activity: {
  action_type: ActivityAction
  resource_title?: string
  metadata?: Record<string, unknown>
}): string {
  switch (activity.action_type) {
    case 'upload':
      return `Uploaded "${activity.resource_title}"`
    case 'delete':
      return `Deleted "${activity.resource_title}"`
    case 'edit':
      return `Edited "${activity.resource_title}"`
    case 'comment':
      const commentPreview = activity.metadata?.comment_preview as string
      return `Commented on "${activity.resource_title}"${commentPreview ? `: "${commentPreview}"` : ''}`
    case 'upvote':
      return `Upvoted "${activity.resource_title}"`
    case 'downvote':
      return `Downvoted "${activity.resource_title}"`
    case 'vote':
      const voteType = activity.metadata?.vote_value === 1 ? 'upvoted' : 'downvoted'
      return `${voteType.charAt(0).toUpperCase() + voteType.slice(1)} "${activity.resource_title}"`
    case 'download':
      return `Downloaded "${activity.resource_title}"`
    default:
      return 'Unknown activity'
  }
}

export function getActivityIcon(actionType: ActivityAction): string {
  switch (actionType) {
    case 'upload':
      return '📤'
    case 'delete':
      return '🗑️'
    case 'edit':
      return '✏️'
    case 'comment':
      return '💬'
    case 'upvote':
      return '👍'
    case 'downvote':
      return '👎'
    case 'vote':
      return '👍'
    case 'download':
      return '💾'
    default:
      return '📋'
  }
}
