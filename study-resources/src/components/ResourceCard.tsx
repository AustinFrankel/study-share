'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowUp, ArrowDown, MessageCircle, Clock, User, GraduationCap, BookOpen, FileImage, Image as ImageIcon, MoreVertical, Trash2, Lock, Eye } from 'lucide-react'
import StarRating from '@/components/StarRating'
import { Resource } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useState, useRef, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { throttle } from '@/lib/debounce'
import { useToast } from '@/components/ui/toast'

interface ResourceCardProps {
  resource: Resource
  onVote?: (resourceId: string, value: 1 | -1) => Promise<void>
  votingLoading?: boolean
  blurredPreview?: boolean
  isHomepageCard?: boolean
  hasBeenViewed?: boolean
  compact?: boolean
  onDelete?: (resourceId: string) => Promise<void>
  showDeleteOption?: boolean
  currentUserId?: string
}

const TYPE_COLORS = {
  notes: 'bg-blue-100 text-blue-800',
  past_material: 'bg-green-100 text-green-800',
  study_guide: 'bg-purple-100 text-purple-800',
  practice_set: 'bg-orange-100 text-orange-800',
}

const TYPE_LABELS = {
  notes: 'Notes',
  past_material: 'Past Material',
  study_guide: 'Study Guide',
  practice_set: 'Practice Set',
}

