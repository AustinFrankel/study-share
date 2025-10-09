'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, Crown, TrendingUp, Calendar, Globe, ChevronDown, ChevronUp, Loader2, UserPlus, UserMinus } from 'lucide-react'
import { getLeaderboard } from '@/lib/gamification'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface LeaderboardEntry {
  rank: number
  userId: string
  handle: string
  points: number
  avatar_url?: string
}

interface LeaderboardProps {
  schoolId?: string
  className?: string
  hideTitle?: boolean
}

export default function Leaderboard({ schoolId, className, hideTitle = false }: LeaderboardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all')
  const [scope, setScope] = useState<'global' | 'school'>(schoolId ? 'school' : 'global')
  const [showAll, setShowAll] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(10)
  const [followedUsers, setFollowedUsers] = useState<string[]>([])
  const [followLoading, setFollowLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe, scope, schoolId, showAll, displayLimit])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await getLeaderboard(
        scope === 'school' ? schoolId : undefined,
        timeframe,
        showAll ? 50 : displayLimit // Fetch more when showing all
      )
      setEntries(data as LeaderboardEntry[])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load followed users for current user
  useEffect(() => {
    const loadFollows = async () => {
      if (!user || !isSupabaseConfigured) {
        setFollowedUsers([])
        return
      }
      try {
        const { data, error } = await supabase
          .from('user_follows')
          .select('followed_id')
          .eq('follower_id', user.id)

        if (!error) {
          setFollowedUsers((data || []).map(r => r.followed_id))
        }
      } catch {}
    }
    loadFollows()
  }, [user])

  const toggleFollow = async (targetUserId: string) => {
    if (!user) {
      router.push('/profile')
      return
    }
    if (!isSupabaseConfigured) return
    if (user.id === targetUserId) return

    setFollowLoading(targetUserId)
    try {
      const isFollowing = followedUsers.includes(targetUserId)
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', targetUserId)
        setFollowedUsers(prev => prev.filter(id => id !== targetUserId))
      } else {
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, followed_id: targetUserId })
        setFollowedUsers(prev => [...prev, targetUserId])
      }
    } finally {
      setFollowLoading(null)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-slate-500" />
      case 3:
        return <Award className="w-5 h-5 text-amber-700" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>
    }
  }

  const getInitials = (handle: string) => {
    return handle.split('-').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week':
        return 'This Week'
      case 'month':
        return 'This Month'
      default:
        return 'All Time'
    }
  }

  const toggleShowAll = () => {
    setShowAll(!showAll)
  }

  const displayedEntries = showAll ? entries : entries.slice(0, displayLimit)

  return (
    <Card className={className}>
      {!hideTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              {scope === 'global' ? (
                <Globe className="w-3 h-3" />
              ) : (
                <TrendingUp className="w-3 h-3" />
              )}
              {scope === 'global' ? 'Global' : 'School'}
            </Badge>
          </div>
        </CardHeader>
      )}

      <CardContent className={`space-y-4 ${hideTitle ? 'pt-0' : ''}`}>
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            <Button
              variant={timeframe === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('all')}
            >
              All Time
            </Button>
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('week')}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Week
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('month')}
            >
              Month
            </Button>
          </div>

          {schoolId && (
            <div className="flex gap-1">
              <Button
                variant={scope === 'global' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScope('global')}
              >
                <Globe className="w-3 h-3 mr-1" />
                Global
              </Button>
              <Button
                variant={scope === 'school' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScope('school')}
              >
                School
              </Button>
            </div>
          )}
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-1">
            {displayedEntries.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  entry.rank === 1 
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300' 
                    : entry.rank === 2
                    ? 'bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-300'
                    : entry.rank === 3
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300'
                    : entry.rank <= 5
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar (clickable) */}
                <Link href={`/profile?user=${entry.handle}`} className="shrink-0">
                  <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-indigo-300 transition-all">
                    {entry.avatar_url && <AvatarImage src={entry.avatar_url} alt={entry.handle} />}
                    <AvatarFallback className="text-xs bg-gray-100">
                      {getInitials(entry.handle)}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* User Info (clickable) */}
                <div className="flex-1 min-w-0">
                  <Link href={`/profile?user=${entry.handle}`} className="font-mono text-sm font-medium truncate hover:underline">
                    {entry.handle}
                  </Link>
                  <div className="text-xs text-gray-500">Rank #{entry.rank}</div>
                </div>

                {/* Points + Follow button */}
                <div className="flex items-center gap-2">
                  <div className="text-right mr-1">
                    <div className="font-semibold text-sm">
                      {entry.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                  {user && user.id !== entry.userId && (
                    <Button
                      size="sm"
                      variant={followedUsers.includes(entry.userId) ? 'default' : 'outline'}
                      onClick={() => toggleFollow(entry.userId)}
                      disabled={followLoading === entry.userId}
                      className="whitespace-nowrap"
                      title={followedUsers.includes(entry.userId) ? 'Unfollow' : 'Follow'}
                    >
                      {followLoading === entry.userId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : followedUsers.includes(entry.userId) ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {/* View More/Less Button */}
            {entries.length > displayLimit && (
              <div className="pt-3 text-center border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleShowAll}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      View All ({entries.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm">No data available for {getTimeframeLabel()}</p>
          </div>
        )}

        {/* Footer */}
        {entries.length > 0 && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Showing {showAll ? entries.length : Math.min(displayLimit, entries.length)} of {entries.length} contributors • {getTimeframeLabel()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
