'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Flag, AlertTriangle } from 'lucide-react'

interface CommentFlagButtonProps {
  commentId: string
  className?: string
}

type CommentFlagReason = 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other'

const COMMENT_FLAG_REASONS: { value: CommentFlagReason; label: string; description: string }[] = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Repetitive, unwanted, or promotional content'
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Contains offensive, vulgar, or inappropriate material'
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Bullying, harassment, or personal attacks'
  },
  {
    value: 'misinformation',
    label: 'Misinformation',
    description: 'Contains false or misleading information'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other violation of community guidelines'
  }
]

export default function CommentFlagButton({ commentId, className }: CommentFlagButtonProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<CommentFlagReason | ''>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!user || !reason) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('comment_flags')
        .insert({
          comment_id: commentId,
          flagger_id: user.id,
          reason,
          notes: notes.trim() || null
        })

      if (error) throw error

      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
        setReason('')
        setNotes('')
      }, 2000)
    } catch (error) {
      console.error('Error flagging comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null // Only show flag button to authenticated users
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={`text-xs h-6 px-2 ${className}`}>
          <Flag className="w-3 h-3 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Report Comment
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Report Submitted
            </h3>
            <p className="text-green-700">
              Thank you for helping keep our community safe. We&apos;ll review this report.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for reporting</Label>
              <Select value={reason} onValueChange={(value: CommentFlagReason) => setReason(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {COMMENT_FLAG_REASONS.map((flagReason) => (
                    <SelectItem key={flagReason.value} value={flagReason.value}>
                      <div>
                        <div className="font-medium">{flagReason.label}</div>
                        <div className="text-sm text-gray-600">{flagReason.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Additional details (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Provide any additional context that might help us understand the issue..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Please report responsibly</p>
                  <p>
                    False reports waste moderator time and may result in restrictions on your account.
                    Only report content that genuinely violates our community guidelines.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
