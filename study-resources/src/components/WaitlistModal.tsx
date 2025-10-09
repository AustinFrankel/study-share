'use client'

import { useState } from 'react'
import { X, Bell, CheckCircle, Clock, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
  testName: string
  testDate: Date
  onJoinWaitlist: (email: string, phone?: string) => Promise<void>
}

export default function WaitlistModal({ 
  isOpen, 
  onClose, 
  testName, 
  testDate, 
  onJoinWaitlist 
}: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    try {
      await onJoinWaitlist(email.trim(), phone.trim())
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
        setEmail('')
        setPhone('')
      }, 2000)
    } catch (error) {
      console.error('Error joining waitlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Join Waitlist</h2>
              <p className="text-purple-100 text-sm">{testName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">You're on the list!</h3>
              <p className="text-gray-600">
                We'll notify you when {testName} practice materials are available.
              </p>
            </div>
          ) : (
            <>
              {/* Test Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{testDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p className="text-sm text-gray-600">Practice materials coming soon</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Early access to practice questions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-blue-500" />
                    Join the community discussion
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bell className="w-4 h-4 text-green-500" />
                    Get notified when materials are ready
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Join Waitlist
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                We'll never spam you. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
