'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { signInWithEmail, signInWithGoogle, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { Search, Upload, User, LogOut, Home, Bell } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

export default function Navigation() {
  const { user, loading, session } = useAuth()
  const router = useRouter()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [email, setEmail] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)
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
    <nav className="sticky top-0 z-50 border-b border-indigo-100 bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo - Always show full name */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              <span className="font-bold text-lg sm:text-xl">Study Share</span>
            </Link>
          </div>

          {/* Navigation Buttons - Better spacing */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
            {/* Upload button - Icon only on mobile */}
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 sm:h-9 px-2.5 sm:px-4 text-sm">
              <Link href="/upload">
                <Upload className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Upload</span>
              </Link>
            </Button>

            {/* Browse button - distinct color */}
            <Button asChild className="bg-black hover:bg-neutral-900 text-white h-8 sm:h-9 px-2.5 sm:px-4 text-sm">
              <Link href="/browse">Browse</Link>
            </Button>

            {/* Live button */}
            <Button asChild variant="outline" className="border-indigo-200 hover:bg-indigo-50 h-8 sm:h-9 px-2.5 sm:px-4 text-sm">
              <Link href="/live">
                Live
              </Link>
            </Button>

            {/* Notification Dropdown - Only show for authenticated users */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 sm:h-9 sm:w-9 p-0">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markAllAsRead}
                          className="text-xs h-auto p-1"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-4">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-2 rounded text-sm cursor-pointer hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                            }`}
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id)
                              }
                              if (notification.resource_id) {
                                router.push(`/resource/${notification.resource_id}`)
                              }
                            }}
                          >
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-gray-600 mt-1">{notification.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Profile Section - Icon only on mobile, handle on desktop */}
            {loading ? (
              <Button variant="ghost" disabled className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-4">
                <div className="w-4 h-4 animate-spin border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-0 sm:space-x-2 h-8 sm:h-9 px-2 sm:px-4">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden md:inline font-mono text-sm">{user.handle}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : session ? (
              /* User has session but no user data yet - show loading state */
              <Button variant="ghost" disabled className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-4">
                <User className="w-4 h-4 sm:mr-2" />
                <div className="hidden sm:block w-3 h-3 animate-spin border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
              </Button>
            ) : (
              /* No session - show profile button that triggers auth */
              <>
                <Button onClick={handleProfileClick} className="h-8 sm:h-9 px-3 sm:px-4 text-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                  <User className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                  <DialogContent className="max-w-md mx-4 sm:mx-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">Sign in to Study Share</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={authLoading}>
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
                        className="w-full border-2 hover:bg-gray-50 hover:border-gray-300 py-3 h-12 font-medium transition-all" 
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
                        <p className={`text-sm ${authMessage.includes('error') || authMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
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
