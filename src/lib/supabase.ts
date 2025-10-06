import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have real Supabase credentials
const hasValidCredentials = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key' &&
  !supabaseUrl.includes('your_supabase_project_url') &&
  !supabaseAnonKey.includes('your_supabase_anon_key') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key-here') &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 20 &&
  supabaseAnonKey.startsWith('eyJ') // JWT tokens start with eyJ

// Log configuration status for debugging
if (typeof window !== 'undefined') {
  console.log('Supabase Configuration Status:', {
    hasValidCredentials,
    supabaseUrl: supabaseUrl.includes('placeholder') ? 'PLACEHOLDER' : 'CONFIGURED',
    supabaseKey: supabaseAnonKey.includes('placeholder') ? 'PLACEHOLDER' : 'CONFIGURED'
  })
}

// Use the SSR-aware browser client on the client so it reads the auth cookies
// that were set during the OAuth callback (exchangeCodeForSession). This
// prevents a post-login loop where getSession() returns null until a manual
// client sign-in occurs.
export const supabase = typeof window !== 'undefined'
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // In server environments, avoid persisting session state
        autoRefreshToken: false,
        persistSession: false,
      },
    })

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasValidCredentials

// For server-side operations
export const createServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
