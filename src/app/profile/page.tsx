'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserStats, getUserRank } from '@/lib/gamification'
import { regenerateHandle } from '@/lib/auth'
import { UserStats } from '@/lib/gamification'
import { getActivityMessage, getActivityIcon, logActivity, getUserActivity } from '@/lib/activity'
import { getUserAccessInfo, grantViewsForAd, ACCESS_GATE_CONFIG } from '@/lib/access-gate'
import { logError } from '@/lib/error-logging'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import Leaderboard from '@/components/Leaderboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
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
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const targetUserHandle = searchParams.get('user')
  const [targetUser, setTargetUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [rank, setRank] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [regeneratingHandle, setRegeneratingHandle] = useState(false)
  const [handleRegenerated, setHandleRegenerated] = useState(false)
  const [recentResources, setRecentResources] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'activity'>('overview')
  const [error, setError] = useState('')
  const [userActivity, setUserActivity] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [editingResource, setEditingResource] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDifficulty, setEditDifficulty] = useState(3)
  const [editTeacherName, setEditTeacherName] = useState('')
  const [editClassTitle, setEditClassTitle] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [accessInfo, setAccessInfo] = useState<any>(null)
  const [watchingAd, setWatchingAd] = useState(false)
  
  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !targetUserHandle || (user && user.handle === targetUserHandle)
  const displayUser = isOwnProfile ? user : targetUser

  useEffect(() => {
    if (targetUserHandle && targetUserHandle !== user?.handle) {
      // Fetch target user data
      fetchTargetUser()
    } else if (user) {
      // Fetch own profile data
      fetchUserData()
    }
  }, [user, targetUserHandle])

  useEffect(() => {
    if (user && activeTab === 'activity' && userActivity.length === 0) {
      fetchUserActivity()
    }
  }, [activeTab, user])

  const fetchTargetUser = async () => {
    if (!targetUserHandle) return

    setLoading(true)
    try {
      // Fetch target user by handle
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('handle', targetUserHandle)
        .single()

      if (userError) throw userError
      setTargetUser(userData)

      // Fetch target user's stats and resources (public data only)
      const [userStats, userRank, recentRes] = await Promise.all([
        getUserStats(userData.id),
        getUserRank(userData.id),
        fetchRecentResourcesForUser(userData.id)
      ])

      setStats(userStats)
      setRank(userRank)
      setRecentResources(recentRes)
    } catch (error) {
      console.error('Error fetching target user data:', error)
      setError('User not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [userStats, userRank, recentRes, userAccessInfo] = await Promise.all([
        getUserStats(user.id),
        getUserRank(user.id),
        fetchRecentResources(),
        getUserAccessInfo(user.id)
      ])

      setStats(userStats)
      setRank(userRank)
      setRecentResources(recentRes)
      setAccessInfo(userAccessInfo)
      
      console.log('fetchUserData completed:', {
        userStats,
        userRank,
        recentResourcesCount: recentRes?.length || 0,
        recentRes
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentResources = async () => {
    if (!user) return []
    return fetchRecentResourcesForUser(user.id)
  }

  const fetchRecentResourcesForUser = async (userId: string) => {
    try {
      console.log('Fetching resources for user:', userId)
      
      // First try a simple query to see if resources exist
      const { data: simpleData, error: simpleError } = await supabase
        .from('resources')
        .select('id, title, type, difficulty, created_at, uploader_id')
        .eq('uploader_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (simpleError) {
        console.error('Simple resources query failed:', simpleError.message)
        return []
      }
      
      console.log('Simple resources found:', simpleData?.length || 0)
      
      if (!simpleData || simpleData.length === 0) {
        return []
      }
      
      // Now try the complex query with joins (without view_count for now)
      const { data, error } = await supabase
        .from('resources')
        .select(`
          id,
          title,
          type,
          difficulty,
          created_at,
          class:classes(
            id,
            title,
            school:schools(name),
            subject:subjects(name),
            teacher:teachers(name)
          ),
          files(id)
        `)
        .eq('uploader_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) {
        console.warn('Complex query failed, falling back to simple data:', error.message)
        // Return simple data if complex query fails
        return simpleData.map(resource => ({
          ...resource,
          view_count: 0, // Default view count since column might not exist
          class: { title: 'Unknown Class', school: { name: 'Unknown School' }, subject: { name: 'Unknown Subject' }, teacher: { name: 'Unknown Teacher' } },
          files: []
        }))
      }
      
      console.log('Complex resources found:', data?.length || 0)
      // Add default view_count to complex query results
      return (data || []).map(resource => ({
        ...resource,
        view_count: 0 // Default view count since column might not exist
      }))
    } catch (error) {
      logError('Error fetching recent resources', error)
      return []
    }
  }

  // Removed toggle visibility since all resources are public by default

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
    } catch (e: any) {
      console.error('Error removing resource:', e)
      
      // Provide more specific error messages
      if (e?.message?.includes('permission')) {
        setError('Permission denied. You can only delete your own resources.')
      } else if (e?.message?.includes('not found')) {
        setError('Resource not found. It may have already been deleted.')
      } else if (e?.code === 'PGRST116') {
        setError('Resource not found or you do not have permission to delete it.')
      } else {
        setError(`Failed to remove resource: ${e?.message || 'Unknown error'}. Please try again.`)
      }
    }
  }

  const handleEditResource = (resource: any) => {
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
                class: {
                  ...resource.class,
                  title: editClassTitle.trim() || resource.class?.title,
                  teacher: {
                    ...resource.class?.teacher,
                    name: editTeacherName.trim() || resource.class?.teacher?.name
                  }
                }
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

  const handleRegenerateHandle = async () => {
    if (!user) return

    setRegeneratingHandle(true)
    try {
      const { error } = await regenerateHandle(user.id)
      if (error) throw error

      await refreshUser()
      setHandleRegenerated(true)
      setTimeout(() => setHandleRegenerated(false), 3000)
    } catch (error) {
      console.error('Error regenerating handle:', error)
    } finally {
      setRegeneratingHandle(false)
    }
  }

  if (!isOwnProfile && !targetUser && !loading) {
    return (
      <div className="h-screen">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">User Not Found</h2>
            <p className="mt-1 text-sm text-gray-500">
              The user profile you're looking for doesn't exist.
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
            <User className="h-12 w-12 mx-auto text-gray-400" />
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
    } catch (error: any) {
      logError('Error watching ad', error)
      setError('Failed to watch ad. Please try again.')
    } finally {
      setWatchingAd(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isOwnProfile ? 'Your Profile' : `${displayUser?.handle}'s Profile`}
          </h1>
          <p className="text-gray-600">
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
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: User },
              { id: 'resources', name: isOwnProfile ? 'My Resources' : 'Resources', icon: BookOpen },
              ...(isOwnProfile ? [{ id: 'activity', name: 'Activity', icon: Activity }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Stats and Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* User Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {displayUser?.handle.split('-').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-mono font-semibold">{displayUser?.handle}</h2>
                          <p className="text-sm text-gray-600">
                            Member since {new Date(displayUser?.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRegenerateHandle}
                          disabled={regeneratingHandle}
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          {regeneratingHandle ? 'Generating...' : 'New Handle'}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats?.totalPoints || 0}</div>
                        <div className="text-sm text-gray-600">Total Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">#{rank}</div>
                        <div className="text-sm text-gray-600">Global Rank</div>
                      </div>
                    </div>
                    
                    {/* Monthly View Limit Section - Only show for own profile */}
                    {isOwnProfile && accessInfo && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Monthly Access</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Views Used This Month</span>
                              <span className="font-medium">
                                {accessInfo.viewsThisMonth} / {accessInfo.maxViewsThisMonth}
                              </span>
                            </div>
                            <Progress 
                              value={(accessInfo.viewsThisMonth / accessInfo.maxViewsThisMonth) * 100} 
                              className="h-2"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Ads watched: {accessInfo.adsWatchedThisMonth} / {ACCESS_GATE_CONFIG.MAX_ADS_PER_MONTH}
                            </div>
                            <div className="flex gap-2">
                              {accessInfo.canWatchAd && (
                                <Button
                                  size="sm"
                                  onClick={handleWatchAd}
                                  disabled={watchingAd}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {watchingAd ? 'Watching...' : 'Watch Ad (+1 view)'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                asChild
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Link href="/upload">
                                  Upload (+5 views)
                                </Link>
                              </Button>
                            </div>
                          </div>
                          
                          {!accessInfo.canView && (
                            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                              ⚠️ Monthly view limit reached. Upload resources or watch ads to get more views.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.uploadsCount || 0}</div>
                    <div className="text-sm text-gray-600">Resources</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.netUpvotes || 0}</div>
                    <div className="text-sm text-gray-600">Net Upvotes</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Wrench className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.acceptedFixes || 0}</div>
                    <div className="text-sm text-gray-600">Fixes Accepted</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.helpfulComments || 0}</div>
                    <div className="text-sm text-gray-600">Comments</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Badges ({stats?.badges.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.badges && stats.badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

            {/* Next Badge Progress */}
            {nextBadge && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-500" />
                    Next Badge: {nextBadge.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{nextBadge.current} / {nextBadge.target} {nextBadge.type}</span>
                      <span>{Math.round((nextBadge.current / nextBadge.target) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(nextBadge.current / nextBadge.target) * 100} 
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600">
                      {nextBadge.target - nextBadge.current} more {nextBadge.type} to unlock this badge
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
              </>
            )}

            {/* My Resources Tab */}
            {activeTab === 'resources' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    {isOwnProfile ? 'My Resources' : `${displayUser?.handle}'s Resources`} ({stats?.uploadsCount || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    console.log('Rendering resources tab, resources count:', recentResources.length, 'resources:', recentResources)
                    return null
                  })()}
                  {recentResources.length > 0 ? (
                    <div className="space-y-4">
                      {recentResources.map((resource) => (
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
                                <span>{resource.view_count || 0} views</span>
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
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                            {activity.points_change !== 0 && (
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Your Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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

          {/* Right Column - Leaderboard */}
          <div>
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  )
}
