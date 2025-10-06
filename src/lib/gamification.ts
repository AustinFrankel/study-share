import { supabase } from './supabase'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  type: 'upload' | 'vote' | 'fix' | 'comment' | 'streak'
}

export interface UserStats {
  totalPoints: number
  uploadsCount: number
  netUpvotes: number
  acceptedFixes: number
  helpfulComments: number
  badges: Badge[]
  rank?: number
}

// Point values for different actions
export const POINTS = {
  UPLOAD: 1,
  NET_UPVOTE: 2,
  ACCEPTED_FIX: 3,
  HELPFUL_COMMENT: 1,
  DAILY_BONUS: 1
} as const

// Badge definitions
export const BADGES: Badge[] = [
  {
    id: 'starter-uploader',
    name: 'Starter Uploader',
    description: 'Upload your first resource',
    icon: '🌟',
    requirement: 1,
    type: 'upload'
  },
  {
    id: 'prolific-uploader',
    name: 'Prolific Uploader',
    description: 'Upload 10 resources',
    icon: '📚',
    requirement: 10,
    type: 'upload'
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Upload 25 resources',
    icon: '🏆',
    requirement: 25,
    type: 'upload'
  },
  {
    id: 'fixer',
    name: 'Fixer',
    description: 'Have 5 fixes accepted',
    icon: '🔧',
    requirement: 5,
    type: 'fix'
  },
  {
    id: 'crowd-verified',
    name: 'Crowd-Verified',
    description: 'Get 50 net upvotes across all resources',
    icon: '✅',
    requirement: 50,
    type: 'vote'
  },
  {
    id: 'community-helper',
    name: 'Community Helper',
    description: 'Write 25 helpful comments',
    icon: '💬',
    requirement: 25,
    type: 'comment'
  }
]

// Award points for an action
export async function awardPoints(
  userId: string, 
  action: keyof typeof POINTS, 
  context?: string
): Promise<void> {
  const points = POINTS[action]
  
  try {
    await supabase
      .from('points_ledger')
      .insert({
        user_id: userId,
        delta: points,
        reason: `${action.toLowerCase().replace('_', ' ')}${context ? ` - ${context}` : ''}`
      })
  } catch (error) {
    console.error('Error awarding points:', error)
  }
}

// Get user statistics
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Get total points
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', userId)
      .single()

    const totalPoints = pointsData?.total_points || 0

    // Get upload count
    const { count: uploadsCount } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('uploader_id', userId)

    // Get net upvotes across all user's resources
    let netUpvotes = 0
    try {
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('value, resource:resources!inner(uploader_id)')
        .eq('resource.uploader_id', userId)

      if (votesError) {
        console.warn('Error fetching votes data:', votesError.message)
      } else {
        netUpvotes = votesData?.reduce((sum, vote) => sum + vote.value, 0) || 0
      }
    } catch (error) {
      console.warn('Votes table might not exist yet:', error)
    }

    // Get accepted fixes count from points ledger
    let acceptedFixes = 0
    try {
      const { count, error: fixesError } = await supabase
        .from('points_ledger')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .or('reason.like.%fix%,reason.like.%accepted%')

      if (fixesError) {
        console.warn('Error fetching fixes data:', fixesError.message)
      } else {
        acceptedFixes = count || 0
      }
    } catch (error) {
      console.warn('Points ledger might not exist yet:', error)
    }

    // Get helpful comments count
    let helpfulComments = 0
    try {
      const { count, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (commentsError) {
        console.warn('Error fetching comments data:', commentsError.message)
      } else {
        helpfulComments = count || 0
      }
    } catch (error) {
      console.warn('Comments table might not exist yet:', error)
    }

    // Calculate earned badges
    const earnedBadges = BADGES.filter(badge => {
      switch (badge.type) {
        case 'upload':
          return (uploadsCount || 0) >= badge.requirement
        case 'vote':
          return netUpvotes >= badge.requirement
        case 'fix':
          return acceptedFixes >= badge.requirement
        case 'comment':
          return helpfulComments >= badge.requirement
        default:
          return false
      }
    })

    return {
      totalPoints,
      uploadsCount: uploadsCount || 0,
      netUpvotes,
      acceptedFixes,
      helpfulComments,
      badges: earnedBadges
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return {
      totalPoints: 0,
      uploadsCount: 0,
      netUpvotes: 0,
      acceptedFixes: 0,
      helpfulComments: 0,
      badges: []
    }
  }
}

// Get leaderboard data
export async function getLeaderboard(
  schoolId?: string,
  // timeframe is currently unused but reserved for future implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  timeframe: 'all' | 'week' | 'month' = 'all',
  limit: number = 10
) {
  try {
    const query = supabase
      .from('user_points')
      .select(
        `user_id, total_points, user:users(handle)`
      )
      .order('total_points', { ascending: false })
      .limit(limit)

    // For school-specific leaderboard, we'd need to join through resources
    // This is a simplified version
    const { data, error } = await query

    if (error) {
      // If tables don't exist yet, return empty array
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('Leaderboard tables not set up yet. Please run the migrations first.')
        return []
      }
      throw error
    }

    return (data as Array<{ user_id: string; total_points: number; user: { handle?: string } | Array<{ handle?: string }> }>)?.map((entry, index: number) => {
      const joinedUser = entry?.user
      const handle = Array.isArray(joinedUser)
        ? (joinedUser[0]?.handle || null)
        : joinedUser?.handle
      return {
        rank: index + 1,
        userId: entry.user_id,
        handle: handle || `user-${String(entry.user_id).slice(0, 4)}`,
        points: entry.total_points,
      }
    }) || []
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return []
  }
}

// Check for new badges after an action
export async function checkForNewBadges(userId: string): Promise<Badge[]> {
  const stats = await getUserStats(userId)
  // currentBadgeIds is reserved for future implementation to track which badges are new
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentBadgeIds = stats.badges.map(b => b.id)

  // This would typically be stored in the database to avoid re-checking
  // For now, we return newly earned badges
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return stats.badges.filter((badge, index) => {
    // Simple logic to detect "new" badges
    // In production, you'd track which badges have been awarded
    return true
  })
}

// Calculate user rank globally
export async function getUserRank(userId: string): Promise<number> {
  try {
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', userId)
      .single()

    if (!userPoints) return 0

    const { count } = await supabase
      .from('user_points')
      .select('*', { count: 'exact', head: true })
      .gt('total_points', userPoints.total_points)

    return (count || 0) + 1
  } catch (error) {
    console.error('Error getting user rank:', error)
    return 0
  }
}
