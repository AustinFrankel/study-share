'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowUp, ArrowDown, MessageCircle, Clock, User, GraduationCap, BookOpen, FileImage, Image as ImageIcon, MoreVertical, Trash2, Lock } from 'lucide-react'
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

  const firstImageFile = resource.files?.find(file => {
    const mime = file.mime || (file as any).type || ''
    const name = (file.original_filename || '').toLowerCase()
    return (
      (typeof mime === 'string' && mime.startsWith('image/')) ||
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)
    )
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
    || 'Unknown User'

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
              {/* Blurred background that fills entire space */}
              <img
                src={`/api/file/${firstImageFile.id}`}
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105"
                style={{ zIndex: 0 }}
                onError={() => setPreviewError(true)}
              />
              {/* If not gated or user is logged in, show the crisp foreground image; otherwise keep it blurred-only */}
              {(!blurredPreview || currentUserId) && (
                <img
                  src={`/api/file/${firstImageFile.id}`}
                  alt={resource.title}
                  className="relative w-full h-full object-contain"
                  style={{ zIndex: 1 }}
                  onError={() => setPreviewError(true)}
                />
              )}
            </>
          ) : firstPdfFile && !previewError ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
              <div className="text-center">
                <svg className="w-14 h-14 mx-auto mb-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-red-700">PDF Document</span>
              </div>
            </div>
          ) : (
            // Generic placeholder if there is no visual asset or loading failed
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
              <div className="text-center text-gray-600">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
                <span className="text-xs font-medium">Preview unavailable</span>
              </div>
            </div>
          )}

          {/* Common gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none"
            style={{ zIndex: 2 }}
          />

          {/* If blurredPreview is true, show a lock/blur overlay hint so users know it's gated */}
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
            {resource.files && resource.files.length > 0 && (
              <span className="flex items-center gap-1 text-xs">
                {firstImageFile ? <ImageIcon className="w-3 h-3" /> : <FileImage className="w-3 h-3" />}
                {resource.files.length}
              </span>
            )}
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
