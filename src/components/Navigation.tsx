'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { signInWithEmail, signInWithGoogle, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { Search, Upload, User, LogOut, Home, Bell } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Navigation() {
  const { user, loading, session } = useAuth()
  const router = useRouter()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [email, setEmail] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  // Handle redirect after successful authentication
  useEffect(() => {
    if (user && pendingRedirect) {
      console.log('Redirecting to:', pendingRedirect)
      router.push(pendingRedirect)
      setPendingRedirect(null)
      setShowAuthDialog(false)
    }
  }, [user, pendingRedirect, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')

    const { error } = await signInWithEmail(email)
    
    if (error) {
      setAuthMessage(error.message)
    } else {
      setAuthMessage('Check your email for the login link!')
    }
    
    setAuthLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    setAuthMessage('')
    const { error } = await signInWithGoogle()
    if (error) setAuthMessage(error.message)
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    setShowSignOutConfirm(false)
    await signOut()
  }

  const handleProfileClick = () => {
    if (user) {
      // User is authenticated, go directly to profile
      router.push('/profile')
    } else {
      // User needs to sign in, set redirect and show auth dialog
      setPendingRedirect('/profile')
      setShowAuthDialog(true)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-indigo-100 bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo - Always show full name */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group" aria-label="StudyShare Home">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black p-1.5 sm:p-2 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg flex items-center justify-center" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
              </div>
              <span className="font-bold text-lg sm:text-xl transition-all duration-200 group-hover:scale-105">Study Share</span>
            </Link>
          </div>

          {/* Navigation Buttons - Better spacing */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
            {/* Upload button - Icon only on mobile with tooltip */}
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 sm:h-10 px-3 sm:px-5 text-sm font-medium transition-all duration-200 hover:scale-105" title="Upload study materials">
              <Link href="/upload" aria-label="Upload study materials">
                <Upload className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Upload</span>
                <span className="sr-only sm:hidden">Upload study materials</span>
              </Link>
            </Button>

            {/* Browse button - subtle text hover effect with scale */}
            <Button asChild variant="ghost" className="h-9 sm:h-10 px-3 sm:px-5 text-sm font-medium hover:bg-transparent hover:text-indigo-600 transition-all duration-200 hover:scale-110">
              <Link href="/browse" aria-label="Browse all study resources">Browse</Link>
            </Button>

            {/* Live button - subtle text hover effect with scale */}
            <Button asChild variant="ghost" className="h-9 sm:h-10 px-3 sm:px-5 text-sm font-medium hover:bg-transparent hover:text-indigo-600 transition-all duration-200 hover:scale-110">
              <Link href="/live" aria-label="View live study sessions">
                Live
              </Link>
            </Button>

            {/* Profile Section - Just avatar button, visually appealing */}
            {loading ? (
              <Button variant="ghost" disabled className="h-10 w-10 rounded-full p-0" aria-label="Loading user profile">
                <div className="w-4 h-4 animate-spin border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
              </Button>
            ) : user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-transparent ring-2 ring-transparent hover:ring-indigo-200 transition-all duration-200 hover:scale-110" aria-label="Open user menu">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} alt={`${user.handle} profile picture`} />}
                        <AvatarFallback className="text-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                          {user.handle.split('-').map(w => w[0]).join('').toUpperCase().slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user.handle}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-600">
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-600">
                      <Link href="/profile">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowSignOutConfirm(true) } className="cursor-pointer transition-colors duration-200 hover:bg-red-50 hover:text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sign Out Confirmation Dialog */}
                <Dialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Sign Out</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to sign out?</p>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button variant="outline" onClick={() => setShowSignOutConfirm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700">
                        Sign Out
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : session ? (
              /* User has session but no user data yet - show loading state */
              <Button variant="ghost" disabled className="h-9 w-9 sm:h-10 sm:w-auto p-0 sm:px-4">
                <User className="w-4 h-4 sm:mr-2" />
                <div className="hidden sm:block w-3 h-3 animate-spin border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
              </Button>
            ) : (
              /* No session - show circular profile button that triggers auth */
              <>
                <Button onClick={handleProfileClick} variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-transparent ring-2 ring-transparent hover:ring-indigo-200 transition-all duration-200 hover:scale-110" aria-label="Sign in to view profile">
                  <Avatar className="w-10 h-10 border-2 border-gray-300 shadow-md">
                    <AvatarFallback className="text-sm bg-gradient-to-br from-gray-400 to-gray-500 text-white">
                      <User className="w-5 h-5" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
                <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                  <DialogContent className="max-w-md mx-auto w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto my-auto">
                    <DialogHeader>
                      <div className="flex flex-col items-center gap-3 mb-2">
                        <div className="w-16 h-16 rounded-full bg-black p-3 shadow-lg flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
                            <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                          </svg>
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl text-center">Sign in to Study Share</DialogTitle>
                      </div>
                    </DialogHeader>
                    <form onSubmit={handleSignIn} className="space-y-4 pt-2">
                      <div>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12 text-base"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold" disabled={authLoading}>
                        {authLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send Magic Link'
                        )}
                      </Button>
                      
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-2 hover:bg-gray-50 hover:border-gray-300 h-12 font-medium transition-all" 
                        onClick={handleGoogleSignIn}
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 animate-spin border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-gray-700">Continue with Google</span>
                          </div>
                        )}
                      </Button>
                      {authMessage && (
                        <p className={`text-sm text-center ${authMessage.includes('error') || authMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                          {authMessage}
                        </p>
                      )}
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
