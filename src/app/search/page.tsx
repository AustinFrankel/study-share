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
import { Search as SearchIcon, Loader2 } from 'lucide-react'

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

  // Memoize search function to prevent recreation on every render
  const searchResources = useCallback(async (searchQuery: string, pageNum: number = 0) => {
    setLoading(true)
    try {
      // Use PostgreSQL full-text search for better performance
      // Only select necessary columns to reduce data transfer
      let queryBuilder = supabase
        .from('resources')
        .select(`
          id,
          title,
          type,
          created_at,
          vote_count,
          user_vote,
          average_rating,
          rating_count,
          difficulty,
          study_time,
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
          users!uploader_id(id, handle, avatar_url),
          ai_derivatives(status),
          files(id, mime)
        `, { count: 'exact' })

      // Use PostgreSQL text search instead of client-side filtering
      if (searchQuery.trim()) {
        // Search across title field - can't search nested fields with OR in Supabase
        queryBuilder = queryBuilder.ilike('title', `%${searchQuery}%`)
      }

      const { data, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(pageNum * RESULTS_PER_PAGE, (pageNum + 1) * RESULTS_PER_PAGE - 1)

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      // Transform data to match expected Resource interface
      const transformedData = (data || []).map((resource: any) => ({
        ...resource,
        class: resource.classes,
        uploader: resource.users,
        ai_derivative: resource.ai_derivatives?.[0] || null
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

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      searchResources(query, nextPage)
    }
  }, [loading, hasMore, page, query, searchResources])

  return (
    <div className="min-h-screen bg-gray-50">
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
                {loading && page === 0 ? 'Searching...' : `${resources.length} results for "${query}"`}
              </p>
            </div>

            {loading && page === 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : resources.length > 0 ? (
              <>
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
      <div className="min-h-screen bg-gray-50">
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
