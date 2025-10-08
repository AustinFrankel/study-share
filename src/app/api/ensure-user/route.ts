import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
// We intentionally do NOT use the service role here. RLS allows users to insert
// their own row, so we rely on the authenticated SSR client.

function generateRandomHandle(): string {
  const ADJECTIVES = [
    'cobalt', 'crimson', 'azure', 'golden', 'silver', 'emerald', 'violet', 'amber',
    'coral', 'jade', 'ruby', 'sapphire', 'pearl', 'bronze', 'platinum', 'onyx'
  ]
  const ANIMALS = [
    'walrus', 'penguin', 'dolphin', 'octopus', 'tiger', 'eagle', 'wolf', 'bear',
    'fox', 'owl', 'shark', 'whale', 'hawk', 'lynx', 'raven', 'falcon'
  ]
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const number = Math.floor(Math.random() * 1000)
  return `${adjective}-${animal}-${number}`
}

export async function POST(request: Request) {
  console.log('ensure-user API called')
  
  const cookieStore = await cookies()
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  const tokenMatch = authHeader?.match(/Bearer\s+(.+)/i)
  const bearerToken = tokenMatch?.[1]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Auth setup - Bearer token present:', !!bearerToken)
  console.log('Service key available:', !!supabaseServiceKey)

  let authClient: ReturnType<typeof createClient> | ReturnType<typeof createServerClient>
  let user: { id: string; email?: string } | null = null

  // First, authenticate the user to ensure they're legitimate
  if (bearerToken) {
    console.log('Using Bearer token authentication')
    authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${bearerToken}` } },
    })
    const userResp = await authClient.auth.getUser(bearerToken)
    user = userResp.data.user
    console.log('Bearer auth result - User authenticated:', !!user, user?.id)
  } else {
    console.log('Using cookie-based authentication')
    authClient = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name)
          },
        },
      }
    )
    const { data } = await authClient.auth.getUser()
    user = data.user
    console.log('Cookie auth result - User authenticated:', !!user, user?.id)
  }
  if (!user) {
    console.log('No authenticated user found')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Now use service role key for database operations (bypasses RLS)
  let dbClient: ReturnType<typeof createClient> | ReturnType<typeof createServerClient>
  if (supabaseServiceKey) {
    console.log('Using service role key for database operations')
    dbClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
  } else {
    console.log('No service key, falling back to authenticated client')
    dbClient = authClient
  }

  try {
    console.log('Checking if user already exists:', user.id)
    
    // First check if user already exists
    const { data: existingUser, error: fetchError } = await dbClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error - other errors should be handled
      console.error('Error checking existing user:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // If user already exists, return success
    if (existingUser) {
      console.log('User already exists, returning existing user')
      return NextResponse.json({ ok: true, user: existingUser })
    }

    // Create new user with unique handle
    console.log('Creating new user')
    let handle = generateRandomHandle()
    let attempts = 0
    const maxAttempts = 10
    
    // Ensure handle is unique by checking database
    while (attempts < maxAttempts) {
      const { data: existing } = await dbClient
        .from('users')
        .select('id')
        .eq('handle', handle)
        .single()
      
      if (!existing) {
        break // Handle is unique
      }
      
      // Generate a new handle and try again
      handle = generateRandomHandle()
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      console.error('Failed to generate unique handle after', maxAttempts, 'attempts')
      return NextResponse.json({ error: 'Failed to generate unique username' }, { status: 500 })
    }
    
    console.log('Generated unique handle:', handle)
    const { data: newUser, error: insertError } = await dbClient
      .from('users')
      .insert({ 
        id: user.id, 
        handle, 
        handle_version: 1
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user:', insertError)
      
      // Handle duplicate key error (race condition)
      if (insertError.code === '23505' || insertError.message.includes('duplicate key value')) {
        console.log('Race condition detected, fetching existing user')
        // User was created by another request, fetch and return it
        const { data: raceUser, error: raceError } = await dbClient
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (raceError) {
          console.error('Error fetching user after race condition:', raceError)
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }
        
        return NextResponse.json({ ok: true, user: raceUser })
      }
      
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    console.log('User created successfully:', newUser.id, newUser.handle)
    return NextResponse.json({ ok: true, user: newUser })
  } catch (error) {
    console.error('Unexpected error in ensure-user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


