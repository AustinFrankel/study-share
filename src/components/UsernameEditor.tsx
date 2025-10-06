'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Edit, Save, X, Shuffle, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { regenerateHandle } from '@/lib/auth'

interface UsernameEditorProps {
  userId: string
  currentHandle: string
  onHandleUpdated: () => void
}

export default function UsernameEditor({ userId, currentHandle, onHandleUpdated }: UsernameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newHandle, setNewHandle] = useState('')
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleStartEdit = () => {
    setIsEditing(true)
    setNewHandle(currentHandle)
    setMessage(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setNewHandle('')
    setMessage(null)
  }

  const validateHandle = (handle: string): string | null => {
    if (!handle || handle.trim().length < 3) {
      return 'Username must be at least 3 characters long'
    }
    if (handle.length > 20) {
      return 'Username must be 20 characters or less'
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(handle)) {
      return 'Username can only contain letters, numbers, hyphens, and underscores'
    }
    return null
  }

  const handleSaveCustomHandle = async () => {
    const trimmedHandle = newHandle.trim()
    
    // Validate
    const validationError = validateHandle(trimmedHandle)
    if (validationError) {
      setMessage({ type: 'error', text: validationError })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // Check if handle is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('handle', trimmedHandle)
        .neq('id', userId)
        .single()

      if (existingUser) {
        setMessage({ type: 'error', text: 'This username is already taken' })
        setSaving(false)
        return
      }

      // Update the handle
      const { error: updateError } = await supabase
        .from('users')
        .update({ handle: trimmedHandle })
        .eq('id', userId)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: 'Username updated successfully!' })
      setIsEditing(false)
      
      // Refresh user data
      setTimeout(() => {
        onHandleUpdated()
        setMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error updating handle:', error)
      setMessage({ type: 'error', text: 'Failed to update username. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateRandom = async () => {
    setRegenerating(true)
    setMessage(null)

    try {
      const { handle, error } = await regenerateHandle(userId)
      
      if (error) throw error

      setMessage({ type: 'success', text: `New username generated: ${handle}` })
      
      // Refresh user data
      setTimeout(() => {
        onHandleUpdated()
        setMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Error regenerating handle:', error)
      setMessage({ type: 'error', text: 'Failed to generate new username. Please try again.' })
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Username Settings
        </CardTitle>
        <CardDescription>
          Your username is how others identify you on Study Share. It appears on all your posts and comments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current username display / Edit mode */}
        {!isEditing ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Username</div>
              <div className="text-xl font-mono font-bold text-gray-900">{currentHandle}</div>
            </div>
            <Button onClick={handleStartEdit} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label htmlFor="custom-handle" className="text-sm font-medium text-gray-700 mb-1 block">
                Enter New Username
              </label>
              <Input
                id="custom-handle"
                type="text"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                placeholder="Enter username..."
                className="font-mono text-base h-12"
                maxLength={20}
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers, hyphens, and underscores only
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveCustomHandle}
                disabled={saving || !newHandle.trim()}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Username
                  </>
                )}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500 font-medium">Or</span>
          </div>
        </div>

        {/* Random generation option */}
        <div className="space-y-3">
          <div className="text-sm text-gray-700">
            Don't like thinking of usernames? Let us generate a random one for you!
          </div>
          <Button
            onClick={handleRegenerateRandom}
            variant="outline"
            className="w-full"
            disabled={regenerating || isEditing}
          >
            {regenerating ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin border-2 border-indigo-600 border-t-transparent rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4 mr-2" />
                Generate Random Username
              </>
            )}
          </Button>
        </div>

        {/* Message display */}
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
