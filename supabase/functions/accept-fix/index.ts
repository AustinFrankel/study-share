import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JSONPatch {
  op: 'replace' | 'add' | 'remove'
  path: string
  value?: any
}

// Apply JSON patch operations to an object
function applyJSONPatch(obj: any, patches: JSONPatch[]): any {
  const result = JSON.parse(JSON.stringify(obj)) // Deep clone
  
  for (const patch of patches) {
    const pathParts = patch.path.split('/').filter(p => p !== '')
    
    if (patch.op === 'replace') {
      let current = result
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (!(part in current)) {
          current[part] = {}
        }
        current = current[part]
      }
      current[pathParts[pathParts.length - 1]] = patch.value
    } else if (patch.op === 'add') {
      let current = result
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (!(part in current)) {
          current[part] = Array.isArray(current) ? [] : {}
        }
        current = current[part]
      }
      const lastPart = pathParts[pathParts.length - 1]
      if (Array.isArray(current)) {
        if (lastPart === '-') {
          current.push(patch.value)
        } else {
          current.splice(parseInt(lastPart), 0, patch.value)
        }
      } else {
        current[lastPart] = patch.value
      }
    } else if (patch.op === 'remove') {
      let current = result
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]]
      }
      const lastPart = pathParts[pathParts.length - 1]
      if (Array.isArray(current)) {
        current.splice(parseInt(lastPart), 1)
      } else {
        delete current[lastPart]
      }
    }
  }
  
  return result
}

// Validate that the patch is safe and reasonable
function validatePatch(patches: JSONPatch[]): { valid: boolean; error?: string } {
  for (const patch of patches) {
    // Only allow patches to specific safe paths
    const allowedPaths = [
      /^\/items\/\d+\/prompt$/,
      /^\/items\/\d+\/choices\/\d+$/,
      /^\/items\/\d+\/answer$/,
      /^\/items\/\d+\/explanation$/,
      /^\/notes\/\d+$/,
      /^\/meta\/approx_topic$/
    ]
    
    const isAllowedPath = allowedPaths.some(pattern => pattern.test(patch.path))
    if (!isAllowedPath) {
      return { valid: false, error: `Path ${patch.path} is not allowed for editing` }
    }
    
    // Validate operation types
    if (!['replace', 'add', 'remove'].includes(patch.op)) {
      return { valid: false, error: `Operation ${patch.op} is not supported` }
    }
    
    // Validate value for replace and add operations
    if ((patch.op === 'replace' || patch.op === 'add') && patch.value === undefined) {
      return { valid: false, error: 'Value is required for replace and add operations' }
    }
    
    // Validate string length limits
    if (typeof patch.value === 'string' && patch.value.length > 2000) {
      return { valid: false, error: 'Text values cannot exceed 2000 characters' }
    }
  }
  
  return { valid: true }
}

