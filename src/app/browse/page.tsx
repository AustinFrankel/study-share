'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Resource } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { getUserViewedResources } from '@/lib/access-gate'
import Navigation from '@/components/Navigation'
import SearchBar from '@/components/SearchBar'
import FacetFilters from '@/components/FacetFilters'
import ResourceCard from '@/components/ResourceCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid, List, TrendingUp, Clock, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

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

  useEffect(() => {
    fetchResources()
    fetchFilterOptions()
  }, [searchParams, sortBy])

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

  const fetchResources = async () => {
    try {
      let query = supabase
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
          users (handle),
          ai_derivatives (status),
          tags:resource_tags (
            tag:tags (name)
          )
        `)

      const school = searchParams.get('school')
      if (school) {
        query = query.eq('classes.school_id', school)
      }

      const subject = searchParams.get('subject')
      if (subject) {
        query = query.eq('classes.subject_id', subject)
      }

      const teacher = searchParams.get('teacher')
      if (teacher) {
        query = query.eq('classes.teacher_id', teacher)
      }

      const type = searchParams.get('type')
      if (type) {
        query = query.eq('type', type)
      }

      // Apply sorting
      if (sortBy === 'popular') {
        query = query.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error

      const transformedData = data?.map(resource => ({
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

  return (
    <div className="min-h-screen">
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
            {loading ? 'Loading...' : `${resources.length} resources found`}
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

        {/* Resources Grid/List */}
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onVote={handleVote}
                compact={viewMode === 'list'}
                blurredPreview={!user || (user?.id !== resource.uploader?.id && !viewedResources.includes(resource.id))}
                hasBeenViewed={!!user && viewedResources.includes(resource.id)}
              />
            ))}
          </div>
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
      <BrowseContent />
    </Suspense>
  )
}
