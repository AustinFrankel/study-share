import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)

    // Ensure user record is created after successful authentication
    try {
      const response = await fetch(`${origin}/api/ensure-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        console.error('Failed to ensure user:', await response.text())
      }
    } catch (ensureUserError) {
      console.error('Error calling ensure-user:', ensureUserError)
      // Don't block the redirect, user creation will be retried on next page load
    }
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(requestUrl.origin)
}
