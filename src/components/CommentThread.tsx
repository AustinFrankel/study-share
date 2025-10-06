'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Comment, User } from '@/lib/types'
import { containsProfanity } from '@/lib/profanity-filter'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MessageCircle, Reply, ChevronUp, ChevronDown, User as UserIcon, Trophy, Calendar, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import CommentFlagButton from './CommentFlagButton'

interface CommentThreadProps {
  comments: Comment[]
  resourceId: string
  currentUser?: User | null
  onAddComment: (body: string, parentId?: string) => Promise<void>
}

interface CommentItemProps {
  comment: Comment
  currentUser?: User | null
  onReply?: (body: string, parentId: string) => Promise<void>
  onVote?: (commentId: string, value: 1 | -1) => Promise<void>
  depth?: number
}

function CommentItem({ comment, currentUser, onReply, onVote, depth = 0 }: CommentItemProps) {
  const [showUserProfile, setShowUserProfile] = useState(false)

  const UserProfile = ({ user }: { user: User }) => (
    <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.handle} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-lg">
                  {user.handle.split('-').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-mono font-semibold">{user.handle}</h2>
              <p className="text-sm text-gray-600 font-normal">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">Active</div>
              <div className="text-xs text-gray-600">Member</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-600">Contributing</div>
              <div className="text-xs text-gray-600">Community</div>
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-sm text-gray-600">
              Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleReply = async () => {
    if (!onReply || !replyText.trim()) return

    setIsSubmitting(true)
    try {
      await onReply(replyText.trim(), comment.id)
      setReplyText('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Error replying:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (handle: string) => {
    return handle.split('-').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <button 
              onClick={() => comment.author && setShowUserProfile(true)}
              className={`${comment.author ? 'hover:opacity-75 transition-opacity cursor-pointer' : 'cursor-default'}`}
              disabled={!comment.author}
            >
              <Avatar className="w-8 h-8">
                {comment.author?.avatar_url && (
                  <AvatarImage src={comment.author.avatar_url} alt={comment.author.handle} />
                )}
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {comment.author ? getInitials(comment.author.handle) : '?'}
                </AvatarFallback>
              </Avatar>
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {comment.author?.handle ? (
                  <Link 
                    href={`/profile?user=${comment.author.handle}`}
                    className="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {comment.author.handle}
                  </Link>
                ) : (
                  <span className="font-mono text-sm font-medium text-gray-600">Anonymous</span>
                )}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                {depth > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-6 w-6 p-0"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronUp className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="text-sm text-gray-900 mb-3 whitespace-pre-wrap">
                    {comment.body}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {onVote && (
                      <div className="flex items-center gap-1 mr-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1 h-7 w-7 rounded-full ${
                            (comment as Comment & { user_vote?: number }).user_vote === 1
                              ? 'text-green-600 bg-green-50 hover:bg-green-100'
                              : 'hover:text-green-600 hover:bg-green-50'
                          }`}
                          onClick={() => onVote(comment.id, 1)}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <span className={`text-xs font-medium min-w-[1.5rem] text-center px-2 ${
                          ((comment as Comment & { vote_count?: number }).vote_count || 0) > 0 ? 'text-green-600' :
                          ((comment as Comment & { vote_count?: number }).vote_count || 0) < 0 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {(comment as Comment & { vote_count?: number }).vote_count || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1 h-7 w-7 rounded-full ${
                            (comment as Comment & { user_vote?: number }).user_vote === -1
                              ? 'text-red-600 bg-red-50 hover:bg-red-100'
                              : 'hover:text-red-600 hover:bg-red-50'
                          }`}
                          onClick={() => onVote(comment.id, -1)}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {currentUser && onReply && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="text-xs h-7"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    )}
                    {currentUser && (
                      <CommentFlagButton 
                        commentId={comment.id} 
                        className="text-xs h-6"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Reply Form */}
          {showReplyForm && !isCollapsed && (
            <div className="mt-4 ml-11 space-y-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleReply}
                  disabled={!replyText.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyText('')
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
              onVote={onVote}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
      
      {comment.author && <UserProfile user={comment.author} />}
    </div>
  )
}

export default function CommentThread({ 
  comments, 
  resourceId, 
  currentUser, 
  onAddComment 
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked' | 'least_liked'>('newest')

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (body: string, parentId: string) => {
    try {
      await onAddComment(body, parentId)
    } catch (error) {
      console.error('Error replying to comment:', error)
      throw error
    }
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setNewComment(text)
  }

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'most_liked') {
      const votesA = (a as Comment & { vote_count?: number }).vote_count || 0
      const votesB = (b as Comment & { vote_count?: number }).vote_count || 0
      if (votesA !== votesB) return votesB - votesA
      // Secondary sort by newest if votes are equal
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    } else if (sortBy === 'least_liked') {
      const votesA = (a as Comment & { vote_count?: number }).vote_count || 0
      const votesB = (b as Comment & { vote_count?: number }).vote_count || 0
      if (votesA !== votesB) return votesA - votesB
      // Secondary sort by newest if votes are equal
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    } else {
      // Date-based sorting
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    }
  })

  // For now, we'll treat all comments as top-level
  // In a full implementation, you'd implement proper threading
  const topLevelComments = sortedComments

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {currentUser ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={handleCommentChange}
                rows={4}
                className="resize-none"
              />
              
              {containsProfanity(newComment) && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Your comment may contain inappropriate content. Please review before posting.
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Be respectful and helpful. Comments are public and permanent.
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Sign in to join the discussion</p>
            <Button variant="outline">Sign In</Button>
          </CardContent>
        </Card>
      )}

      {/* Sort Controls */}
      {comments.length > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-gray-500">Sort by</span>
            <Button 
              variant={sortBy === 'newest' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('newest')}
            >
              Newest
            </Button>
            <Button 
              variant={sortBy === 'oldest' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('oldest')}
            >
              Oldest
            </Button>
            <Button 
              variant={sortBy === 'most_liked' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('most_liked')}
            >
              Most Liked
            </Button>
            <Button 
              variant={sortBy === 'least_liked' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('least_liked')}
            >
              Least Liked
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <CommentItem 
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            onReply={handleReply}
            onVote={(window as Window & { _handleCommentVote?: (commentId: string, value: 1 | -1) => Promise<void> })._handleCommentVote}
          />
        ))}
        {topLevelComments.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-8">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  )
}
