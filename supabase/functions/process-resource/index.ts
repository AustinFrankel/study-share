import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StructuredContent {
  meta: {
    school: string
    class: string
    teacher: string
    approx_topic: string
    source_form: string
  }
  items: Array<{
    type: 'mcq' | 'short' | 'frq'
    prompt: string
    choices?: string[]
    answer: string
    explanation: string
  }>
  notes: string[]
}

// Mock OCR function - in production, you'd use a real OCR service
function mockOCR(fileName: string, mimeType: string): string {
  // Simulate OCR extraction based on file type
  if (mimeType === 'application/pdf') {
    return `
      Introduction to Psychology - Lecture 5
      Memory and Cognition
      
      Key Concepts:
      1. Working Memory - temporary storage system
      2. Long-term Memory - permanent storage
      3. Encoding - process of storing information
      4. Retrieval - accessing stored information
      
      Types of Memory:
      - Sensory Memory (0.5-3 seconds)
      - Short-term Memory (15-30 seconds)
      - Long-term Memory (permanent)
      
      Memory Strategies:
      - Rehearsal
      - Chunking
      - Elaborative encoding
      - Mnemonic devices
    `
  } else {
    return `
      Image contains:
      - Diagram showing memory process
      - Flow chart: Sensory → Short-term → Long-term
      - Examples of memory techniques
      - Practice problems on memory types
    `
  }
}

// Mock LLM function - in production, you'd use OpenAI, Anthropic, etc.
function mockLLMTransform(text: string, resourceType: string): StructuredContent {
  // Simulate AI transformation of content into structured practice material
  const topics = text.toLowerCase()
  
  let items = []
  
  if (topics.includes('memory')) {
    items.push({
      type: 'mcq' as const,
      prompt: 'Which type of memory has the shortest duration?',
      choices: ['A) Long-term memory', 'B) Short-term memory', 'C) Sensory memory', 'D) Working memory'],
      answer: 'C) Sensory memory',
      explanation: 'Sensory memory lasts only 0.5-3 seconds, making it the shortest duration memory type.'
    })
    
    items.push({
      type: 'short' as const,
      prompt: 'Define working memory and explain its role in cognition.',
      answer: 'Working memory is a temporary storage system that actively maintains and manipulates information needed for cognitive tasks.',
      explanation: 'Working memory is crucial for reasoning, learning, and comprehension as it holds information while we process it.'
    })
    
    items.push({
      type: 'frq' as const,
      prompt: 'Compare and contrast the three main types of memory systems. Include duration, capacity, and function of each.',
      answer: 'Sensory memory (0.5-3 sec, unlimited capacity, filters information), Short-term memory (15-30 sec, 7±2 items, temporary processing), Long-term memory (permanent, unlimited, permanent storage).',
      explanation: 'Each memory system serves a different function in information processing, working together to encode, store, and retrieve information.'
    })
  }
  
  // Add more items based on content analysis
  if (topics.includes('encoding')) {
    items.push({
      type: 'mcq' as const,
      prompt: 'Which memory strategy involves connecting new information to existing knowledge?',
      choices: ['A) Rehearsal', 'B) Chunking', 'C) Elaborative encoding', 'D) Mnemonic devices'],
      answer: 'C) Elaborative encoding',
      explanation: 'Elaborative encoding creates meaningful connections between new and existing information, improving retention.'
    })
  }
  
  return {
    meta: {
      school: 'University',
      class: 'Introduction to Psychology',
      teacher: 'Dr. Smith',
      approx_topic: 'Memory and Cognition',
      source_form: resourceType
    },
    items,
    notes: [
      'Memory is a multi-stage process involving encoding, storage, and retrieval',
      'Different types of memory serve different functions in cognition',
      'Memory strategies can significantly improve retention and recall',
      'Understanding memory systems helps optimize learning approaches'
    ]
  }
}

// Policy check function - detects potentially problematic content
function policyCheck(text: string): { blocked: boolean; reasons: string[] } {
  const lowerText = text.toLowerCase()
  const reasons: string[] = []
  
  // Check for live exam indicators
  const liveExamKeywords = [
    'exam today', 'test today', 'quiz today',
    'due today', 'submit by',
    'midterm exam', 'final exam',
    'in-class test', 'timed exam',
    'do not share', 'confidential',
    'honor code', 'academic integrity'
  ]
  
  const hasLiveExamContent = liveExamKeywords.some(keyword => lowerText.includes(keyword))
  if (hasLiveExamContent) {
    reasons.push('live_exam')
  }
  
  // Check for inappropriate content
  const inappropriateKeywords = ['answer key', 'test answers', 'cheat sheet']
  const hasInappropriateContent = inappropriateKeywords.some(keyword => lowerText.includes(keyword))
  if (hasInappropriateContent) {
    reasons.push('wrong_info')
  }
  
  return {
    blocked: reasons.length > 0,
    reasons
  }
}

