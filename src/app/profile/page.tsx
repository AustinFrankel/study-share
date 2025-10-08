'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserStats, getUserRank } from '@/lib/gamification'
import { regenerateHandle } from '@/lib/auth'
import { UserStats } from '@/lib/gamification'
import { getActivityMessage, getActivityIcon, logActivity, getUserActivity, ActivityAction } from '@/lib/activity'
import { getUserAccessInfo, grantViewsForAd, ACCESS_GATE_CONFIG } from '@/lib/access-gate'
import { logError } from '@/lib/error-logging'
import { supabase } from '@/lib/supabase'
import { User as UserType, Resource } from '@/lib/types'
import Navigation from '@/components/Navigation'
import Leaderboard from '@/components/Leaderboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User as UserIcon,
  Trophy, 
  Upload, 
  ThumbsUp, 
  Wrench, 
  MessageCircle, 
  Shuffle,
  Crown,
  TrendingUp,
  Calendar,
  Star,
  BookOpen,
  Clock,
  Activity,
  Settings,
  Download,
  Eye,
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function ProfilePageContent() {
  const { user, refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const targetUserHandle = searchParams.get('user')
  const [targetUser, setTargetUser] = useState<UserType | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [rank, setRank] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [regeneratingHandle, setRegeneratingHandle] = useState(false)
  const [handleRegenerated, setHandleRegenerated] = useState(false)
  const [recentResources, setRecentResources] = useState<Resource[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'activity'>('overview')
  const [error, setError] = useState('')
  const [userActivity, setUserActivity] = useState<Array<{ id: string; action_type: ActivityAction; created_at: string; resource_title?: string; points_change?: number; metadata?: Record<string, unknown> }>>([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [editingResource, setEditingResource] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDifficulty, setEditDifficulty] = useState(3)
  const [editTeacherName, setEditTeacherName] = useState('')
  const [editClassTitle, setEditClassTitle] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [accessInfo, setAccessInfo] = useState<{ viewsThisMonth: number; maxViewsThisMonth: number; adsWatchedThisMonth: number; canView: boolean; canWatchAd: boolean } | null>(null)
  const [watchingAd, setWatchingAd] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fetchInitiated = useRef(false) // Track if fetch has been initiated
  const avatarInputRef = useRef<HTMLInputElement | null>(null) // New: file input ref to avoid event.currentTarget null

  // New: inline handle editor state
  const [isEditingHandle, setIsEditingHandle] = useState(false)
  const [newHandle, setNewHandle] = useState('')
  const [savingHandle, setSavingHandle] = useState(false)

  // Resources tab pagination
  const [resourcesPage, setResourcesPage] = useState(1)
  const resourcesPerPage = 10

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !targetUserHandle || (user && user.handle === targetUserHandle)
  const displayUser = isOwnProfile ? user : targetUser

  useEffect(() => {
    // Reset fetch flag when user or targetUserHandle changes
    fetchInitiated.current = false
  }, [user?.id, targetUserHandle])

  useEffect(() => {
    let isMounted = true // Prevent state updates if component unmounts

    const fetchData = async () => {
      // Skip if no user or already fetched
      if (!user?.id || fetchInitiated.current) return
      
      fetchInitiated.current = true // Mark as initiated
      setLoading(true)
      
      try {
        if (targetUserHandle && targetUserHandle !== user.handle) {
          // Fetch target user data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('handle', targetUserHandle)
            .single()

          if (userError) throw userError
          if (!isMounted) return
          
          setTargetUser(userData)

          const [userStats, userRank, recentRes] = await Promise.all([
            getUserStats(userData.id),
            getUserRank(userData.id),
            fetchRecentResourcesForUser(userData.id)
          ])

          if (!isMounted) return
          
          setStats(userStats)
          setRank(userRank)
          setRecentResources(recentRes)
        } else {
          // Fetch own profile data
          const [userStats, userRank, recentRes, userAccessInfo] = await Promise.all([
            getUserStats(user.id),
            getUserRank(user.id),
            fetchRecentResourcesForUser(user.id),
            getUserAccessInfo(user.id)
          ])

          if (!isMounted) return
          
          setStats(userStats)
          setRank(userRank)
          setRecentResources(recentRes)
          setAccessInfo(userAccessInfo)
          
          console.log('fetchUserData completed:', {
            userStats,
            userRank,
            recentResourcesCount: recentRes?.length || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        if (isMounted) setError('Failed to load profile')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false // Cleanup on unmount
    }
  }, [user?.id, targetUserHandle]) // depend on user ID only

  useEffect(() => {
    if (user && activeTab === 'activity' && userActivity.length === 0) {
      fetchUserActivity()
    }
  }, [activeTab, user?.id]) // Only depend on user ID

  const fetchRecentResourcesForUser = async (userId: string) => {
    try {
      // First try a simple query to see if resources exist
      const { data: simpleData, error: simpleError } = await supabase
        .from('resources')
        .select('id, title, type, difficulty, created_at, uploader_id')
        .eq('uploader_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (simpleError) {
        // Silently return empty array if query fails
        return []
      }
      
      if (!simpleData || simpleData.length === 0) {
        return []
      }
      
      // Now try the complex query with joins (without view_count for now)
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
          files(*)
        `)
        .eq('uploader_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        // Return simple data if complex query fails - type assertion needed for fallback
        return simpleData as Resource[]
      }

      return (data || []) as Resource[]
    } catch (error) {
      // Silently return empty array on any error
      return []
    }
  }

  // Removed toggle visibility since all resources are public by default

  const handleRemoveAvatar = async () => {
    if (!user) return
    try {
      setAvatarUploading(true)
      // Attempt to remove existing avatar file (best effort)
      const oldUrl = user.avatar_url
      if (oldUrl) {
        const idx = oldUrl.indexOf('/avatars/')
        if (idx > -1) {
          const path = oldUrl.substring(idx + '/avatars/'.length)
          try {
            await supabase.storage.from('avatars').remove([path])
          } catch (e) {
            console.warn('Failed to remove old avatar (non-critical):', e)
          }
        }
      }
      // Clear avatar_url in DB
      await supabase.from('users').update({ avatar_url: null }).eq('id', user.id)
      await refreshUser()
    } catch (e) {
      console.error('Failed to remove avatar:', e)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      setTimeout(() => setError(''), 2500)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large (max 5MB)')
      setTimeout(() => setError(''), 2500)
      return
    }

    setAvatarUploading(true)
    try {
      // Sanitize filename: remove spaces, apostrophes, and special characters
      const sanitizedFileName = file.name
        .replace(/['\s]+/g, '_')  // Replace spaces and apostrophes with underscores
        .replace(/[^a-zA-Z0-9._-]/g, '')  // Remove other special characters
      const filePath = `${user.id}/${Date.now()}-${sanitizedFileName}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
      if (uploadError) throw uploadError

      const { data: publicData } = await supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = publicData?.publicUrl
      if (!publicUrl) throw new Error('Failed to get public URL')

      // Optionally remove previous avatar
      const oldUrl = user.avatar_url
      if (oldUrl) {
        const idx = oldUrl.indexOf('/avatars/')
        if (idx > -1) {
          const path = oldUrl.substring(idx + '/avatars/'.length)
          try { await supabase.storage.from('avatars').remove([path]) } catch {}
        }
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      if (updateError) throw updateError

      await refreshUser()
    } catch (e: any) {
      console.error('Error uploading avatar:', e)
      if (typeof e?.message === 'string' && e.message.toLowerCase().includes('bucket not found')) {
        setError("Avatar storage bucket missing. Create a public bucket named 'avatars' in Supabase → Storage.")
      } else {
        setError('Failed to upload avatar')
      }
      setTimeout(() => setError(''), 3000)
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  const handleRemoveResource = async (resourceId: string) => {
    if (!user) {
      setError('Must be logged in to delete resources')
      return
    }

    // Confirm deletion
    const resourceToDelete = recentResources.find(r => r.id === resourceId)
    const confirmMessage = `Are you sure you want to delete "${resourceToDelete?.title || 'this resource'}"? This action cannot be undone.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      // Get resource title for activity log
      const resourceTitle = resourceToDelete?.title || 'Unknown Resource'
      
      // First verify the resource exists and user owns it
      const { data: resourceCheck, error: checkError } = await supabase
        .from('resources')
        .select('id, uploader_id, title')
        .eq('id', resourceId)
        .eq('uploader_id', user.id)
        .single()
      
      if (checkError || !resourceCheck) {
        throw new Error('Resource not found or you do not have permission to delete it.')
      }

      // Ensure user owns the resource before deletion
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('uploader_id', user.id) // Security check - ensure user owns the resource
      
      if (error) {
        console.error('Delete error:', error)
        throw error
      }
      
      // Clean up related data
      try {
        // Remove activity logs for this resource
        await supabase
          .from('activity_log')
          .delete()
          .eq('resource_id', resourceId)
          .eq('user_id', user.id)

        // Remove points associated with the resource
        await supabase
          .from('points_ledger')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId)

        // Remove files associated with the resource
        await supabase
          .from('files')
          .delete()
          .eq('resource_id', resourceId)

        // Remove votes for this resource
        await supabase
          .from('votes')
          .delete()
          .eq('resource_id', resourceId)

        // Remove comments for this resource
        await supabase
          .from('comments')
          .delete()
          .eq('resource_id', resourceId)

        // Remove AI derivatives
        await supabase
          .from('ai_derivatives')
          .delete()
          .eq('resource_id', resourceId)

        // Remove resource tags
        await supabase
          .from('resource_tags')
          .delete()
          .eq('resource_id', resourceId)

        // Remove flags
        await supabase
          .from('flags')
          .delete()
          .eq('resource_id', resourceId)

      } catch (cleanupError) {
        console.warn('Failed to clean up related data (non-critical):', cleanupError)
      }
      
      // Log activity
      if (user?.id) {
        await logActivity({
          userId: user.id,
          action: 'delete',
          resourceId: resourceId,
          resourceTitle: resourceTitle,
          pointsChange: -1, // Usually lose points for deletion
          metadata: { deleted_from: 'profile_page' }
        })
      }
      
      // Update local state immediately and don't refetch to avoid showing deleted resource
      setRecentResources(prev => prev.filter(r => r.id !== resourceId))
      
      // Refresh user stats only (not recent resources since we just updated them)
      if (user) {
        try {
          const [userStats, userRank] = await Promise.all([
            getUserStats(user.id),
            getUserRank(user.id)
          ])
          setStats(userStats)
          setRank(userRank)
        } catch (statsError) {
          console.warn('Failed to refresh stats:', statsError)
        }
      }
      
      setError('Resource deleted successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(''), 3000)
    } catch (e) {
      console.error('Error removing resource:', e)
      
      // Provide more specific error messages
      const error = e as Error & { code?: string }
      if (error?.message?.includes('permission')) {
        setError('Permission denied. You can only delete your own resources.')
      } else if (error?.message?.includes('not found')) {
        setError('Resource not found. It may have already been deleted.')
      } else if (error?.code === 'PGRST116') {
        setError('Resource not found or you do not have permission to delete it.')
      } else {
        setError(`Failed to remove resource: ${error?.message || 'Unknown error'}. Please try again.`)
      }
    }
  }

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource.id)
    setEditTitle(resource.title)
    setEditDifficulty(resource.difficulty || 3)
    setEditTeacherName(resource.class?.teacher?.name || '')
    setEditClassTitle(resource.class?.title || '')
  }

  const handleCancelEdit = () => {
    setEditingResource(null)
    setEditTitle('')
    setEditDifficulty(3)
    setEditTeacherName('')
    setEditClassTitle('')
  }

  const handleSaveEdit = async (resourceId: string) => {
    if (!user || !editTitle.trim()) return

    setSavingEdit(true)
    try {
      const currentResource = recentResources.find(r => r.id === resourceId)
      if (!currentResource) return

      // Update resource title and difficulty
      const { error: resourceError } = await supabase
        .from('resources')
        .update({ 
          title: editTitle.trim(),
          difficulty: editDifficulty
        })
        .eq('id', resourceId)
        .eq('uploader_id', user.id) // Ensure user owns the resource

      if (resourceError) throw resourceError

      // Update teacher name if changed
      if (editTeacherName.trim() && editTeacherName !== currentResource.class?.teacher?.name) {
        const { error: teacherError } = await supabase
          .from('teachers')
          .update({ name: editTeacherName.trim() })
          .eq('id', currentResource.class?.teacher?.id)

        if (teacherError) console.warn('Failed to update teacher name:', teacherError)
      }

      // Update class title if changed
      if (editClassTitle.trim() && editClassTitle !== currentResource.class?.title) {
        const { error: classError } = await supabase
          .from('classes')
          .update({ title: editClassTitle.trim() })
          .eq('id', currentResource.class?.id)

        if (classError) console.warn('Failed to update class title:', classError)
      }

      // Update local state with all changes
      setRecentResources(prev =>
        prev.map(resource =>
          resource.id === resourceId
            ? {
                ...resource,
                title: editTitle.trim(),
                difficulty: editDifficulty,
                class: resource.class ? {
                  ...resource.class,
                  title: editClassTitle.trim() || resource.class.title,
                  teacher: resource.class.teacher ? {
                    ...resource.class.teacher,
                    name: editTeacherName.trim() || resource.class.teacher.name
                  } : resource.class.teacher
                } : resource.class
              }
            : resource
        )
      )

      // Log activity
      await logActivity({
        userId: user.id,
        action: 'edit',
        resourceId: resourceId,
        resourceTitle: editTitle.trim(),
        pointsChange: 0,
        metadata: { edited_from: 'profile_page', old_title: recentResources.find(r => r.id === resourceId)?.title }
      })

      // Reset edit state
      setEditingResource(null)
      setEditTitle('')
      setEditDifficulty(3)
      setEditTeacherName('')
      setEditClassTitle('')
      setError('Resource updated successfully')

      // Clear success message after 3 seconds
      setTimeout(() => setError(''), 3000)
    } catch (e) {
      console.error('Error updating resource:', e)
      setError('Failed to update resource. Please try again.')
    } finally {
      setSavingEdit(false)
    }
  }

  // New: regenerate via existing handler
  const handleRegenerateHandle = async () => {
    setRegeneratingHandle(true)
    try {
      const { handle, error } = await regenerateHandle(user!.id)
      if (error) throw error
      await refreshUser()
    } catch (err) {
      console.error('Failed to regenerate handle:', err)
    } finally {
      setRegeneratingHandle(false)
    }
  }

  // New: inline save handle with validation
  const saveInlineHandle = async () => {
    if (!user || !newHandle.trim()) {
      setIsEditingHandle(false)
      return
    }
    
    const trimmed = newHandle.trim()
    
    // Username validation
    if (trimmed.length < 4) {
      setError('Username must be at least 4 characters long')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    if (trimmed.length > 20) {
      setError('Username must be 20 characters or less')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    // Check for invalid characters (only allow alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError('Username can only contain letters, numbers, hyphens, and underscores')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    setSavingHandle(true)
    try {
      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, handle')
        .eq('handle', trimmed)
        .neq('id', user.id)
      
      if (checkError) {
        console.error('Error checking username:', checkError)
        throw checkError
      }
      
      if (existingUsers && existingUsers.length > 0) {
        // Username exists, suggest alternatives
        const suggestions: string[] = []
        let baseHandle = trimmed
        
        // Generate 3 unique suggestions
        for (let i = 1; suggestions.length < 3; i++) {
          const suggestion = `${baseHandle}${i}`
          const { data: check } = await supabase
            .from('users')
            .select('id')
            .eq('handle', suggestion)
            .single()
          
          if (!check) {
            suggestions.push(suggestion)
          }
        }
        
        // Also try with random numbers
        if (suggestions.length < 3) {
          for (let i = 0; suggestions.length < 3; i++) {
            const randomNum = Math.floor(Math.random() * 999) + 1
            const suggestion = `${baseHandle}${randomNum}`
            const { data: check } = await supabase
              .from('users')
              .select('id')
              .eq('handle', suggestion)
              .single()
            
            if (!check && !suggestions.includes(suggestion)) {
              suggestions.push(suggestion)
            }
          }
        }
        
        setError(`This username already exists. Try: ${suggestions.join(', ')}`)
        setTimeout(() => setError(''), 5000)
        return
      }
      
      const { error } = await supabase.from('users').update({ handle: trimmed }).eq('id', user.id)
      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }
      await refreshUser()
      setIsEditingHandle(false)
      setError('Username updated successfully!')
      setTimeout(() => setError(''), 2500)
    } catch (err) {
      console.error('Failed to update handle:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Failed to update username: ${errorMessage}`)
      setTimeout(() => setError(''), 3000)
    } finally {
      setSavingHandle(false)
    }
  }

  if (!isOwnProfile && !targetUser && !loading) {
    return (
      <div className="h-screen">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center">
            <UserIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">User Not Found</h2>
            <p className="mt-1 text-sm text-gray-500">
              The user profile you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (isOwnProfile && !user) {
    return (
      <div className="h-screen">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center">
            <UserIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">Profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              Please sign in to view your profile.
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  const getNextBadgeProgress = () => {
    if (!stats) return null

    // Find the next badge to unlock in each category
    const nextUploadBadge = stats.uploadsCount < 10 ? 10 : stats.uploadsCount < 25 ? 25 : null
    const nextVoteBadge = stats.netUpvotes < 50 ? 50 : null
    const nextFixBadge = stats.acceptedFixes < 5 ? 5 : null
    const nextCommentBadge = stats.helpfulComments < 25 ? 25 : null

    if (nextUploadBadge) {
      return {
        name: nextUploadBadge === 10 ? 'Prolific Uploader' : 'Content Creator',
        current: stats.uploadsCount,
        target: nextUploadBadge,
        type: 'uploads'
      }
    }

    if (nextVoteBadge) {
      return {
        name: 'Crowd-Verified',
        current: stats.netUpvotes,
        target: nextVoteBadge,
        type: 'upvotes'
      }
    }

    if (nextFixBadge) {
      return {
        name: 'Fixer',
        current: stats.acceptedFixes,
        target: nextFixBadge,
        type: 'fixes'
      }
    }

    if (nextCommentBadge) {
      return {
        name: 'Community Helper',
        current: stats.helpfulComments,
        target: nextCommentBadge,
        type: 'comments'
      }
    }

    return null
  }

  const nextBadge = getNextBadgeProgress()

  const fetchUserActivity = async () => {
    if (!user) return
    
    setLoadingActivity(true)
    try {
      const activity = await getUserActivity(user.id, 1000) // Show up to 1000 activity items
      setUserActivity(activity)
    } catch (error) {
      console.error('Error fetching user activity:', error)
    } finally {
      setLoadingActivity(false)
    }
  }

  const handleWatchAd = async () => {
    if (!user || watchingAd) return
    
    setWatchingAd(true)
    try {
      // Simulate ad watching with a 3-second delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Grant additional views
      await grantViewsForAd(user.id)
      
      // Refresh access info
      const newAccessInfo = await getUserAccessInfo(user.id)
      setAccessInfo(newAccessInfo)
      
      setError('Ad watched successfully! You gained 1 additional view.')
      setTimeout(() => setError(''), 3000)
    } catch (error) {
      logError('Error watching ad', error)
      setError('Failed to watch ad. Please try again.')
    } finally {
      setWatchingAd(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isOwnProfile ? 'Your Profile' : `${displayUser?.handle}'s Profile`}
          </h1>
          <p className="text-lg text-gray-600">
            {isOwnProfile ? 'Track your contributions and achievements' : 'View contributions and achievements'}
          </p>
        </div>

        {handleRegenerated && (
          <Alert className="mb-6">
            <Shuffle className="h-4 w-4" />
            <AlertDescription>
              Your handle has been updated! Your new anonymous identity is ready.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className={`mb-6 ${error.includes('successfully') ? 'border-green-500' : ''}`}>
            <AlertDescription className={error.includes('successfully') ? 'text-green-700' : ''}>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-300">
          <div className="flex justify-center space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: UserIcon },
              { id: 'resources', name: isOwnProfile ? 'My Resources' : 'Resources', icon: BookOpen },
              ...(isOwnProfile ? [{ id: 'activity', name: 'Activity', icon: Activity }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'resources' | 'activity')}
                className={`flex items-center gap-2 pb-4 px-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-1 max-w-4xl mx-auto">
          {/* Main Content - Centered */}
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* User Info Card with Username Editor on the right */}
                <div className="grid grid-cols-1 gap-8 items-start">
                  <Card className={`${isOwnProfile ? "min-h-[350px]" : ""} shadow-md rounded-xl`}>
                    <CardHeader className="pt-8">
                      <CardTitle className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 justify-center">
                          <Avatar className={isOwnProfile ? "w-16 h-16 flex-shrink-0" : "w-12 h-12 flex-shrink-0"}>
                            {displayUser?.avatar_url && (
                              <AvatarImage src={displayUser.avatar_url} alt={displayUser?.handle} />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                              {displayUser?.handle.split('-').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-center">
                            {!isEditingHandle ? (
                              <h2 className={isOwnProfile ? "text-2xl sm:text-3xl font-mono font-bold break-words" : "text-xl sm:text-2xl font-mono font-semibold break-words"}>{displayUser?.handle}</h2>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                <Input
                                  value={newHandle}
                                  onChange={(e) => setNewHandle(e.target.value)}
                                  className="h-9 font-mono text-base w-full sm:w-64"
                                  placeholder="Enter new username"
                                  maxLength={20}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={saveInlineHandle} disabled={savingHandle} className="flex-1 sm:flex-none">
                                    {savingHandle ? 'Saving...' : 'Save'}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setIsEditingHandle(false)} disabled={savingHandle} className="flex-1 sm:flex-none">Cancel</Button>
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              Member since {displayUser?.created_at ? new Date(displayUser.created_at).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                        </div>
                        {isOwnProfile && (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {!isEditingHandle ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setIsEditingHandle(true); setNewHandle(displayUser?.handle || '') }}
                              >
                                Edit Username
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRegenerateHandle}
                              disabled={regeneratingHandle}
                            >
                              <Shuffle className="w-4 h-4 mr-2" />
                              {regeneratingHandle ? 'Generating...' : 'Random Username'}
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                    {isOwnProfile && (
                      <div className="mb-6">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <input
                            ref={avatarInputRef}
                            id="avatar-upload-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarFileChange}
                          />
                          <Button asChild size="sm" variant="outline" disabled={avatarUploading}>
                            <label htmlFor="avatar-upload-input" className="cursor-pointer">
                              {avatarUploading ? 'Uploading...' : 'Change Photo'}
                            </label>
                          </Button>
                          {user?.avatar_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleRemoveAvatar}
                              disabled={avatarUploading}
                            >
                              Remove Photo
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {isOwnProfile && accessInfo && (
                      <div className="border-t pt-6 mb-6">
                        <h4 className="font-medium text-gray-900 mb-3 text-center">Monthly Access</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Views Used This Month</span>
                              <span className="font-medium">
                                {accessInfo.viewsThisMonth} / {accessInfo.maxViewsThisMonth}
                              </span>
                            </div>
                            <Progress value={(accessInfo.viewsThisMonth / accessInfo.maxViewsThisMonth) * 100} className="h-2" />
                          </div>
                          <div className="flex flex-wrap gap-2 items-center justify-center">
                            <div className="text-sm text-gray-600">
                              Ads watched: {accessInfo.adsWatchedThisMonth} / {ACCESS_GATE_CONFIG.MAX_ADS_PER_MONTH}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {accessInfo.canWatchAd && (
                                <Button size="sm" onClick={handleWatchAd} disabled={watchingAd} className="bg-green-600 hover:bg-green-700">
                                  {watchingAd ? 'Watching...' : 'Watch Ad (+1 view)'}
                                </Button>
                              )}
                              <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/upload">Upload (+5 views)</Link>
                              </Button>
                            </div>
                          </div>
                          {!accessInfo.canView && (
                            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded text-center">
                              ⚠️ Monthly view limit reached. Upload resources or watch ads to get more views.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    </CardContent>
                  </Card>
                </div>

            {/* Badges - Moved Higher */}
            <Card className="shadow-md rounded-xl">
              <CardHeader className="pt-8">
                <CardTitle className="flex items-center gap-2 text-xl justify-center">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Badges ({stats?.badges.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {stats?.badges && stats.badges.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {stats.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg"
                      >
                        <div className="text-2xl">{badge.icon}</div>
                        <div>
                          <div className="font-medium text-sm">{badge.name}</div>
                          <div className="text-xs text-gray-600">{badge.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm">No badges earned yet</p>
                    <p className="text-xs">Start uploading and engaging to earn badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Badge Progress - Moved Higher */}
            {nextBadge && (
              <Card className="shadow-md rounded-xl">
                <CardHeader className="pt-8">
                  <CardTitle className="flex items-center gap-2 text-xl justify-center">
                    <Star className="w-6 h-6 text-blue-500" />
                    Next Badge: {nextBadge.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{nextBadge.current} / {nextBadge.target} {nextBadge.type}</span>
                      <span>{Math.round((nextBadge.current / nextBadge.target) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(nextBadge.current / nextBadge.target) * 100} 
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 text-center">
                      {nextBadge.target - nextBadge.current} more {nextBadge.type} to unlock this badge
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="shadow-md rounded-xl hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900">{stats?.uploadsCount || 0}</div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Resources</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md rounded-xl hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="text-center">
                    <ThumbsUp className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900">{stats?.netUpvotes || 0}</div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Net Upvotes</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md rounded-xl hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="text-center">
                    <Wrench className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900">{stats?.acceptedFixes || 0}</div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Fixes Accepted</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md rounded-xl hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="text-center">
                    <MessageCircle className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900">{stats?.helpfulComments || 0}</div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Comments</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* View All Badges Button */}
            <div className="text-center">
              <Button variant="outline" asChild size="lg">
                <a href="#badges-section">View All Badges</a>
              </Button>
            </div>
              </>
            )}

            {/* My Resources Tab */}
            {activeTab === 'resources' && (
              <Card className="shadow-md rounded-xl">
                <CardHeader className="pt-8">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                    {isOwnProfile ? 'My Resources' : `${displayUser?.handle}'s Resources`} ({stats?.uploadsCount || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {(() => {
                    console.log('Rendering resources tab, resources count:', recentResources.length, 'resources:', recentResources)
                    return null
                  })()}
                  {recentResources.length > 0 ? (
                    <>
                    <div className="space-y-4">
                      {recentResources.slice((resourcesPage - 1) * resourcesPerPage, resourcesPage * resourcesPerPage).map((resource) => (
                        <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {editingResource === resource.id ? (
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Resource Title</label>
                                    <Input
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      className="font-medium"
                                      placeholder="Resource title"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Professor Name</label>
                                    <Input
                                      value={editTeacherName}
                                      onChange={(e) => setEditTeacherName(e.target.value)}
                                      placeholder="Professor name"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Class/Subject Title</label>
                                    <Input
                                      value={editClassTitle}
                                      onChange={(e) => setEditClassTitle(e.target.value)}
                                      placeholder="Class or subject title"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Difficulty (1-5)</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="5"
                                      value={editDifficulty}
                                      onChange={(e) => setEditDifficulty(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                                      placeholder="Difficulty level"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleSaveEdit(resource.id)}
                                      disabled={savingEdit || !editTitle.trim()}
                                      className="flex items-center gap-1"
                                    >
                                      <Save className="w-3 h-3" />
                                      {savingEdit ? 'Saving...' : 'Save All'}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={handleCancelEdit}
                                      className="flex items-center gap-1"
                                    >
                                      <X className="w-3 h-3" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Link href={`/resource/${resource.id}`} className="font-medium text-gray-900 mb-1 hover:underline">
                                  {resource.title}
                                </Link>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  {resource.class?.title}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(resource.created_at).toLocaleDateString()}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {resource.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {resource.class?.school?.name} • {resource.class?.subject?.name}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                <span>{(resource as Resource & { view_count?: number }).view_count || 0} views</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Download className="w-4 h-4" />
                                <span>{resource.files?.length || 0} files</span>
                              </div>
                              {isOwnProfile && (
                                <div className="mt-3 flex gap-2 justify-end">
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => handleEditResource(resource)}
                                    disabled={editingResource === resource.id}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleRemoveResource(resource.id)}>
                                    Remove
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {recentResources.length > resourcesPerPage && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={resourcesPage === 1}
                          onClick={() => setResourcesPage(p => p - 1)}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: Math.ceil(recentResources.length / resourcesPerPage) }, (_, i) => i + 1).map(pageNum => (
                          <Button
                            key={pageNum}
                            variant={resourcesPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setResourcesPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={resourcesPage >= Math.ceil(recentResources.length / resourcesPerPage)}
                          onClick={() => setResourcesPage(p => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm">No resources uploaded yet</p>
                      <p className="text-xs mb-4">Share your study materials to help others!</p>
                      <Button asChild size="sm">
                        <Link href="/upload">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resource
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-8">
                {/* Points and Rank - Moved from Overview */}
                <Card className="shadow-md rounded-xl">
                  <CardHeader className="pt-8">
                    <CardTitle className="text-xl text-center">Your Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                        <div className="text-4xl font-bold text-blue-600">{stats?.totalPoints || 0}</div>
                        <div className="text-sm text-gray-600 font-medium mt-2">Total Points</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                        <div className="text-4xl font-bold text-green-600">#{rank}</div>
                        <div className="text-sm text-gray-600 font-medium mt-2">Global Rank</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card className="shadow-md rounded-xl">
                  <CardHeader className="pt-8">
                    <CardTitle className="flex items-center gap-2 text-xl justify-center">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Leaderboard />
                  </CardContent>
                </Card>

                <Card className="shadow-md rounded-xl">
                  <CardHeader className="pt-8">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Activity className="w-6 h-6 text-green-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {loadingActivity ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                            <div className="w-8 h-8 bg-gray-200 rounded-full" />
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                              <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-12" />
                          </div>
                        ))}
                      </div>
                    ) : userActivity.length > 0 ? (
                      <div className="space-y-3">
                        {userActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                              {getActivityIcon(activity.action_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {getActivityMessage(activity)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(activity.created_at).toLocaleDateString()} at {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {activity.points_change !== 0 && activity.points_change !== undefined && (
                              <div className={`text-xs font-medium ${activity.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {activity.points_change > 0 ? '+' : ''}{activity.points_change} point{Math.abs(activity.points_change) !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm text-gray-600">No activity yet</p>
                        <p className="text-xs text-gray-500">Start uploading resources to see your activity here!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Real Statistics Only */}
                {stats && (stats.uploadsCount > 0 || stats.netUpvotes > 0 || stats.acceptedFixes > 0 || stats.helpfulComments > 0) && (
                  <Card className="shadow-md rounded-xl">
                    <CardHeader className="pt-8">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <TrendingUp className="w-6 h-6 text-orange-500" />
                        Your Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Contributions</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Resources Uploaded</span>
                              <span className="font-medium">{stats.uploadsCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Total Points</span>
                              <span className="font-medium">{stats.totalPoints}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Global Rank</span>
                              <span className="font-medium">#{rank}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Community Impact</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Net Upvotes</span>
                              <span className="font-medium">{stats.netUpvotes}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Helpful Comments</span>
                              <span className="font-medium">{stats.helpfulComments}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Fixes Accepted</span>
                              <span className="font-medium">{stats.acceptedFixes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Leaderboard - Only show on activity tab */}
          {activeTab === 'activity' && (
            <div>
              <Leaderboard />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
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
      <ProfilePageContent />
    </Suspense>
  )
}
