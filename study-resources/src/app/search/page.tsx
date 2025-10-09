'use client'

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Resource } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { getUserViewedResources } from '@/lib/access-gate'
import Navigation from '@/components/Navigation'
import SearchBar from '@/components/SearchBar'
import FacetFilters from '@/components/FacetFilters'
import ResourceCard from '@/components/ResourceCard'
import TestCard from '@/components/TestCard'
import { Search as SearchIcon, Loader2, Calendar, Users as UsersIcon, UserPlus, UserX } from 'lucide-react'
import { STANDARDIZED_TESTS_2025, AP_EXAMS_2025 } from '@/lib/test-dates'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const RESULTS_PER_PAGE = 20

function SearchPageContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([])
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([])
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([])
  const [viewedResources, setViewedResources] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [matchingUsers, setMatchingUsers] = useState<Array<{ id: string; handle: string; avatar_url: string | null; total_points: number }>>([])
  const [followedUsers, setFollowedUsers] = useState<string[]>([])
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [followLoading, setFollowLoading] = useState<string | null>(null)

  // Get all tests and filter by search query
  const allTests = useMemo(() => {
    return [...STANDARDIZED_TESTS_2025, ...AP_EXAMS_2025].map(test => ({
      ...test,
      category: ('category' in test ? test.category : undefined) || (STANDARDIZED_TESTS_2025.includes(test as any) ? 'Standardized Test' : 'AP Exam')
    }))
  }, [])

  const matchingTests = useMemo(() => {
    if (!query.trim()) return []
    const searchLower = query.toLowerCase()
    return allTests.filter(test =>
      test.name.toLowerCase().includes(searchLower) ||
      test.fullName.toLowerCase().includes(searchLower) ||
      test.category?.toLowerCase().includes(searchLower)
    )
  }, [query, allTests])

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setMatchingUsers([])
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, handle, avatar_url, total_points')
          .ilike('handle', `%${query}%`)
          .order('total_points', { ascending: false })
          .limit(10)
        
        if (!error && data) {
          setMatchingUsers(data)
        }
      } catch (error) {
        console.error('Error searching users:', error)
      }
    }
    
    searchUsers()
  }, [query])

  // Fetch followed/blocked users
  useEffect(() => {
    const fetchUserRelationships = async () => {
      if (!user) return
      
      try {
        const [followsData, blocksData] = await Promise.all([
          supabase.from('user_follows').select('followed_id').eq('follower_id', user.id),
          supabase.from('user_blocks').select('blocked_id').eq('blocker_id', user.id)
        ])
        
        if (followsData.data) {
          setFollowedUsers(followsData.data.map((f: any) => f.followed_id))
        }
        if (blocksData.data) {
          setBlockedUsers(blocksData.data.map((b: any) => b.blocked_id))
        }
      } catch (error) {
        console.error('Error fetching user relationships:', error)
      }
    }
    
    fetchUserRelationships()
  }, [user])

  // Memoize search function to prevent recreation on every render
  const searchResources = useCallback(async (searchQuery: string, pageNum: number = 0) => {
    setLoading(true)
    try {
      let queryBuilder = supabase
        .from('resources')
        .select(`
          id,
          title,
          type,
          created_at,
          uploader_id,
          class_id,
          classes!inner(
            id,
            title,
            code,
            school_id,
            subject_id,
            teacher_id,
            schools(id, name),
            subjects(id, name),
            teachers(id, name)
          ),
          uploader:users(id, handle, avatar_url),
          ai_derivatives(status),
          files(id, mime, original_filename, path, storage_path)
        `, { count: 'exact' })

      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim()
        queryBuilder = queryBuilder.or(`title.ilike.%${searchTerm}%`)
      }

      const { data, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(pageNum * RESULTS_PER_PAGE, (pageNum + 1) * RESULTS_PER_PAGE - 1)

      if (error) {
        console.error('Supabase query error:', error.message || 'Unknown error', error)
        setResources([])
        setHasMore(false)
        setLoading(false)
        return
      }

      const transformedData = (data || []).map((resource: any) => ({
        ...resource,
        class: resource.classes,
        uploader: resource.uploader || resource.users,
        ai_derivative: Array.isArray(resource.ai_derivatives) ? resource.ai_derivatives[0] : resource.ai_derivatives || null
      }))

      if (pageNum === 0) {
        setResources(transformedData)
      } else {
        setResources(prev => [...prev, ...transformedData])
      }

      setHasMore((count || 0) > (pageNum + 1) * RESULTS_PER_PAGE)
    } catch (error) {
      console.error('Error searching resources:', error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(0)
    if (query) {
      searchResources(query, 0)
    } else {
      setLoading(false)
      setResources([])
    }
  }, [query, searchResources])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    if (user) {
      fetchViewedResources()
    }
  }, [user])

  const fetchViewedResources = async () => {
    if (!user) return
    try {
      const viewed = await getUserViewedResources(user.id)
      setViewedResources(viewed)
    } catch (error) {
      console.error('Error fetching viewed resources:', error)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [schoolsRes, subjectsRes, teachersRes] = await Promise.all([
        supabase.from('schools').select('id, name').order('name').limit(100),
        supabase.from('subjects').select('id, name').order('name').limit(100),
        supabase.from('teachers').select('id, name').order('name').limit(100)
      ])

      setSchools(schoolsRes.data || [])
      setSubjects(subjectsRes.data || [])
      setTeachers(teachersRes.data || [])
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleVote = async (resourceId: string, value: 1 | -1) => {
    if (!user) return

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('resource_id', resourceId)
        .eq('voter_id', user.id)
        .single()

      if (existingVote) {
        if (existingVote.value === value) {
          // Remove vote if clicking same button
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          // Update vote if clicking different button
          await supabase
            .from('votes')
            .update({ value })
            .eq('id', existingVote.id)
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            resource_id: resourceId,
            voter_id: user.id,
            value
          })
      }

      // Log voting activity (best-effort, don't block on errors)
      const resource = resources.find(r => r.id === resourceId)
      if (resource) {
        const { logActivity } = await import('@/lib/activity')
        try {
          await logActivity({
            userId: user.id,
            action: value === 1 ? 'upvote' : 'downvote',
            resourceId: resourceId,
            resourceTitle: resource.title,
            pointsChange: 0,
            metadata: { vote_value: value }
          })
        } catch (activityError) {
          console.warn('Failed to log voting activity:', activityError)
        }
      }

      // Refresh current page
      searchResources(query, 0)
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleFollowUser = async (targetUserId: string) => {
    if (!user) return
    
    setFollowLoading(targetUserId)
    try {
      const isFollowing = followedUsers.includes(targetUserId)
      
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', targetUserId)
        
        setFollowedUsers(prev => prev.filter(id => id !== targetUserId))
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            followed_id: targetUserId
          })
        
        setFollowedUsers(prev => [...prev, targetUserId])
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
    } finally {
      setFollowLoading(null)
    }
  }

  const handleBlockUser = async (targetUserId: string) => {
    if (!user) return
    
    setFollowLoading(targetUserId)
    try {
      const isBlocked = blockedUsers.includes(targetUserId)
      
      if (isBlocked) {
        // Unblock
        await supabase
          .from('user_blocks')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetUserId)
        
        setBlockedUsers(prev => prev.filter(id => id !== targetUserId))
      } else {
        // Block (also remove follow if exists)
        await Promise.all([
          supabase
            .from('user_blocks')
            .insert({
              blocker_id: user.id,
              blocked_id: targetUserId
            }),
          supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('followed_id', targetUserId)
        ])
        
        setBlockedUsers(prev => [...prev, targetUserId])
        setFollowedUsers(prev => prev.filter(id => id !== targetUserId))
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error)
    } finally {
      setFollowLoading(null)
    }
  }

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      searchResources(query, nextPage)
    }
  }, [loading, hasMore, page, query, searchResources])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
          <SearchBar className="max-w-4xl" />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FacetFilters
            schools={schools}
            subjects={subjects}
            teachers={teachers}
          />
        </div>

        {/* Results */}
        {query ? (
          <div>
            <div className="mb-6">
              <p className="text-gray-600">
                {loading && page === 0 ? 'Searching...' : `${matchingTests.length + matchingUsers.length + resources.length} results for "${query}"`}
              </p>
            </div>

            {loading && page === 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (matchingTests.length > 0 || matchingUsers.length > 0 || resources.length > 0) ? (
              <>
                {/* Users Section */}
                {matchingUsers.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <UsersIcon className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-xl font-bold text-gray-900">Users</h2>
                      <span className="text-sm text-gray-500">({matchingUsers.length})</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {matchingUsers.filter(u => !blockedUsers.includes(u.id) && u.id !== user?.id).map((matchedUser) => (
                        <div key={matchedUser.id} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-indigo-300 transition-all">
                          <Link href={`/profile?user=${matchedUser.handle}`} className="flex items-center gap-3 mb-3">
                            <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                              {matchedUser.avatar_url && <AvatarImage src={matchedUser.avatar_url} alt={`${matchedUser.handle} profile picture`} />}
                              <AvatarFallback className="text-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                {matchedUser.handle.split('-').map(w => w[0]).join('').toUpperCase().slice(0,2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{matchedUser.handle}</p>
                              <p className="text-sm text-gray-600">{matchedUser.total_points.toLocaleString()} points</p>
                            </div>
                          </Link>
                          {user && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={followedUsers.includes(matchedUser.id) ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => handleFollowUser(matchedUser.id)}
                                disabled={followLoading === matchedUser.id}
                              >
                                {followLoading === matchedUser.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    {followedUsers.includes(matchedUser.id) ? 'Following' : 'Follow'}
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleBlockUser(matchedUser.id)}
                                disabled={followLoading === matchedUser.id}
                              >
                                {followLoading === matchedUser.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserX className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Tests Section */}
                {matchingTests.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-xl font-bold text-gray-900">Live Tests</h2>
                      <span className="text-sm text-gray-500">({matchingTests.length})</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {matchingTests.map((test) => (
                        <TestCard key={test.id} test={test} compact />
                      ))}
                    </div>
                  </div>
                )}

                {/* Study Resources Section */}
                {resources.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <SearchIcon className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-xl font-bold text-gray-900">Study Resources</h2>
                      <span className="text-sm text-gray-500">({resources.length})</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {resources.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          onVote={handleVote}
                          blurredPreview={!user || (user?.id !== resource.uploader?.id && !viewedResources.includes(resource.id))}
                          hasBeenViewed={!!user && viewedResources.includes(resource.id)}
                        />
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={loadMore}
                          disabled={loading}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </div>
                          ) : (
                            'Load More'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600">Enter a search term to find resources</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </main>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
