'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import UploadWizard from '@/components/UploadWizard'
import { Button } from '@/components/ui/button'
import { Upload, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth'

export default function UploadPage() {
  const { user, loading, session } = useAuth()
  const router = useRouter()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')

  console.log('UploadPage render:', { user: !!user, loading, session: !!session })

  // Add beforeunload confirmation to prevent users from losing their upload progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = 'You will lose your upload progress. Are you sure you want to leave?'
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </main>
      </div>
    )
  }

  // If we have a session but no user data yet, show loading (user creation in progress)
  if (session && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up your account...</p>
          </div>
        </main>
      </div>
    )
  }

  // Show login form only if we're definitely not authenticated (no loading and no session)
  if (!loading && !session) {
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-indigo-100">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign in to upload</h3>
              <p className="text-gray-600 mb-8">You need to sign in to share your study materials</p>
              <div className="px-8 space-y-4">
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setEmailLoading(true)
                    const form = e.target as HTMLFormElement
                    const email = (form.elements.namedItem('email') as HTMLInputElement).value
                    try {
                      await signInWithEmail(email)
                    } finally {
                      setEmailLoading(false)
                    }
                  }}
                >
                  <Input 
                    name="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    className="text-center"
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={emailLoading}
                  >
                    {emailLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Magic Link'
                    )}
                  </Button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    setGoogleLoading(true)
                    try {
                      await signInWithGoogle()
                    } finally {
                      setGoogleLoading(false)
                    }
                  }}
                  className="w-full border-2 hover:bg-blue-50 hover:border-blue-200 py-3 font-medium"
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 animate-spin border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </div>
                  )}
                </Button>
                <div className="text-xs text-gray-500">We&apos;ll redirect you back here after sign-in</div>
              </div>
              <div className="mt-8 pt-6 border-t">
                <Button variant="ghost" onClick={() => router.push('/')} className="text-indigo-600 hover:text-indigo-700">
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-10">
            <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Upload Your Resources
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your study materials with classmates. Our AI will automatically generate practice questions to help everyone learn better.
            </p>
          </div>

          <UploadWizard onUnsavedChanges={setHasUnsavedChanges} />
      </main>
    </div>
  )
}
