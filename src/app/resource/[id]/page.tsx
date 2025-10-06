'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Resource, Comment, AiDerivative } from '@/lib/types'
import { getUserAccessInfo, recordResourceView } from '@/lib/access-gate'
import { logActivity } from '@/lib/activity'
import Navigation from '@/components/Navigation'
import PracticeView from '@/components/PracticeView'
import CommentThread from '@/components/CommentThread'
import VoteButton from '@/components/VoteButton'
import FlagButton from '@/components/FlagButton'
import StarRating from '@/components/StarRating'
import AccessGate from '@/components/AccessGate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Download, FileText, Image, AlertTriangle, Eye, EyeOff, MessageCircle, Trash2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function ResourcePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const resourceId = params.id as string
  
  const [resource, setResource] = useState<Resource | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showOriginal, setShowOriginal] = useState(false)
  const [votingLoading, setVotingLoading] = useState(false)
  const [accessBlocked, setAccessBlocked] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [textFileContents, setTextFileContents] = useState<{[key: string]: string}>({})
  const [loadingTextFile, setLoadingTextFile] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    if (resourceId) {
      checkAccessAndFetch()
    }
  }, [resourceId, user])

  const checkAccessAndFetch = async () => {
    if (!user) {
      // Anonymous users can view without limits
      fetchResource()
      fetchComments()
      subscribeToComments()
      return
    }

    try {
      // First fetch the resource to check if user is the owner
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select('uploader_id')
        .eq('id', resourceId)
        .single()
      
      // If user owns the resource, they can always view it without limits
      if (resourceData && resourceData.uploader_id === user.id) {
        // Still record the view for owners (for purple marking) but don't count against access limits
        try {
          await supabase
            .from('points_ledger')
            .upsert({
              user_id: user.id,
              resource_id: resourceId,
              delta: 0,
              reason: 'resource_view',
              created_at: new Date().toISOString()
            }, { onConflict: 'user_id,resource_id,reason' })
        } catch (error) {
          console.warn('Failed to record owner view (non-critical):', error)
        }
        
        fetchResource()
        fetchComments()
        subscribeToComments()
        return
      }

      // Check if user can access this resource (for non-owners)
      if (!user.id) {
        console.error('User ID is missing')
        setAccessBlocked(true)
        setLoading(false)
        return
      }
      const accessInfo = await getUserAccessInfo(user.id)
      
      if (!accessInfo.canView) {
        setAccessBlocked(true)
        setLoading(false)
        return
      }

      // Record the view (only for non-owners)
      if (user.id) {
        await recordResourceView(user.id, resourceId)
      }
      
      // Fetch resource data
      fetchResource()
      fetchComments()
      subscribeToComments()
    } catch (error) {
      console.error('Error checking access:', error)
      // On error, allow access
      fetchResource()
      fetchComments()
      subscribeToComments()
    }
  }

  const handleAccessGranted = () => {
    setAccessBlocked(false)
    // Don't re-check access - just fetch the resource data since access is now granted
    fetchResource()
    fetchComments()
    subscribeToComments()
  }

  const fetchResource = async () => {
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
        .eq('id', resourceId)
        .single()

      if (error) throw error

      // Transform tags and get vote counts
      const transformedResource = {
        ...data,
        tags: data.tags?.map((rt: any) => rt.tag) || []
      }

      // Get vote counts and user's vote
      const { data: voteData } = await supabase
        .from('votes')
        .select('value, voter_id')
        .eq('resource_id', resourceId)

      const voteCount = voteData?.reduce((sum, vote) => sum + vote.value, 0) || 0
      const userVote = user ? voteData?.find(v => v.voter_id === user.id)?.value : undefined

      // Get user's rating if logged in
      let userRating = undefined
      if (user) {
        const { data: ratingData } = await supabase
          .from('resource_ratings')
          .select('rating')
          .eq('resource_id', resourceId)
          .eq('rater_id', user.id)
          .single()
        
        userRating = ratingData?.rating
      }

      setResource({
        ...transformedResource,
        vote_count: voteCount,
        user_vote: userVote,
        user_rating: userRating
      })
    } catch (error) {
      console.error('Error fetching resource:', error)
      setError('Failed to load resource')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for resource:', resourceId)
      const { data, error } = await supabase
        .from('comments')
        .select(`*, author:users!author_id(*),
          votes:comment_votes!left(value, voter_id)
        `)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        throw error
      }
      
      console.log('Comments fetched:', data?.length || 0)
      
      // Aggregate votes and organize comments hierarchically
      const allComments = (data || []).map((c: any) => {
        const votes = Array.isArray(c.votes) ? c.votes : []
        const count = votes.reduce((s: number, v: any) => s + (v?.value || 0), 0)
        const userVote = user ? votes.find((v: any) => v?.voter_id === user.id)?.value : undefined
        return { ...c, vote_count: count, user_vote: userVote }
      })
      
      // Organize comments into a tree structure
      const commentMap = new Map()
      const topLevelComments: Comment[] = []
      
      // First pass: create map of all comments
      allComments.forEach((comment: Comment) => {
        comment.replies = []
        commentMap.set(comment.id, comment)
      })
      
      // Second pass: organize into tree structure
      allComments.forEach((comment: Comment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id)
          if (parent) {
            parent.replies!.push(comment)
          }
        } else {
          topLevelComments.push(comment)
        }
      })
      
      setComments(topLevelComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      // Don't fail silently, set empty array but log the issue
      setComments([])
    }
  }

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`comments:${resourceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `resource_id=eq.${resourceId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new comment with author info
            supabase
              .from('comments')
              .select('*, author:users(*)')
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setComments(prev => [...prev, data])
                }
              })
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setComments(prev => prev.map(c => 
              c.id === payload.new.id ? { ...c, ...payload.new } : c
            ))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleVote = async (value: 1 | -1) => {
    if (!user || votingLoading) return

    setVotingLoading(true)
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
      if (user && resource) {
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

      // Refresh resource to get updated vote count
      fetchResource()
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVotingLoading(false)
    }
  }

  const handleRate = async (rating: number) => {
    if (!user || ratingLoading) return

    setRatingLoading(true)
    try {
      if (!isSupabaseConfigured) {
        // Demo mode: update local state only
        setResource(prev => prev ? { ...prev, user_rating: rating } as any : prev)
      } else {
        // Upsert ensures rating is saved/updated in one call
        const { error: upsertError } = await supabase
          .from('resource_ratings')
          .upsert(
            {
              resource_id: resourceId,
              rater_id: user.id,
              rating,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'resource_id,rater_id' }
          )
        if (upsertError) throw upsertError
      }

      // Log rating activity
      if (user && resource) {
        try {
          await logActivity({
            userId: user.id,
            action: 'rate',
            resourceId: resourceId,
            resourceTitle: resource.title,
            pointsChange: 0,
            metadata: { rating_value: rating }
          })
        } catch (activityError) {
          console.warn('Failed to log rating activity:', activityError)
        }
      }

      // Refresh resource to get updated rating
      fetchResource()
    } catch (error: any) {
      // Provide detailed error info in dev overlay
      try {
        console.error('Error rating resource:', error?.message || 'Unknown error')
      } catch {}
      try {
        const { logError } = await import('@/lib/error-logging')
        logError('Error rating resource', error)
      } catch {}
    } finally {
      setRatingLoading(false)
    }
  }

  const handleAddComment = async (body: string, parentId?: string) => {
    if (!user || !body.trim()) return

    try {
      const commentData: any = {
        resource_id: resourceId,
        author_id: user.id,
        body: body.trim()
      }
      
      if (parentId) {
        commentData.parent_id = parentId
      }

      const { error } = await supabase
        .from('comments')
        .insert(commentData)

      if (error) throw error
      
      // Log comment activity
      if (user && resource) {
        try {
          await logActivity({
            userId: user.id,
            action: 'comment',
            resourceId: resourceId,
            resourceTitle: resource.title,
            pointsChange: 0,
            metadata: { comment_preview: body.trim().substring(0, 50) + (body.trim().length > 50 ? '...' : '') }
          })
        } catch (activityError) {
          console.warn('Failed to log comment activity:', activityError)
        }
      }
      
      // Optimistic add to show immediately
      setComments(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          resource_id: resourceId,
          author_id: user.id,
          body: body.trim(),
          created_at: new Date().toISOString(),
          author: user as any
        } as Comment
      ])
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleCommentVote = async (commentId: string, value: 1 | -1) => {
    if (!user) return
    
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('voter_id', user.id)
        .single()

      if (existingVote) {
        if (existingVote.value === value) {
          // Remove vote if clicking same button
          await supabase
            .from('comment_votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          // Update vote if clicking different button
          await supabase
            .from('comment_votes')
            .update({ value })
            .eq('id', existingVote.id)
        }
      } else {
        // Create new vote
        await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            voter_id: user.id,
            value
          })
      }

      // Refresh comments to get updated vote counts
      fetchComments()
    } catch (e) {
      console.error('Error voting on comment:', e)
    }
  }

  // Make handler accessible to CommentThread without changing its public API in many places
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any)._handleCommentVote = handleCommentVote
    }
  }, [handleCommentVote])

  const handleSuggestFix = async (itemIndex: number, patches: any[]) => {
    if (!user) return

    try {
      const { error } = await supabase.functions.invoke('accept-fix', {
        body: {
          resourceId,
          jsonPatch: patches
        }
      })

      if (error) throw error
      
      // Refresh resource to get updated AI derivative
      fetchResource()
    } catch (error) {
      console.error('Error suggesting fix:', error)
    }
  }

  const handleDownload = async (file: any) => {
    try {
      const response = await fetch(`/api/file/${file.id}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = file.original_filename || `file-${file.id}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  const isTextFile = (file: any) => {
    return file.mime && (
      file.mime.startsWith('text/') ||
      file.mime === 'application/json' ||
      file.mime === 'application/xml' ||
      file.original_filename?.match(/\.(txt|md|json|xml|csv|log|js|ts|jsx|tsx|py|java|c|cpp|h|css|html|sql)$/i)
    )
  }

  const loadTextFileContent = async (file: any) => {
    if (textFileContents[file.id] || loadingTextFile[file.id]) return

    setLoadingTextFile(prev => ({ ...prev, [file.id]: true }))
    
    try {
      const response = await fetch(`/api/file/${file.id}/content`)
      if (response.ok) {
        const data = await response.json()
        setTextFileContents(prev => ({ ...prev, [file.id]: data.content }))
      }
    } catch (error) {
      console.error('Error loading text file content:', error)
    } finally {
      setLoadingTextFile(prev => ({ ...prev, [file.id]: false }))
    }
  }

  const handleDeleteResource = async () => {
    if (!user || !resource || resource.uploader?.id !== user.id) return

    setDeleting(true)
    try {
      // Try to remove storage objects first (best-effort)
      try {
        const { data: fileRows } = await supabase
          .from('files')
          .select('path, storage_path')
          .eq('resource_id', resourceId)
        const paths = (fileRows || [])
          .map((f: any) => f?.path || f?.storage_path)
          .filter(Boolean)
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
      // Comments may be owned by others; if CASCADE is not set this could fail; handled by migration.

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
        resourceTitle: resource.title,
        pointsChange: -1,
        metadata: { deleted_from: 'resource_page' }
      })

      // Navigate back to profile without full page reload
      router.push('/profile')
    } catch (error) {
      console.error('Error deleting resource:', error)
      setError('Failed to delete resource. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (accessBlocked) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          <AccessGate onAccessGranted={handleAccessGranted} resourceId={resourceId} />
        </main>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Resource not found'}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  const aiDerivative = resource.ai_derivative as AiDerivative

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Resource Header */}
        <Card className="mb-4">
          <CardHeader className="space-y-4">
            {/* Title and Class Info */}
            <div className="space-y-3">
              <CardTitle className="text-2xl">{resource.title}</CardTitle>
              {resource.subtitle && (
                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">
                  {resource.subtitle}
                </p>
              )}
              
              {/* Class Info with Photo Icon */}
              <div className="flex items-center gap-2 text-sm">
                <Image className="w-4 h-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {resource.class?.school?.name}
                  </Badge>
                  <Badge variant="secondary">
                    {resource.class?.subject?.name}
                  </Badge>
                  <Badge variant="secondary">
                    {resource.class?.teacher?.name}
                  </Badge>
                  {resource.class?.code && (
                    <Badge variant="outline">
                      {resource.class.code}
                    </Badge>
                  )}
                  <Badge className={
                    resource.type === 'notes' ? 'bg-blue-100 text-blue-800' :
                    resource.type === 'past_material' ? 'bg-green-100 text-green-800' :
                    resource.type === 'study_guide' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }>
                    {resource.type.replace('_', ' ')}
                  </Badge>
            </div>
            {(resource.difficulty || resource.study_time) && (
              <div className="grid grid-cols-2 gap-6 pt-3">
                {resource.difficulty && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1 whitespace-nowrap">
                      <span className="text-gray-600">Difficulty</span>
                      <span className="font-medium">{resource.difficulty}/5</span>
                    </div>
                    <Progress value={(Math.min(Math.max(resource.difficulty, 1), 5) / 5) * 100} />
                  </div>
                )}
                {resource.study_time && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1 whitespace-nowrap">
                      <span className="text-gray-600">Time Required</span>
                      <span className="font-medium">
                        {resource.study_time >= 60 
                          ? `${Math.floor(resource.study_time / 60)}h ${resource.study_time % 60}m`
                          : `${resource.study_time} min`
                        }
                      </span>
                    </div>
                    <Progress value={(Math.min(resource.study_time, 240) / 240) * 100} />
                  </div>
                )}
              </div>
            )}
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {resource.uploader?.handle.split('-').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">
                    <Link 
                      href={`/profile?user=${resource.uploader?.handle}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {resource.uploader?.handle}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              {/* Owner Actions */}
              {user && resource.uploader?.id === user.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleDeleteResource}
                      disabled={deleting}
                      variant="destructive"
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleting ? 'Deleting...' : 'Delete Post'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Voting, Comments, and Rating Section */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <VoteButton
                  resourceId={resourceId}
                  currentVote={resource.user_vote}
                  voteCount={resource.vote_count || 0}
                  onVote={handleVote}
                  loading={votingLoading}
                />
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length}</span>
                </div>
                <FlagButton resourceId={resourceId} />
              </div>
              
              <StarRating
                resourceId={resourceId}
                currentRating={(resource as any).user_rating}
                averageRating={resource.average_rating}
                ratingCount={resource.rating_count}
                onRate={user ? handleRate : undefined}
                loading={ratingLoading}
                readOnly={!user}
                className="justify-end"
              />
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t">
                {resource.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          {/* Files List with Image Preview */}
          {resource.files && resource.files.length > 0 && (
            <CardContent>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Attached Files ({resource.files.length})</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOriginal(!showOriginal)}
                  >
                    {showOriginal ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Files
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show Files
                      </>
                    )}
                  </Button>
                </div>

                {/* Image Slider */}
                {(() => {
                  const imageFiles = resource.files.filter(file => file.mime && file.mime.startsWith('image/'));
                  if (imageFiles.length === 0) return null;
                  
                  const currentFile = imageFiles[currentImageIndex] || imageFiles[0];
                  
                  return (
                    <div className="mb-4">
                      <div className="relative">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={`/api/file/${currentFile.id}`}
                            alt={currentFile.original_filename}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-full h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Image not available</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Navigation arrows (only show if more than 1 image) */}
                        {imageFiles.length > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setCurrentImageIndex(prev => prev === 0 ? imageFiles.length - 1 : prev - 1)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-sm h-8 w-8 p-0"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setCurrentImageIndex(prev => prev === imageFiles.length - 1 ? 0 : prev + 1)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-sm h-8 w-8 p-0"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {/* Download button */}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDownload(currentFile)}
                            className="bg-white/90 hover:bg-white shadow-sm"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      
                      {/* Dots indicator (only show if more than 1 image) */}
                      {imageFiles.length > 1 && (
                        <div className="flex justify-center mt-3 gap-2">
                          {imageFiles.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex 
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Current image filename */}
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium">{currentFile.original_filename}</p>
                        {imageFiles.length > 1 && (
                          <p className="text-xs text-gray-500">
                            {currentImageIndex + 1} of {imageFiles.length}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {showOriginal && (
                  <div className="grid gap-2">
                    <h5 className="font-medium text-sm text-gray-700 mb-2">All Files:</h5>
                    {(resource.difficulty || resource.study_time) && (
                      <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {resource.difficulty && (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">Difficulty</span>
                              <span className="font-medium">{resource.difficulty}/5</span>
                            </div>
                            <Progress value={(Math.min(Math.max(resource.difficulty, 1), 5) / 5) * 100} />
                          </div>
                        )}
                        {resource.study_time && (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">Time Required</span>
                              <span className="font-medium">
                                {resource.study_time >= 60 
                                  ? `${Math.floor(resource.study_time / 60)}h ${resource.study_time % 60}m`
                                  : `${resource.study_time} min`
                                }
                              </span>
                            </div>
                            <Progress value={(Math.min(resource.study_time, 120) / 120) * 100} />
                          </div>
                        )}
                      </div>
                    )}
                    {resource.files.map((file) => (
                      <div key={file.id} className="bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between p-3 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            {file.mime === 'application/pdf' ? (
                              <FileText className="w-5 h-5 text-red-600" />
                            ) : file.mime && file.mime.startsWith('image/') ? (
                              <Image className="w-5 h-5 text-blue-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-600" />
                            )}
                            <div>
                              <span className="font-medium">{file.original_filename}</span>
                              <p className="text-xs text-gray-500 capitalize">{file.mime?.split('/')[1] || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isTextFile(file) && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => loadTextFileContent(file)}
                                disabled={loadingTextFile[file.id]}
                                className="hover:bg-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                {loadingTextFile[file.id] ? 'Loading...' : 'View'}
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(file)}
                              className="hover:bg-white"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                        
                        {/* Text file content display */}
                        {isTextFile(file) && textFileContents[file.id] && (
                          <div className="border-t border-gray-200 p-4">
                            <div className="bg-white rounded border">
                              <div className="flex items-center justify-between p-2 border-b bg-gray-50">
                                <span className="text-sm font-medium text-gray-700">File Content</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setTextFileContents(prev => {
                                    const newState = { ...prev }
                                    delete newState[file.id]
                                    return newState
                                  })}
                                  className="h-6 w-6 p-0"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </Button>
                              </div>
                              <pre className="p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-gray-800">
                                {textFileContents[file.id]}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* AI Practice Content */}
        {aiDerivative?.status === 'ready' && aiDerivative.structured_json && (
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">AI Practice Questions</h2>
              <p className="text-gray-600">
                {aiDerivative.summary || 'Interactive practice questions generated from the uploaded material.'}
              </p>
            </div>
            
            <PracticeView
              structured={aiDerivative.structured_json}
              onSuggestFix={user ? handleSuggestFix : undefined}
            />
          </div>
        )}

        {/* Blocked Content */}
        {aiDerivative?.status === 'blocked' && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This resource has been blocked for policy reasons: {aiDerivative.reasons?.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Processing Status */}
        {aiDerivative?.status === 'pending' && (
          <Alert className="mb-6">
            <AlertDescription>
              AI is currently processing this resource to generate practice questions. Check back soon!
            </AlertDescription>
          </Alert>
        )}

        <Separator className="my-6" />

        {/* Comments Section */}
        <div id="comments">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-xl font-semibold">
              Discussion ({comments.length})
            </h2>
          </div>

          <CommentThread
            comments={comments}
            resourceId={resourceId}
            onAddComment={handleAddComment}
            currentUser={user}
            // @ts-ignore
            onVote={handleCommentVote}
          />
        </div>
      </main>
    </div>
  )
}
