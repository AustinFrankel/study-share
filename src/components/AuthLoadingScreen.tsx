'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'

export default function AuthLoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Initializing...')

  useEffect(() => {
    const messages = [
      'Initializing...',
      'Connecting to server...',
      'Setting up your account...',
      'Almost ready...'
    ]

    let currentIndex = 0
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 5, 95)
        
        // Update message based on progress
        const messageIndex = Math.floor(newProgress / 25)
        if (messageIndex !== currentIndex && messageIndex < messages.length) {
          currentIndex = messageIndex
          setMessage(messages[messageIndex])
        }
        
        return newProgress
      })
    }, 200)

    // Auto-complete after 15 seconds (should not happen normally)
    const timeout = setTimeout(() => {
      setProgress(100)
      setMessage('Ready!')
    }, 15000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Logo/Icon */}
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <div className="text-white text-2xl font-bold">SS</div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Share</h1>
              <p className="text-gray-600 text-sm">Setting up your account</p>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">{message}</div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-gray-500 mt-2">{progress}% complete</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
              <p>Please wait while we prepare your personalized study environment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
