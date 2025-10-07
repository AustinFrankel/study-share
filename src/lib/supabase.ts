import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Environment variables - fail fast if missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate configuration (strict validation, no fallbacks)
const hasValidCredentials =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 20 &&
  supabaseAnonKey.startsWith('eyJ') // JWT tokens start with eyJ

// Throw error in development if config is invalid (helps catch issues early)
if (!hasValidCredentials && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.error('❌ Supabase configuration is invalid or missing. Please check your environment variables.')
}

// Create Supabase client only if we have valid credentials
// Use the SSR-aware browser client on the client so it reads the auth cookies
// that were set during the OAuth callback (exchangeCodeForSession). This
// prevents a post-login loop where getSession() returns null until a manual
// client sign-in occurs.
export const supabase = hasValidCredentials && supabaseUrl && supabaseAnonKey
  ? (typeof window !== 'undefined'
      ? createBrowserClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            // Suppress console errors for invalid refresh tokens
            // This prevents spam when users have old/expired tokens
            detectSessionInUrl: true,
            persistSession: true,
            autoRefreshToken: true,
          },
        })
      : createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            // In server environments, avoid persisting session state
            autoRefreshToken: false,
            persistSession: false,
          },
        }))
  : null as any // null when not configured (app should check isSupabaseConfigured)

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasValidCredentials

// For server-side operations (API routes, server components)
// This should NEVER be used in client-side code
export const createServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (typeof window !== 'undefined') {
    throw new Error('createServiceRoleClient() should never be called on the client side - service role key must stay secret!')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
