import { supabase, isSupabaseConfigured } from './supabase'
import { User } from './types'

// Generate random handle components
const ADJECTIVES = [
  'cobalt', 'crimson', 'azure', 'golden', 'silver', 'emerald', 'violet', 'amber',
  'coral', 'jade', 'ruby', 'sapphire', 'pearl', 'bronze', 'platinum', 'onyx'
]

const ANIMALS = [
  'walrus', 'penguin', 'dolphin', 'octopus', 'tiger', 'eagle', 'wolf', 'bear',
  'fox', 'owl', 'shark', 'whale', 'hawk', 'lynx', 'raven', 'falcon'
]

export function generateRandomHandle(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const number = Math.floor(Math.random() * 1000)
  return `${adjective}-${animal}-${number}`
}

export async function signInWithEmail(email: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Authentication not configured. Please set NEXT_PUBLIC_SUPABASE_URL to your Supabase project URL (https://<project>.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Project → Settings → Environment Variables.') }
  }
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${redirectUrl}/auth/callback`
    }
  })
  return { error }
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Authentication not configured. Please set NEXT_PUBLIC_SUPABASE_URL to your Supabase project URL (https://<project>.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Project → Settings → Environment Variables.') }
  }
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${redirectUrl}/auth/callback`
    }
  })
  return { data, error }
}

// Sign in with phone number (Twilio SMS)
export async function signInWithPhone(phone: string) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Authentication not configured. Please set NEXT_PUBLIC_SUPABASE_URL to your Supabase project URL (https://<project>.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Project → Settings → Environment Variables.') }
  }
  // Normalize to E.164 using simple heuristics (expects country code). Example: +14155552671
  const normalized = normalizeToE164(phone)
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: normalized,
    options: {
      channel: 'sms',
      // Supabase forwards to callback for deep linking apps if configured
      // we still set an email-style redirect to satisfy type; ignored for sms
      emailRedirectTo: `${redirectUrl}/auth/callback`
    }
  })
  return { data, error }
}

// Verify phone OTP
export async function verifyPhoneOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalizeToE164(phone),
    token,
    type: 'sms'
  })
  return { data, error }
}

// Minimal E.164 normalization. For US numbers entered as (415) 555-2671 or 4155552671,
// this will convert to +14155552671. If a leading "+" is present, returns as-is.
function normalizeToE164(input: string): string {
  const trimmed = (input || '').trim()
  if (trimmed.startsWith('+')) return trimmed
  // Remove all non-digits
  const digits = trimmed.replace(/\D+/g, '')
  // If user typed 10 digits, assume US (+1)
  if (digits.length === 10) return `+1${digits}`
  // If 11 digits starting with 1, also US
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  // Fallback: prefix + to whatever digits user supplied
  return `+${digits}`
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Timeout wrapper for API calls
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      // Return a soft timeout to prevent crashing the UI. We resolve to a rejected-like shape
      // only for fetch() calls, but for Supabase SDK calls we let the caller handle nulls.
      // Here, reject with a tagged error that callers can treat as non-fatal.
      const err = new Error(`Operation timed out after ${timeoutMs}ms`) as Error & { __softTimeout?: boolean }
      err.__softTimeout = true
      reject(err)
    }, timeoutMs)

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId))
  })
}

// Type-safe wrapper for Supabase queries with timeout
async function queryWithTimeout<T>(queryBuilder: Promise<T>, timeoutMs: number): Promise<T> {
  return withTimeout(queryBuilder, timeoutMs)
}

// Type for Supabase query results
interface SupabaseResult<T> {
  data: T | null
  error: unknown
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('🔍 Getting current user...')
    
