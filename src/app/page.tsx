'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { logActivity } from '@/lib/activity'
import { Resource } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { getUserViewedResources } from '@/lib/access-gate'
import Navigation from '@/components/Navigation'
import SearchBar from '@/components/SearchBar'
import FacetFilters from '@/components/FacetFilters'
import ResourceCard from '@/components/ResourceCard'
import Leaderboard from '@/components/Leaderboard'
import SetupGuide from '@/components/SetupGuide'
import { Button } from '@/components/ui/button'
import { TrendingUp, BookOpen, Users, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function Home() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([])
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([])
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([])
  const [viewedResources, setViewedResources] = useState<string[]>([])

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchResources()
      fetchFilterOptions()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      fetchViewedResources()
    } else {
      setViewedResources([])
    }
  }, [user, isSupabaseConfigured])

  const fetchViewedResources = async () => {
    if (!user) {
      setViewedResources([])
      return
    }
    try {
      const viewed = await getUserViewedResources(user.id)
      setViewedResources(viewed)
    } catch (error) {
      console.error('Error fetching viewed resources:', error)
      // Set empty array on error to prevent inconsistent state
      setViewedResources([])
    }
  }

  const fetchResources = async () => {
    try {
      // Only select necessary columns to reduce data transfer
      const { data, error } = await supabase
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
          class:classes(
            id,
            title,
            code,
            school:schools(id, name),
            subject:subjects(id, name),
            teacher:teachers(id, name)
          ),
          uploader:users(id, handle, avatar_url),
          ai_derivative:ai_derivatives(status),
          files(id, mime)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        // If tables don't exist yet, just show empty state
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          console.log('Database tables not set up yet. Please run the migrations first.')
          setResources([])
          return
        }
        throw error
      }

      // Transform the data to flatten tags
      const transformedData = data?.map(resource => ({
        ...resource,
        tags: resource.tags?.map((rt: { tag: Record<string, unknown> }) => rt.tag) || []
      })) || []

      setResources(transformedData)
    } catch (error) {
      console.error('Error fetching resources:', error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [schoolsRes, subjectsRes, teachersRes] = await Promise.all([
        supabase.from('schools').select('id, name').order('name'),
        supabase.from('subjects').select('id, name').order('name'),
        supabase.from('teachers').select('id, name').order('name')
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
        { id: 't-1', name: 'Dr. Sarah Johnson' },
        { id: 't-2', name: 'Prof. Michael Chen' },
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
        { id: 't-1', name: 'Dr. Sarah Johnson' },
        { id: 't-2', name: 'Prof. Michael Chen' },
      ])
    }
  }

  const handleVote = async (resourceId: string, value: 1 | -1) => {
    if (!user) return
    try {
      // Check if user already voted
      const { data: existingVote, error: fetchErr } = await supabase
        .from('votes')
        .select('*')
        .eq('resource_id', resourceId)
        .eq('voter_id', user.id)
        .single()

      if (fetchErr && fetchErr.code !== 'PGRST116') {
        // Ignore "No rows" error (PGRST116). Any other error should throw
        throw fetchErr
      }

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
          .insert({ resource_id: resourceId, voter_id: user.id, value })
      }

      // Optimistically update UI in-place
      setResources(prev => prev.map(r => {
        if (r.id !== resourceId) return r
        const prevUserVote = (r as Resource & { user_vote?: number }).user_vote || 0
        const nextUserVote = prevUserVote === value ? 0 : value
        const prevCount = r.vote_count || 0
        const nextCount = prevCount - prevUserVote + nextUserVote
        return { ...r, vote_count: nextCount, user_vote: nextUserVote }
      }))

      // Log activity (best effort)
      try {
        await logActivity({
          userId: user.id,
          action: value === 1 ? 'upvote' : 'downvote',
          resourceId,
          resourceTitle: resources.find(r => r.id === resourceId)?.title || 'Unknown',
          pointsChange: 0,
          metadata: { vote_value: value }
        })
      } catch (e) {
        console.warn('Failed to log voting activity:', e)
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleDelete = async (resourceId: string) => {
    if (!user) return

    const resourceToDelete = resources.find(r => r.id === resourceId)
    const confirmMessage = `Are you sure you want to delete "${resourceToDelete?.title || 'this resource'}"? This action cannot be undone.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      // Try to remove storage objects first (best-effort)
      try {
        const { data: fileRows } = await supabase
          .from('files')
          .select('path, storage_path')
          .eq('resource_id', resourceId)
        const paths = (fileRows || [])
          .map((f: { path?: string; storage_path?: string }) => f?.path || f?.storage_path)
          .filter((path): path is string => Boolean(path))
        if (paths.length > 0) {
          await supabase.storage.from('resources').remove(paths)
        }
      } catch (storageErr) {
        console.warn('Storage cleanup failed (non-critical):', storageErr)
      }

      // Clean up child table rows (works even if CASCADE not present). Ignore failures.
      try { await supabase.from('files').delete().eq('resource_id', resourceId) } catch {}
      try { await supabase.from('ai_derivatives').delete().eq('resource_id', resourceId) } catch {}
      try { await supabase.from('resource_tags').delete().eq('resource_id', resourceId) } catch {}
      try { await supabase.from('votes').delete().eq('resource_id', resourceId) } catch {}
      try { await supabase.from('flags').delete().eq('resource_id', resourceId) } catch {}
      try { await supabase.from('comments').delete().eq('resource_id', resourceId) } catch {}

      // Delete the resource
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('uploader_id', user.id) // Additional safety check

      if (error) throw error

      // Remove points associated with the resource
      try {
        await supabase.from('points_ledger')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId)
      } catch (pointsError) {
        console.warn('Failed to remove points (non-critical):', pointsError)
      }
      
      // Log activity
      await logActivity({
        userId: user.id,
        action: 'delete',
        resourceId: resourceId,
        resourceTitle: resourceToDelete?.title || 'Unknown Resource',
        pointsChange: -1,
        metadata: { deleted_from: 'homepage' }
      })

      // Update local state immediately
      setResources(prev => prev.filter(r => r.id !== resourceId))
      
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource. Please try again.')
    }
  }

  // Show setup guide if Supabase is not configured
  if (!isSupabaseConfigured) {
    return <SetupGuide />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Hero Section - Mobile Optimized */}
        <div className="text-center mb-5 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-2 leading-tight">
            Study Resources for Your Classes
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 max-w-2xl mx-auto px-4 leading-relaxed">
            Find and share study materials specific to your school, teacher, and class. 
            Get AI-powered practice questions from uploaded materials.
          </p>
          
          {/* Search Bar - Improved Mobile Styling */}
          <div className="max-w-4xl mx-auto mb-5 sm:mb-6 px-2">
            <SearchBar className="w-full" />
          </div>
          
          {/* Features - Stack on Mobile */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 px-4 mb-2">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-indigo-600" />
              <span>Class-specific materials</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-indigo-600" />
              <span>AI practice questions</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-indigo-600" />
              <span>Anonymous sharing</span>
            </div>
          </div>
        </div>

        {/* Filters - Mobile Friendly */}
        <div className="mb-5 sm:mb-6">
          <FacetFilters 
            schools={schools}
            subjects={subjects}
            teachers={teachers}
          />
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3 items-start">
          {/* Recent Resources */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                Recent Resources
              </h2>
              <Button variant="outline" asChild size="sm" className="text-sm">
                <a href="/browse">View All</a>
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : resources.length > 0 ? (
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {resources.slice(0, 4).map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onVote={handleVote}
                    blurredPreview={!user || (user?.id !== resource.uploader?.id && !viewedResources.includes(resource.id))}
                    isHomepageCard={true}
                    hasBeenViewed={!!user && viewedResources.includes(resource.id)}
                    onDelete={handleDelete}
                    showDeleteOption={true}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300 min-h-[300px] flex flex-col justify-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
                <p className="text-gray-600 mb-4">Be the first to upload study materials!</p>
                <div className="flex justify-center">
                  <Button asChild size="default" className="w-auto px-8">
                    <a href="/upload">Upload Resource</a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar - Hidden on mobile by default */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <Leaderboard className="min-h-[300px]" />
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
