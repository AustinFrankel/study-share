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

  const refreshUser = async (retryCount = 0) => {
    if (isRefreshing) {
      console.log('⏳ User refresh already in progress, skipping')
      return // Prevent concurrent refresh calls
    }
    
    setIsRefreshing(true)
    try {
      console.log('🔄 Refreshing user data... (attempt', retryCount + 1, ')')
      
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
      console.error('❌ Error refreshing user (attempt', retryCount + 1, '):', error)
      
      // Retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 3000)
        console.log(`⏳ Retrying in ${delay}ms...`)
        setIsRefreshing(false)
        await new Promise(resolve => setTimeout(resolve, delay))
        return refreshUser(retryCount + 1)
      }
      
      // After max retries, set user to null to prevent infinite loading
      console.error('❌ Max retries reached, clearing user state')
      setUser(null)
      setLoading(false)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    let mounted = true
    let hasInitialized = false
    
    // Failsafe: ensure loading never stays true forever
    const maxLoadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ Auth loading timeout reached, forcing loading to false')
        setLoading(false)
      }
    }, 12000) // 12 second maximum loading time
    
    const initializeAuth = async () => {
      if (hasInitialized) {
        console.log('⏭️ Auth already initialized, skipping')
        return
      }
      hasInitialized = true
      
      try {
        console.log('🚀 Initializing auth...')
        
        // If Supabase is not configured, check if demo mode is enabled
        if (!isSupabaseConfigured) {
          const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
          if (demoMode && mounted) {
            // Create a demo user for testing (only if explicitly enabled)
            const demoUser: User = {
              id: 'demo-user-' + Date.now(),
              handle: 'demo_user',
              handle_version: 1,
              created_at: new Date().toISOString()
            }
            setUser(demoUser)
            setSession(null)
            setLoading(false)
          } else if (mounted) {
            // No Supabase and demo mode not enabled - no user
            setUser(null)
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
            new Promise<{ data: { session: null }; error: Error | null }>((resolve) =>
              setTimeout(() => resolve({ data: { session: null }, error: null }), 10000)
            )
          ])
        } catch (timeoutError) {
          console.error('Session fetch timeout:', timeoutError)
          sessionResult = { data: { session: null }, error: timeoutError as Error }
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

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null

    if (isSupabaseConfigured) {
      const authResult = supabase.auth.onAuthStateChange(async (event: string, newSession: any) => {
      if (!mounted) return

      console.log('Auth state change:', event, !!newSession)

      // Prevent re-initialization loops - only handle specific events
      if (event === 'INITIAL_SESSION') {
        // Skip INITIAL_SESSION as it's already handled in initializeAuth
        console.log('⏭️ Skipping INITIAL_SESSION event (already handled)')
        return
      }

      // Always update session state
      setSession(newSession)

      if (newSession && event === 'SIGNED_IN') {
        // User just signed in, load user data
        console.log('User signed in, loading user data...')
        await refreshUser()
      } else if (event === 'SIGNED_OUT') {
        // Clear user data on sign out
        console.log('User signed out')
        setUser(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed, no need to reload user data
        console.log('Token refreshed')
        setLoading(false)
      } else if (!newSession) {
        // No session, clear user data
        console.log('No session, clearing user data')
        setUser(null)
        setLoading(false)
      }
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
