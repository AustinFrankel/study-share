'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, Medal, Award, Crown, TrendingUp, Calendar, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { getLeaderboard } from '@/lib/gamification'

interface LeaderboardEntry {
  rank: number
  userId: string
  handle: string
  points: number
}

interface LeaderboardProps {
  schoolId?: string
  className?: string
}

export default function Leaderboard({ schoolId, className }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all')
  const [scope, setScope] = useState<'global' | 'school'>(schoolId ? 'school' : 'global')
  const [showAll, setShowAll] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(10)

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
      setEntries(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
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

      <CardContent className="space-y-4">
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

                {/* Avatar */}
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-gray-100">
                    {getInitials(entry.handle)}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-medium truncate">
                    {entry.handle}
                  </div>
                  <div className="text-xs text-gray-500">
                    Rank #{entry.rank}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="font-semibold text-sm">
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    points
                  </div>
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