// Re-generate HTML render after applying patches
function regenerateHTMLRender(structuredContent: any): string {
  let html = `
    <div class="practice-content">
      <div class="meta-info mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold text-lg mb-2">${structuredContent.meta?.approx_topic || 'Study Material'}</h3>
        <p class="text-sm text-gray-600">${structuredContent.meta?.class || ''} • ${structuredContent.meta?.teacher || ''}</p>
      </div>
      
      <div class="practice-items space-y-6">
  `
  
  (structuredContent.items || []).forEach((item: any, index: number) => {
    html += `
      <div class="practice-item border rounded-lg p-4" data-item-id="${index}">
        <div class="question-header mb-3">
          <span class="question-number font-semibold">${index + 1}.</span>
          <span class="question-type px-2 py-1 text-xs rounded-full ${
            item.type === 'mcq' ? 'bg-blue-100 text-blue-800' :
            item.type === 'short' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }">${
            item.type === 'mcq' ? 'Multiple Choice' :
            item.type === 'short' ? 'Short Answer' :
            'Free Response'
          }</span>
        </div>
        
        <div class="question-prompt mb-4">
          <p class="font-medium">${item.prompt || ''}</p>
        </div>
        
        ${item.choices ? `
          <div class="choices mb-4 space-y-2">
            ${item.choices.map((choice: string) => `
              <label class="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="q${index}" value="${choice}" class="form-radio">
                <span>${choice}</span>
              </label>
            `).join('')}
          </div>
        ` : `
          <div class="answer-input mb-4">
            <textarea 
              class="w-full p-3 border rounded-lg" 
              rows="${item.type === 'frq' ? '6' : '3'}"
              placeholder="Enter your answer..."
            ></textarea>
          </div>
        `}
        
        <div class="answer-section hidden" data-answer-section="${index}">
          <div class="correct-answer p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
            <strong class="text-green-800">Answer:</strong>
            <p class="text-green-700">${item.answer || ''}</p>
          </div>
          <div class="explanation p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <strong class="text-blue-800">Explanation:</strong>
            <p class="text-blue-700">${item.explanation || ''}</p>
          </div>
        </div>
        
        <div class="item-actions mt-4 flex space-x-2">
          <button 
            class="show-answer-btn px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            onclick="toggleAnswer(${index})"
          >
            Show Answer
          </button>
          <button 
            class="suggest-fix-btn px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            onclick="suggestFix(${index})"
          >
            Suggest Fix
          </button>
        </div>
      </div>
    `
  })
  
  html += `
      </div>
      
      ${structuredContent.notes?.length > 0 ? `
        <div class="key-notes mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 class="font-semibold text-yellow-800 mb-3">Key Points:</h4>
          <ul class="list-disc list-inside space-y-1 text-yellow-700">
            ${structuredContent.notes.map((note: string) => `<li>${note}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
    
    <script>
      function toggleAnswer(itemId) {
        const answerSection = document.querySelector('[data-answer-section="' + itemId + '"]');
        const button = event.target;
        
        if (answerSection.classList.contains('hidden')) {
          answerSection.classList.remove('hidden');
          button.textContent = 'Hide Answer';
        } else {
          answerSection.classList.add('hidden');
          button.textContent = 'Show Answer';
        }
      }
      
      function suggestFix(itemId) {
        alert('Fix suggestion feature coming soon!');
      }
    </script>
  `
  
  return html
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { resourceId, jsonPatch } = await req.json()

    if (!resourceId || !jsonPatch) {
      return new Response(
        JSON.stringify({ error: 'Resource ID and JSON patch are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user making the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the resource and AI derivative
    const { data: resource, error: resourceError } = await supabaseClient
      .from('resources')
      .select(`
        *,
        ai_derivative:ai_derivatives(*)
      `)
      .eq('id', resourceId)
      .single()

    if (resourceError || !resource) {
      return new Response(
        JSON.stringify({ error: 'Resource not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!resource.ai_derivative) {
      return new Response(
        JSON.stringify({ error: 'No AI derivative found for this resource' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check permissions: uploader or user with net ≥3 upvotes on this resource
    let canAcceptFix = false

    if (resource.uploader_id === user.id) {
      canAcceptFix = true
    } else {
      // Check if user has net ≥3 upvotes on this resource
      const { data: voteData, error: voteError } = await supabaseClient
        .from('votes')
        .select('value')
        .eq('resource_id', resourceId)
        .eq('voter_id', user.id)

      if (!voteError && voteData) {
        const netVotes = voteData.reduce((sum, vote) => sum + vote.value, 0)
        if (netVotes >= 3) {
          canAcceptFix = true
        }
      }
    }

    if (!canAcceptFix) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to accept fixes' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate the patch
    const validation = validatePatch(jsonPatch)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Apply the patch to the structured JSON
    const originalStructured = resource.ai_derivative.structured_json
    const patchedStructured = applyJSONPatch(originalStructured, jsonPatch)

    // Regenerate HTML render
    const newHtmlRender = regenerateHTMLRender(patchedStructured)

    // Update the AI derivative
    const { error: updateError } = await supabaseClient
      .from('ai_derivatives')
      .update({
        structured_json: patchedStructured,
        html_render: newHtmlRender
      })
      .eq('resource_id', resourceId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to apply fix' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the fix acceptance (optional - could add to points_ledger)
    try {
      await supabaseClient
        .from('points_ledger')
        .insert({
          user_id: user.id,
          delta: 3,
          reason: `Accepted fix for resource ${resourceId}`
        })
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Error logging fix acceptance:', error)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Fix accepted successfully',
        patchedItems: jsonPatch.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error accepting fix:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