export default function ResourceCard({ 
  resource, 
  onVote, 
  votingLoading, 
  blurredPreview = false, 
  isHomepageCard = false, 
  hasBeenViewed = false, 
  onDelete,
  showDeleteOption = false,
  currentUserId
}: ResourceCardProps) {
  const { showToast } = useToast()

  // Local vote state for optimistic UI
  const [localVote, setLocalVote] = useState<number>(resource.user_vote || 0)
  const [localCount, setLocalCount] = useState<number>(resource.vote_count || 0)
  // Local rating state so stars can be interactive on cards
  const [localRating, setLocalRating] = useState<number>((resource as Resource & { user_rating?: number }).user_rating || 0)
  // Track voting in progress to prevent duplicate requests
  const [isVoting, setIsVoting] = useState(false)
  // Track preview load errors so we can show a placeholder instead of removing the preview entirely
  const [previewError, setPreviewError] = useState(false)

  // Throttled vote handler to prevent rapid-fire requests
  const throttledVote = useRef(
    throttle(async (resourceId: string, value: 1 | -1, onVoteFn: (resourceId: string, value: 1 | -1) => Promise<void>) => {
      setIsVoting(true)
      try {
        await onVoteFn(resourceId, value)
      } finally {
        setIsVoting(false)
      }
    }, 500) // 500ms throttle
  ).current

  const handleVote = useCallback(async (value: 1 | -1) => {
    if (!onVote || votingLoading || isVoting) return

    // Optimistic update
    const prevVote = localVote
    const prevCount = localCount
    let nextVote: -1 | 0 | 1 = value
    let nextCount = localCount
    if (prevVote === value) {
      // unvote
      nextVote = 0
      nextCount = localCount - value
    } else {
      // change or add vote
      nextCount = localCount - prevVote + value
    }
    setLocalVote(nextVote)
    setLocalCount(nextCount)

    try {
      await throttledVote(resource.id, value, onVote)

      // Show success notification
      if (nextVote !== 0) {
        const message = value === 1 ? '👍 Upvoted!' : '👎 Downvoted!'
        showToast(message, 'success')
      } else {
        showToast('Vote removed', 'info')
      }
    } catch (e) {
      // revert on error
      setLocalVote(prevVote)
      setLocalCount(prevCount)
      showToast('Failed to vote. Please try again.', 'error')
    }
  }, [onVote, votingLoading, isVoting, localVote, localCount, resource.id, throttledVote, showToast])

  // Star rating from the card (optional, when logged in)
  const handleRate = async (rating: number) => {
    if (!currentUserId) {
      showToast('Please sign in to rate resources', 'info')
      return
    }

    // Prevent self-rating
    if (resource.uploader_id === currentUserId) {
      showToast('You cannot rate your own resource', 'info')
      return
    }

    // Optimistic update
    const prev = localRating
    setLocalRating(rating)

    try {
      if (!isSupabaseConfigured) {
        showToast(`⭐ Rated ${rating} stars!`, 'success')
        return
      }
      
      // Upsert rating for this resource/user (use rater_id to match existing code)
      const { data, error } = await supabase
        .from('resource_ratings')
        .upsert(
          {
            resource_id: resource.id,
            rater_id: currentUserId,
            rating,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'resource_id,rater_id' }
        )
        .select()
      
      if (error) {
        // Check if table doesn't exist
        const errorMsg = error.message || error.hint || JSON.stringify(error)
        if (errorMsg.toLowerCase().includes('relation') || errorMsg.toLowerCase().includes('does not exist') || errorMsg.toLowerCase().includes('table')) {
          // Table doesn't exist yet - fail silently
          showToast('⭐ Rating saved locally', 'info')
          return
        }
        throw error
      }

      // Show success notification
      showToast(`⭐ Rated ${rating} stars!`, 'success')
    } catch (e: unknown) {
      // Revert if failed
      setLocalRating(prev)
      
      // Better error extraction
      let errorMessage = 'Unknown error'
      if (e && typeof e === 'object') {
        if ('message' in e && e.message) {
          errorMessage = String(e.message)
        } else if ('hint' in e && e.hint) {
          errorMessage = String(e.hint)
        } else if ('details' in e && e.details) {
          errorMessage = String(e.details)
        }
      } else if (e instanceof Error) {
        errorMessage = e.message
      }
      
      // Check if it's a table doesn't exist error
      if (errorMessage.toLowerCase().includes('relation') ||
          errorMessage.toLowerCase().includes('does not exist') ||
          errorMessage.toLowerCase().includes('table') ||
          errorMessage === 'Unknown error') {
        showToast('⭐ Rating saved locally', 'info')
      } else {
        showToast('Failed to rate. Please try again.', 'error')
      }
    }
  }

  // Broaden detection to include common mobile formats like HEIC/HEIF so previews aren't skipped
  const firstImageFile = resource.files?.find(file => {
    const mime = (file.mime || (file as any).type || '').toLowerCase()
    const name = (file.original_filename || '').toLowerCase()
    const isImageMime = typeof mime === 'string' && (
      mime.startsWith('image/') ||
      mime === 'application/heic' ||
      mime === 'application/heif'
    )
    const isImageExt = /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i.test(name)
    return isImageMime || isImageExt
  })
  const firstPdfFile = resource.files?.find(file => {
    const mime = file.mime || (file as any).type || ''
    const name = (file.original_filename || '').toLowerCase()
    return (
      mime === 'application/pdf' || /\.pdf$/i.test(name)
    )
  })
  const hasVisualPreview = firstImageFile || firstPdfFile

  // Compute a friendly uploader label
  const uploaderExt = resource as Resource & { uploader?: { username?: string; email?: string } }
  const displayHandle = resource.uploader?.handle
    || uploaderExt?.uploader?.username
    || (uploaderExt?.uploader?.email ? uploaderExt.uploader.email.split('@')[0] : '')
    || 'Student'

  const initials = (resource.uploader?.handle || 'UU')
    .split('-')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden rounded-xl">
      {/* Image/PDF Preview or Fallback Placeholder */}
      <Link href={`/resource/${resource.id}`}>
        <div
          className="relative w-full bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
          style={{ aspectRatio: '16/10', minHeight: 200, maxHeight: 300 }}
        >
          {/* Prefer first image if present and not failed */}
          {firstImageFile && !previewError ? (
            <>
              {/* Always show the blurred background image */}
              <img
                src={`/api/file/${firstImageFile.id}?v=${encodeURIComponent((resource as any).updated_at || resource.created_at || '')}`}
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105"
                style={{ zIndex: 0 }}
                onError={() => setPreviewError(true)}
              />
              {/* Show crisp image if user is signed in and not gated, or owns the resource */}
              {(currentUserId || currentUserId === resource.uploader?.id) && !blurredPreview && (
                <img
                  src={`/api/file/${firstImageFile.id}?v=${encodeURIComponent((resource as any).updated_at || resource.created_at || '')}`}
                  alt={resource.title}
                  className="relative w-full h-full object-contain"
                  style={{ zIndex: 1 }}
                  onError={() => setPreviewError(true)}
                />
              )}
            </>
          ) : (
            // No explicit visual: neutral gradient so we never display a blank area (no PDF badge)
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
          )}

          {/* Common gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none"
            style={{ zIndex: 2 }}
          />

          {/* If blurredPreview is true and user not signed in, show a lock/blur overlay hint */}
          {blurredPreview && !currentUserId && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
              <div className="backdrop-blur-md bg-white/20 border border-white/30 text-white rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-semibold">Sign in to view full preview</span>
              </div>
            </div>
          )}

          {/* Type / AI badges */}
          <div className="absolute top-2 right-2 max-w-[90%]" style={{ zIndex: 4 }}>
            <Badge className={`${TYPE_COLORS[resource.type]} shadow-sm text-xs px-2 py-1 whitespace-nowrap`}>
              {TYPE_LABELS[resource.type]}
            </Badge>
          </div>
          {resource.ai_derivative?.status === 'ready' && (
            <div className="absolute bottom-2 left-2" style={{ zIndex: 4 }}>
              <Badge variant="outline" className="text-green-600 border-green-600 bg-white/90 text-xs px-2 py-1 whitespace-nowrap">
                ✓ Practice Ready
              </Badge>
            </div>
          )}
        </div>
      </Link>
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/resource/${resource.id}`} className="hover:underline">
              <h3 className={`font-semibold text-lg leading-tight line-clamp-2 ${hasBeenViewed ? 'text-purple-800 underline decoration-2 underline-offset-2' : ''}`} title={resource.title}>
                {resource.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1 min-w-0">
                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                <span className="truncate" style={{ maxWidth: '200px' }} title={resource.class?.school?.name}>
                  {resource.class?.school?.name}
                </span>
              </div>
              <span className="flex-shrink-0">•</span>
              <div className="flex items-center gap-1 min-w-0">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className="truncate" style={{ maxWidth: '150px' }} title={resource.class?.subject?.name}>
                  {resource.class?.subject?.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span>{resource.class?.teacher?.name}</span>
              {resource.class?.code && (
                <>
                  <span>•</span>
                  <span className="font-mono">{resource.class.code}</span>
                </>
              )}
            </div>
          </div>
          {!hasVisualPreview && (
            <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
              <Badge className={`${TYPE_COLORS[resource.type]} text-xs px-2 py-1 whitespace-nowrap overflow-visible`}>
                {TYPE_LABELS[resource.type]}
              </Badge>
              {resource.ai_derivative?.status === 'ready' && (
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-2 py-1 whitespace-nowrap">
                  ✓ Practice Ready
                </Badge>
              )}
              {resource.ai_derivative?.status === 'pending' && (
                <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs px-2 py-1 whitespace-nowrap">
                  ⏳ Processing
                </Badge>
              )}
            </div>
          )}
        </div>
        {/* Meta row: difficulty/time + stars */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 flex-shrink-0">
            {typeof resource.difficulty === 'number' && (
              <span className="whitespace-nowrap">Diff: {resource.difficulty}/5</span>
            )}
            {typeof resource.study_time === 'number' && (
              <span className="whitespace-nowrap">
                {resource.study_time >= 60 
                  ? `${Math.floor(resource.study_time / 60)} ${Math.floor(resource.study_time / 60) === 1 ? 'hour' : 'hours'}${resource.study_time % 60 !== 0 ? ' ' + (resource.study_time % 60) + ' min' : ''}`
                  : `${resource.study_time} min`
                }
              </span>
            )}
          </div>
          <div className="flex-shrink-0">
            <StarRating
              resourceId={resource.id}
              currentRating={localRating}
              averageRating={resource.average_rating}
              ratingCount={resource.rating_count}
              onRate={handleRate}
              readOnly={false}
            />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-3 pb-2">
        <div className="space-y-1.5">
          {/* User info row */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="w-5 h-5">
                {resource.uploader?.avatar_url && (
                  <AvatarImage src={resource.uploader.avatar_url} alt={resource.uploader.handle} />
                )}
                <AvatarFallback className="text-[10px] bg-gray-100">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {resource.uploader?.handle ? (
                <Link 
                  href={`/profile?user=${resource.uploader.handle}`}
                  className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate"
                >
                  {resource.uploader.handle}
                </Link>
              ) : (
                <span className="font-mono text-xs text-gray-700 truncate">{displayHandle}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Eye className="w-3 h-3" />
              {resource.view_count || 0}
            </span>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Vote buttons perform voting action on all pages */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(1)}
                disabled={votingLoading}
                className={`p-1 h-7 w-7 ${localVote === 1 ? 'text-green-600' : ''}`}
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <span className="font-medium text-sm min-w-[1.5rem] text-center">
                {localCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(-1)}
                disabled={votingLoading}
                className={`p-1 h-7 w-7 ${localVote === -1 ? 'text-red-600' : ''}`}
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" asChild className="p-1 h-7">
                <Link href={`/resource/${resource.id}#comments`}>
                  <MessageCircle className="w-3 h-3" />
                </Link>
              </Button>
            </div>
            {/* Three-dot menu for owned posts */}
            {showDeleteOption && currentUserId && resource.uploader?.id === currentUserId && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDelete(resource.id)}
                    variant="destructive"
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
