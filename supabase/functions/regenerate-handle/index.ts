import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate random handle components
const ADJECTIVES = [
  'cobalt', 'crimson', 'azure', 'golden', 'silver', 'emerald', 'violet', 'amber',
  'coral', 'jade', 'ruby', 'sapphire', 'pearl', 'bronze', 'platinum', 'onyx'
]

const ANIMALS = [
  'walrus', 'penguin', 'dolphin', 'octopus', 'tiger', 'eagle', 'wolf', 'bear',
  'fox', 'owl', 'shark', 'whale', 'hawk', 'lynx', 'raven', 'falcon'
]

function generateRandomHandle(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const number = Math.floor(Math.random() * 1000)
  return `${adjective}-${animal}-${number}`
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the auth token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current user data to increment handle_version
    const { data: userData, error: fetchError } = await supabaseClient
      .from('users')
      .select('handle_version')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate new handle and increment version
    const newHandle = generateRandomHandle()
    const newVersion = (userData.handle_version || 1) + 1

    // Update user with new handle
    const { data, error } = await supabaseClient
      .from('users')
      .update({
        handle: newHandle,
        handle_version: newVersion
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ handle: newHandle, handle_version: newVersion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