// Generate HTML render of structured content
function generateHTMLRender(structured: StructuredContent): string {
  let html = `
    <div class="practice-content">
      <div class="meta-info mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold text-lg mb-2">${structured.meta.approx_topic}</h3>
        <p class="text-sm text-gray-600">${structured.meta.class} • ${structured.meta.teacher}</p>
      </div>
      
      <div class="practice-items space-y-6">
  `
  
  structured.items.forEach((item, index) => {
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
          <p class="font-medium">${item.prompt}</p>
        </div>
        
        ${item.choices ? `
          <div class="choices mb-4 space-y-2">
            ${item.choices.map(choice => `
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
            <p class="text-green-700">${item.answer}</p>
          </div>
          <div class="explanation p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <strong class="text-blue-800">Explanation:</strong>
            <p class="text-blue-700">${item.explanation}</p>
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
      
      ${structured.notes.length > 0 ? `
        <div class="key-notes mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 class="font-semibold text-yellow-800 mb-3">Key Points:</h4>
          <ul class="list-disc list-inside space-y-1 text-yellow-700">
            ${structured.notes.map(note => `<li>${note}</li>`).join('')}
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
        // Implementation for suggesting fixes
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { resourceId } = await req.json()

    if (!resourceId) {
      return new Response(
        JSON.stringify({ error: 'Resource ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing resource:', resourceId)

    // Get resource and files
    const { data: resource, error: resourceError } = await supabaseClient
      .from('resources')
      .select(`
        *,
        files(*),
        class:classes(
          *,
          school:schools(*),
          subject:subjects(*),
          teacher:teachers(*)
        )
      `)
      .eq('id', resourceId)
      .single()

    if (resourceError || !resource) {
      return new Response(
        JSON.stringify({ error: 'Resource not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Found resource with', resource.files?.length || 0, 'files')

    // Process each file
    let combinedText = ''
    for (const file of resource.files || []) {
      try {
        // Validate file
        if (!file.mime || file.mime.size > 10 * 1024 * 1024) {
          console.log('Skipping invalid file:', file.original_filename)
          continue
        }

        // Mock OCR extraction (in production, use real OCR service)
        const extractedText = mockOCR(file.original_filename || '', file.mime || '')
        combinedText += extractedText + '\n\n'
        
        console.log('Extracted text from', file.original_filename)
      } catch (error) {
        console.error('Error processing file:', file.original_filename, error)
        continue
      }
    }

    if (!combinedText.trim()) {
      await supabaseClient
        .from('ai_derivatives')
        .insert({
          resource_id: resourceId,
          status: 'blocked',
          reasons: ['no_content']
        })

      return new Response(
        JSON.stringify({ error: 'No content could be extracted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Extracted', combinedText.length, 'characters of text')

    // Policy check
    const policyResult = policyCheck(combinedText)
    if (policyResult.blocked) {
      console.log('Content blocked for reasons:', policyResult.reasons)
      
      await supabaseClient
        .from('ai_derivatives')
        .insert({
          resource_id: resourceId,
          status: 'blocked',
          reasons: policyResult.reasons
        })

      return new Response(
        JSON.stringify({ 
          message: 'Resource processed but blocked due to policy violations',
          reasons: policyResult.reasons
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate structured content using LLM
    console.log('Generating structured content...')
    const structuredContent = mockLLMTransform(combinedText, resource.type)
    
    // Generate HTML render
    const htmlRender = generateHTMLRender(structuredContent)
    
    // Generate summary
    const summary = `Generated ${structuredContent.items.length} practice questions on ${structuredContent.meta.approx_topic}. Includes ${structuredContent.items.filter(i => i.type === 'mcq').length} multiple choice, ${structuredContent.items.filter(i => i.type === 'short').length} short answer, and ${structuredContent.items.filter(i => i.type === 'frq').length} free response questions.`

    // Save AI derivative
    const { error: saveError } = await supabaseClient
      .from('ai_derivatives')
      .insert({
        resource_id: resourceId,
        status: 'ready',
        summary,
        structured_json: structuredContent,
        html_render: htmlRender
      })

    if (saveError) {
      console.error('Error saving AI derivative:', saveError)
      return new Response(
        JSON.stringify({ error: 'Failed to save processed content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully processed resource:', resourceId)

    return new Response(
      JSON.stringify({ 
        message: 'Resource processed successfully',
        itemCount: structuredContent.items.length,
        summary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing resource:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
