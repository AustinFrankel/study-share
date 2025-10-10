'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface StarRatingProps {
  resourceId: string
  currentRating?: number
  averageRating?: number
  ratingCount?: number
  onRate?: (rating: number) => Promise<void>
  loading?: boolean
  readOnly?: boolean
  className?: string
}

export default function StarRating({
  resourceId,
  currentRating,
  averageRating,
  ratingCount = 0,
  onRate,
  loading = false,
  readOnly = false,
  className
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRate = async (rating: number) => {
    if (!onRate || readOnly || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onRate(rating)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = averageRating || 0
  const isInteractive = !readOnly && onRate && !loading

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = readOnly 
            ? star <= displayRating
            : hoveredRating 
              ? star <= hoveredRating 
              : currentRating 
                ? star <= currentRating
                : star <= displayRating

          return (
            <Button
              key={star}
              variant="ghost"
              size="sm"
              className={cn(
                "p-0 h-auto w-auto rounded-none hover:bg-transparent",
                isInteractive && "cursor-pointer",
                !isInteractive && "cursor-default"
              )}
              onClick={() => isInteractive && handleRate(star)}
              onMouseEnter={() => isInteractive && setHoveredRating(star)}
              onMouseLeave={() => isInteractive && setHoveredRating(0)}
              disabled={loading || isSubmitting || readOnly}
            >
              <Star
                className={cn(
                  "w-5 h-5 transition-colors",
                  isFilled
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300",
                  isInteractive && hoveredRating >= star && "text-yellow-400 fill-yellow-400"
                )}
                strokeWidth={2.5}
              />
            </Button>
          )
        })}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {averageRating !== undefined && (
          <span className="font-medium">
            {averageRating.toFixed(1)}
          </span>
        )}
        {ratingCount > 0 && (
          <span className="text-gray-500">
            ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
          </span>
        )}
      </div>
    </div>
  )
}
