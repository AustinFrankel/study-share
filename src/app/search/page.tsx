'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Resource } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { getUserViewedResources } from '@/lib/access-gate'
import { createSmartSearchQuery, scoreRelevance } from '@/lib/fuzzy-search'
import Navigation from '@/components/Navigation'
import SearchBar from '@/components/SearchBar'
import FacetFilters from '@/components/FacetFilters'
import ResourceCard from '@/components/ResourceCard'
import { Search as SearchIcon, Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

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

  useEffect(() => {
    if (query) {
      searchResources(query)
    } else {
      setLoading(false)
    }
    fetchFilterOptions()
  }, [query])

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

  const searchResources = async (searchQuery: string) => {
    setLoading(true)
    try {
      // Enhanced search with fuzzy matching and relevance scoring
      const enhancedQuery = createSmartSearchQuery(searchQuery)
      
      // Get all resources for smart matching (in production, you'd use PostgreSQL full-text search)
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          class:classes(
            *,
            school:schools(*),
            subject:subjects(*),
            teacher:teachers(*)
          ),
          uploader:users(*),
          ai_derivative:ai_derivatives(*),
          files(*),
          tags:resource_tags(tag:tags(*))
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to flatten tags
      let transformedData = data?.map(resource => ({
        ...resource,
        tags: resource.tags?.map((rt: { tag: { name: string } }) => rt.tag) || []
      })) || []

      // Apply smart search filtering and scoring
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase()
        const enhancedQueryLower = enhancedQuery.toLowerCase()
        
        transformedData = transformedData
          .filter(resource => {
            // Check various fields for matches (including fuzzy)
            const titleMatch = resource.title?.toLowerCase().includes(queryLower) ||
                              resource.title?.toLowerCase().includes(enhancedQueryLower)
            
            const classMatch = resource.class?.title?.toLowerCase().includes(queryLower) ||
                              resource.class?.code?.toLowerCase().includes(queryLower) ||
                              resource.class?.title?.toLowerCase().includes(enhancedQueryLower)
            
            const subjectMatch = resource.class?.subject?.name?.toLowerCase().includes(queryLower) ||
                               resource.class?.subject?.name?.toLowerCase().includes(enhancedQueryLower)
            
            const schoolMatch = resource.class?.school?.name?.toLowerCase().includes(queryLower) ||
                              resource.class?.school?.name?.toLowerCase().includes(enhancedQueryLower)
                              
            const teacherMatch = resource.class?.teacher?.name?.toLowerCase().includes(queryLower) ||
                               resource.class?.teacher?.name?.toLowerCase().includes(enhancedQueryLower)
            
            // Fuzzy matching for common typos
            const fuzzyMatches = [
              resource.title,
              resource.class?.title,
              resource.class?.subject?.name,
              resource.class?.school?.name,
              resource.class?.teacher?.name
            ].some(field => {
              if (!field) return false
              // Simple fuzzy matching - check if query is close to field
              const fieldLower = field.toLowerCase()
              const words = queryLower.split(/\s+/)
              return words.some(word => {
                if (word.length < 3) return false
                // Check for partial matches and common typos
                for (let i = 0; i <= fieldLower.length - word.length; i++) {
                  const substr = fieldLower.substr(i, word.length)
                  const distance = levenshteinDistance(word, substr)
                  if (distance <= Math.max(1, Math.floor(word.length * 0.2))) {
                    return true
                  }
                }
                return false
              })
            })
            
            return titleMatch || classMatch || subjectMatch || schoolMatch || teacherMatch || fuzzyMatches
          })
          .map(resource => ({
            ...resource,
            relevanceScore: scoreRelevance(searchQuery, resource)
          }))
          .sort((a, b) => (b as Resource & { relevanceScore: number }).relevanceScore - (a as Resource & { relevanceScore: number }).relevanceScore)
      }

      setResources(transformedData)
    } catch (error) {
      console.error('Error searching resources:', error)
      // Fallback to simple search if fuzzy search fails
      try {
        const { data, error } = await supabase
          .from('resources')
          .select(`
            *,
            class:classes(
              *,
              school:schools(*),
              subject:subjects(*),
              teacher:teachers(*)
            ),
            uploader:users(*),
            ai_derivative:ai_derivatives(*),
            files(*),
            tags:resource_tags(tag:tags(*))
          `)
          .or(`title.ilike.%${searchQuery}%,classes.title.ilike.%${searchQuery}%,classes.code.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })

        if (error) throw error

        const transformedData = data?.map(resource => ({
          ...resource,
          tags: resource.tags?.map((rt: { tag: { name: string } }) => rt.tag) || []
        })) || []

        setResources(transformedData)
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  // Helper function for Levenshtein distance
  function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  const fetchFilterOptions = async () => {
    try {
      const [schoolsRes, subjectsRes, teachersRes] = await Promise.all([
        supabase.from('schools').select('id, name').order('name'),
        supabase.from('subjects').select('id, name').order('name'),
        supabase.from('teachers').select('id, name').order('name')
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

      // Log voting activity
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

      // Refresh search results to show updated vote count
      if (query) {
        searchResources(query)
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

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
                {loading ? 'Searching...' : `${resources.length} results for "${query}"`}
              </p>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : resources.length > 0 ? (
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
