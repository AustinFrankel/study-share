'use client'

import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  resourceId: string
  currentVote?: number
  voteCount: number
  onVote: (value: 1 | -1) => Promise<void>
  loading?: boolean
  className?: string
}

export default function VoteButton({
  resourceId,
  currentVote,
  voteCount,
  onVote,
  loading = false,
  className
}: VoteButtonProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVote(1)}
        disabled={loading}
        className={cn(
          "p-1 h-7 w-7 rounded-full",
          currentVote === 1 
            ? "text-green-600 bg-green-50 hover:bg-green-100" 
            : "hover:text-green-600 hover:bg-green-50"
        )}
      >
        <ArrowUp className="w-3 h-3" />
      </Button>
      
      <span className={cn(
        "font-medium text-sm min-w-[2rem] text-center px-2",
        voteCount > 0 ? "text-green-600" : 
        voteCount < 0 ? "text-red-600" : 
        "text-gray-600"
      )}>
        {voteCount}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVote(-1)}
        disabled={loading}
        className={cn(
          "p-1 h-7 w-7 rounded-full",
          currentVote === -1 
            ? "text-red-600 bg-red-50 hover:bg-red-100" 
            : "hover:text-red-600 hover:bg-red-50"
        )}
      >
        <ArrowDown className="w-3 h-3" />
      </Button>
    </div>
  )
}
