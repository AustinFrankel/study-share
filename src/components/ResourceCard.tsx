'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowUp, ArrowDown, MessageCircle, Clock, User, GraduationCap, BookOpen, FileImage, Image as ImageIcon, MoreVertical, Trash2 } from 'lucide-react'
import StarRating from '@/components/StarRating'
import { Resource } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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
  // Local vote state for optimistic UI
  const [localVote, setLocalVote] = useState<number>(resource.user_vote || 0)
  const [localCount, setLocalCount] = useState<number>(resource.vote_count || 0)
  // Local rating state so stars can be interactive on cards
  const [localRating, setLocalRating] = useState<number>((resource as any).user_rating || 0)

  const handleVote = async (value: 1 | -1) => {
    if (onVote && !votingLoading) {
      // optimistic update
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
        await onVote(resource.id, value)
      } catch (e) {
        // revert on error
        setLocalVote(prevVote)
        setLocalCount(prevCount)
      }
    }
  }

  // Star rating from the card (optional, when logged in)
  const handleRate = async (rating: number) => {
    if (!currentUserId) return
    // Optimistic update
    const prev = localRating
    setLocalRating(rating)
    try {
      if (!isSupabaseConfigured) return
      // Upsert rating for this resource/user (use rater_id to match existing code)
      const { error } = await supabase
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
      if (error) throw error
    } catch (e) {
      // Revert if failed
      setLocalRating(prev)
      console.error('Failed to rate resource:', e)
    }
  }

  const firstImageFile = resource.files?.find(file => file.mime && file.mime.startsWith('image/'))
  const firstPdfFile = resource.files?.find(file => file.mime && file.mime === 'application/pdf')
  const hasVisualPreview = firstImageFile || firstPdfFile

  // Compute a friendly uploader label
  const displayHandle = resource.uploader?.handle
    || (resource as any)?.uploader?.username
    || ((resource as any)?.uploader?.email ? (resource as any).uploader.email.split('@')[0] : '')
    || 'Unknown User'

  return (
    <Card className="hover:shadow-md transition-shadow overflow-visible rounded-xl">
      {/* Image/PDF Preview - Only show if image or PDF exists */}
      {hasVisualPreview && (
        <Link href={`/resource/${resource.id}`}>
          <div className={`relative w-full bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden rounded-t-xl ${firstImageFile ? '' : 'h-40'}`} style={firstImageFile ? { paddingBottom: '56.25%' } : undefined}>
            {firstImageFile ? (
              <img
                src={`/api/file/${firstImageFile.id}`}
                alt={resource.title}
                className={`absolute inset-0 w-full h-full object-cover ${blurredPreview ? 'filter blur-sm scale-105' : ''}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : firstPdfFile ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                <div className="text-center">
                  <svg className="w-14 h-14 mx-auto mb-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-red-700">PDF Document</span>
                </div>
              </div>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-2 right-2 max-w-[90%] z-10">
              <Badge className={`${TYPE_COLORS[resource.type]} shadow-sm text-xs px-2 py-1 whitespace-nowrap`}>
                {TYPE_LABELS[resource.type]}
              </Badge>
            </div>
            {resource.ai_derivative?.status === 'ready' && (
              <div className="absolute bottom-2 left-2 z-10">
                <Badge variant="outline" className="text-green-600 border-green-600 bg-white/90 text-xs px-2 py-1 whitespace-nowrap">
                  ✓ Practice Ready
                </Badge>
              </div>
            )}
          </div>
        </Link>
      )}
      
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
                  ? `${Math.floor(resource.study_time / 60)}h ${resource.study_time % 60 === 0 ? '' : ' ' + (resource.study_time % 60) + 'm'}`
                  : `${resource.study_time}min`
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
              onRate={currentUserId ? handleRate : undefined}
              readOnly={!currentUserId}
            />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-3 pb-2">
        <div className="space-y-1.5">
          {/* User info row */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 flex-shrink-0" />
              {resource.uploader?.handle ? (
                <Link 
                  href={`/profile?user=${resource.uploader.handle}`}
                  className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {resource.uploader.handle}
                </Link>
              ) : (
                <span className="font-mono text-xs text-gray-700">{displayHandle}</span>
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
