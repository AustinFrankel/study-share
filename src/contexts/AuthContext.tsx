'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  refreshUser: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshUser = async () => {
    if (isRefreshing) {
      console.log('⏳ User refresh already in progress, skipping')
      return // Prevent concurrent refresh calls
    }
    
    setIsRefreshing(true)
    try {
      console.log('🔄 Refreshing user data...')
      
      // Add timeout to the entire refresh operation
      const userData = await Promise.race([
        getCurrentUser(),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('User refresh timeout')), 8000)
        )
      ])
      
      console.log('✅ User refresh completed:', userData?.handle || 'no user')
      setUser(userData)
      
      // Ensure loading is false after successful refresh
      setLoading(false)
    } catch (error) {
      console.error('❌ Error refreshing user:', error)
      setUser(null)
      setLoading(false) // Ensure loading is false on error
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    let mounted = true
    
    // Failsafe: ensure loading never stays true forever
    const maxLoadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ Auth loading timeout reached, forcing loading to false')
        setLoading(false)
      }
    }, 12000) // 12 second maximum loading time
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...')
        
        // If Supabase is not configured, use demo mode
        if (!isSupabaseConfigured) {
          console.log('⚠️ Supabase not configured, using demo mode')
          if (mounted) {
            // Create a demo user for testing
            const demoUser: User = {
              id: 'demo-user-' + Date.now(),
              handle: 'demo_user',
              handle_version: 1,
              created_at: new Date().toISOString()
            }
            setUser(demoUser)
            setSession(null)
            setLoading(false)
          }
          return
        }
        
        // Get initial session with timeout
        let sessionResult
        try {
          sessionResult = await Promise.race([
            supabase.auth.getSession(),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
            )
          ])
        } catch (timeoutError) {
          console.error('Session fetch timeout:', timeoutError)
          sessionResult = { data: { session: null }, error: timeoutError }
        }
        
        const { data: { session }, error } = sessionResult
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
          if (mounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          return
        }

        console.log('✅ Initial session:', !!session)
        
        if (mounted) {
          setSession(session)
        }

        if (session && mounted) {
          // Load or create user row
          console.log('👤 Loading user data for authenticated session...')
          await refreshUser()
        } else if (mounted) {
          // No session, make sure user is null and loading is false
          console.log('ℹ️ No session found')
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()
    
    // Clear the timeout if auth completes normally
    const clearMaxTimeout = () => {
      clearTimeout(maxLoadingTimeout)
    }

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null
    
    if (isSupabaseConfigured) {
      const authResult = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state change:', event, !!session)
      
      // Always update session state
      setSession(session)
      
      if (session) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          // User just signed in or we got initial session, load user data
          console.log('User signed in, loading user data...')
          await refreshUser()
        } else if (event !== 'TOKEN_REFRESHED') {
          // For other events (not token refresh), also refresh user if we don't have user data
          if (!user) {
            console.log('Session exists but no user data, loading...')
            await refreshUser()
          }
        }
      } else {
        // No session, clear user data
        console.log('No session, clearing user data')
        setUser(null)
      }
      
      // Always ensure loading is false after auth state change
      setLoading(false)
    })
      subscription = authResult.data.subscription
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
      clearTimeout(maxLoadingTimeout)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