    // Get auth user with timeout
    let authUser: { id: string; email?: string } | null = null
    let authError: unknown = null
    try {
      const result: any = await withTimeout(
        supabase.auth.getUser(),
        6000 // 6s for faster loading
      )
      authUser = result?.data?.user
      authError = result?.error || null
    } catch (e) {
      if ((e as Error & { __softTimeout?: boolean })?.__softTimeout) {
        console.warn('Auth getUser timeout; continuing without user')
        return null
      }
      authError = e
    }
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return null
    }
    
    if (!authUser) {
      console.log('ℹ️ No authenticated user')
      return null
    }

    console.log('✅ Auth user found:', authUser.id)

    // Check if user exists in our users table with timeout
    let userData: User | null = null
    let fetchError: unknown = null
    try {
      const res = await queryWithTimeout<SupabaseResult<User>>(
        supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single() as unknown as Promise<SupabaseResult<User>>,
        5000
      )
      userData = res?.data ?? null
      fetchError = res?.error ?? null
    } catch (e) {
      if ((e as Error & { __softTimeout?: boolean })?.__softTimeout) {
        console.warn('User row fetch timeout; returning null user')
        return null
      }
      fetchError = e
    }

    if (fetchError && (fetchError as { code?: string }).code !== 'PGRST116') {
      // PGRST116 is "not found" - other errors should be logged
      console.error('❌ Error fetching user data:', fetchError)
      return null
    }

    if (userData) {
      console.log('✅ User data found in database')
      return userData
    }

    // If user doesn't exist, call the ensure-user API endpoint to create it
    console.log('🔨 User not found, creating via API...')
    
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.access_token) {
        console.error('❌ No access token available for user creation')
        return null
      }

      // Create user via API with timeout
      let response: Response | null = null
      try {
        response = await withTimeout(
          fetch('/api/ensure-user', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.session.access_token}`,
              'Content-Type': 'application/json',
            },
          }),
          12000
        )
      } catch (e) {
        if ((e as Error & { __softTimeout?: boolean })?.__softTimeout) {
          console.warn('ensure-user API timeout; falling back to direct creation')
          return await createUserDirectly(authUser)
        }
        throw e
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to create user via API:', response.status, errorText)
        
        // If API fails, try direct database creation as fallback
        console.log('🔄 API failed, attempting direct database creation...')
        return await createUserDirectly(authUser)
      }

      const result = await response.json()
      console.log('✅ User creation API call successful')
      
      if (result.user) {
        console.log('✅ User created:', result.user.handle)
        return result.user
      }
      
      // If no user in response, try fetching once more
      const { data: newUserData } = await queryWithTimeout<SupabaseResult<User>>(
        supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single() as unknown as Promise<SupabaseResult<User>>,
        3000
      )
      
      return newUserData || null
    } catch (apiError) {
      console.error("❌ Error ensuring user via API:", apiError)
      
      // Fallback to direct creation
      console.log('🔄 API failed, attempting direct database creation...')
      return await createUserDirectly(authUser)
    }
  } catch (e) {
    console.error("❌ Error in getCurrentUser:", e)
    return null
  }
}

// Fallback function to create user directly if API fails
async function createUserDirectly(authUser: { id: string; email?: string }): Promise<User | null> {
  try {
    console.log('🔨 Creating user directly in database...')
    
    // Generate unique handle by checking for duplicates
    let handle = generateRandomHandle()
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('handle', handle)
        .single()
      
      if (!existing) {
        break // Handle is unique
      }
      
      handle = generateRandomHandle()
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      console.error('Failed to generate unique handle after', maxAttempts, 'attempts')
      return null
    }
    
    console.log('Generated unique handle:', handle)
    const { data: newUser, error: insertError } = await queryWithTimeout<SupabaseResult<User>>(
      supabase
        .from('users')
        .insert({
          id: authUser.id,
          handle,
          handle_version: 1
        })
        .select()
        .single() as unknown as Promise<SupabaseResult<User>>,
      5000 // 5 second timeout
    )

    if (insertError) {
      // Handle duplicate key error (race condition)
      if ((insertError as { code?: string; message?: string }).code === '23505' || (insertError as { code?: string; message?: string }).message?.includes('duplicate key value')) {
        console.log('🔄 Race condition detected, fetching existing user')
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        return existingUser || null
      }
      
      console.error('❌ Error creating user directly:', insertError)
      return null
    }

    if (newUser) {
      console.log('✅ User created directly:', newUser.handle)
      return newUser
    } else {
      console.error('❌ No user data returned from insert')
      return null
    }
  } catch (error) {
    console.error('❌ Error in direct user creation:', error)
    return null
  }
}

export async function regenerateHandle(userId: string): Promise<{ handle?: string; error?: unknown }> {
  try {
    // Get the current session to include auth headers
    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.access_token) {
      return { error: 'Not authenticated' }
    }

    // Generate a new unique anonymous handle
    let handle = generateRandomHandle()
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('handle', handle)
        .single()
      
      if (!existing) {
        break // Handle is unique
      }
      
      handle = generateRandomHandle()
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      return { error: 'Failed to generate unique username after multiple attempts' }
    }

    // Persist the new handle to the database and bump handle_version
    // Read current handle_version first
    const { data: currentUser } = await supabase
      .from('users')
      .select('handle_version')
      .eq('id', userId)
      .single()

    const nextVersion = (currentUser?.handle_version ?? 0) + 1

    const { error: updateError } = await supabase
      .from('users')
      .update({ handle, handle_version: nextVersion })
      .eq('id', userId)

    if (updateError) {
      return { error: updateError }
    }

    return { handle }
  } catch (error) {
    return { error }
  }
}
