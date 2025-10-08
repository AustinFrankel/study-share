'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Resource } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { getUserViewedResources } from '@/lib/access-gate'
import Navigation from '@/components/Navigation'
import SearchBar from '@/components/SearchBar'
import FacetFilters from '@/components/FacetFilters'
import ResourceCard from '@/components/ResourceCard'
import TestCard from '@/components/TestCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid, List, TrendingUp, Clock, Loader2, Calendar } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { STANDARDIZED_TESTS_2025, AP_EXAMS_2025 } from '@/lib/test-dates'

function BrowseContent() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest')
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([])
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([])
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string; school_id?: string }>>([])
  const [viewedResources, setViewedResources] = useState<string[]>([])
  const searchParams = useSearchParams()

  // NEW: Pagination state for Browse ("page shuffler")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResources, setTotalResources] = useState(0)
  const resourcesPerPage = 12

  // Get upcoming and recent tests to show in browse
  const featuredTests = useMemo(() => {
    const allTests = [...STANDARDIZED_TESTS_2025, ...AP_EXAMS_2025].map(test => ({
      ...test,
      category: ('category' in test ? test.category : undefined) || (STANDARDIZED_TESTS_2025.includes(test as any) ? 'Standardized Test' : 'AP Exam')
    }))

    const now = new Date().getTime()
    // Show tests within next 60 days or past 7 days
    return allTests.filter(test => {
      const timeDiff = test.date.getTime() - now
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
      return daysDiff >= -7 && daysDiff <= 60
    }).sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6)
  }, [])

  useEffect(() => {
    fetchResources()
    fetchFilterOptions()
  }, [searchParams, sortBy, currentPage])

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchParams, sortBy])

  useEffect(() => {
    if (user) {
      fetchViewedResources()
    }
  }, [user])

  // Force refresh when coming from upload (refresh param in URL)
  useEffect(() => {
    const refresh = searchParams.get('refresh')
    if (refresh) {
      console.log('🔄 Forcing browse page refresh due to new upload')
      fetchResources()
    }
  }, [searchParams.get('refresh')])

  const fetchViewedResources = async () => {
    if (!user) return
    try {
      const viewed = await getUserViewedResources(user.id)
      setViewedResources(viewed)
    } catch (error) {
      console.error('Error fetching viewed resources:', error)
    }
  }

  const applyFilters = (query: any) => {
    let q = query
    const school = searchParams.get('school')
    if (school) q = q.eq('classes.school_id', school)
    const subject = searchParams.get('subject')
    if (subject) q = q.eq('classes.subject_id', subject)
    const teacher = searchParams.get('teacher')
    if (teacher) q = q.eq('classes.teacher_id', teacher)
    const type = searchParams.get('type')
    if (type) q = q.eq('type', type)
    return q
  }

  const fetchResources = async () => {
    try {
      setLoading(true)

      // Calculate offset for pagination
      const offset = (currentPage - 1) * resourcesPerPage

      // Count query with filters
      let countQuery = supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })

      // Apply same filters for count
      countQuery = applyFilters(countQuery)

      // Sorting doesn't affect count
      const { count } = await countQuery
      setTotalResources(count || 0)

      // Primary data query with relations
      let dataQuery = supabase
        .from('resources')
        .select(`
          *,
          classes (
            id,
            title,
            code,
            schools (name),
            subjects (name),
            teachers (name)
          ),
          uploader:users(*),
          ai_derivatives (status),
          tags:resource_tags (
            tag:tags (name)
          ),
          files(id, mime, original_filename)
        `)

      // Apply filters
      dataQuery = applyFilters(dataQuery)

      // Apply sorting
      if (sortBy === 'popular') {
        dataQuery = dataQuery.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
      } else {
        dataQuery = dataQuery.order('created_at', { ascending: false })
      }

      // Apply range for pagination
      dataQuery = dataQuery.range(offset, offset + resourcesPerPage - 1)

      const { data, error } = await dataQuery
      if (error) throw error

      const transformedData = data?.map((resource: any) => ({
        ...resource,
        tags: resource.tags?.map((rt: { tag: { name: string } }) => rt.tag) || []
      })) || []

      setResources(transformedData)
    } catch (error) {
      console.error('Error fetching resources:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [schoolsRes, subjectsRes, teachersRes] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('teachers').select('id, name, school_id').order('name')
      ])

      setSchools((schoolsRes.data && schoolsRes.data.length > 0) ? schoolsRes.data : [
        { id: 'demo-ucb', name: 'University of California, Berkeley' },
        { id: 'demo-stanford', name: 'Stanford University' },
        { id: 'demo-mit', name: 'MIT' },
      ])
      setSubjects((subjectsRes.data && subjectsRes.data.length > 0) ? subjectsRes.data : [
        { id: 'sub-math', name: 'Mathematics' },
        { id: 'sub-cs', name: 'Computer Science' },
        { id: 'sub-phys', name: 'Physics' },
      ])
      setTeachers((teachersRes.data && teachersRes.data.length > 0) ? teachersRes.data : [
        { id: 't-1', name: 'Dr. Sarah Johnson', school_id: 'demo-ucb' },
        { id: 't-2', name: 'Prof. Michael Chen', school_id: 'demo-stanford' },
      ])
    } catch (error) {
      console.error('Error fetching filter options:', error)
      setSchools([
        { id: 'demo-ucb', name: 'University of California, Berkeley' },
        { id: 'demo-stanford', name: 'Stanford University' },
        { id: 'demo-mit', name: 'MIT' },
      ])
      setSubjects([
        { id: 'sub-math', name: 'Mathematics' },
        { id: 'sub-cs', name: 'Computer Science' },
        { id: 'sub-phys', name: 'Physics' },
      ])
      setTeachers([
        { id: 't-1', name: 'Dr. Sarah Johnson', school_id: 'demo-ucb' },
        { id: 't-2', name: 'Prof. Michael Chen', school_id: 'demo-stanford' },
      ])
    }
  }

  const handleVote = async (resourceId: string, value: number) => {
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

      // Refresh resources to show updated vote count
      fetchResources()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleDelete = async (resourceId: string) => {
    if (!user) return
    
    const resourceToDelete = resources.find(r => r.id === resourceId)
    if (!resourceToDelete) return
    
    if (!confirm(`Are you sure you want to delete "${resourceToDelete.title}"?`)) {
      return
    }

    try {
      // Delete the resource
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('uploader_id', user.id)

      if (error) throw error

      // Update local state immediately
      setResources(prev => prev.filter(r => r.id !== resourceId))
      
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Browse Resources</h1>
          <p className="text-gray-600 mb-5">
            Discover study materials from students across different schools and classes
          </p>
          
          <SearchBar />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FacetFilters 
            schools={schools}
            subjects={subjects}
            teachers={teachers}
          />
        </div>

        {/* View Controls and Sorting */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${totalResources} resources found`}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: 'newest' | 'popular') => setSortBy(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Latest</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Popular</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Tests Section */}
        {featuredTests.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Upcoming & Recent Tests</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-2">
              {featuredTests.map((test) => (
                <TestCard key={test.id} test={test} compact />
              ))}
            </div>
            <div className="text-center mt-4">
              <Button asChild variant="outline">
                <a href="/live">View All Tests →</a>
              </Button>
            </div>
          </div>
        )}

        {/* Resources Grid/List */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Study Resources</h2>
        </div>
        {loading ? (
          <div className={`${viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-1 gap-6'}`}>
            {[...Array(resourcesPerPage)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : resources.length > 0 ? (
          <>
            <div className={`${viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-1 gap-6'}`}>
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onVote={handleVote}
                  onDelete={handleDelete}
                  compact={viewMode === 'list'}
                  blurredPreview={!user || (user?.id !== resource.uploader?.id && !viewedResources.includes(resource.id))}
                  hasBeenViewed={!!user && viewedResources.includes(resource.id)}
                  isHomepageCard={false}
                  showDeleteOption={true}
                  currentUserId={user?.id}
                />
              ))}
            </div>

            {/* Pagination (Page Shuffler) */}
            {totalResources > resourcesPerPage && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.ceil(totalResources / resourcesPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(totalResources / resourcesPerPage)
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1]
                      const showEllipsis = prevPage && page - prevPage > 1
                      
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                          <Button
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        </div>
                      )
                    })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalResources / resourcesPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(totalResources / resourcesPerPage)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No resources found</div>
            <p className="text-gray-400 mb-6">
              Be the first to upload study materials for your class!
            </p>
            <Button asChild size="sm">
              <a href="/upload">Upload Resource</a>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Browse() {
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
      <BrowseContent />
    </Suspense>
  )
}
