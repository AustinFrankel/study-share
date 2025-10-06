import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PolicyCheckResult {
  blocked: boolean
  reasons: string[]
  confidence: number
}

// Enhanced policy checking with multiple detection methods
function checkContent(text: string): PolicyCheckResult {
  const lowerText = text.toLowerCase()
  const reasons: string[] = []
  let confidence = 0

  // Live exam detection patterns
  const liveExamPatterns = [
    // Time-sensitive indicators
    /exam\s+(today|tomorrow|this\s+week)/i,
    /test\s+(today|tomorrow|this\s+week)/i,
    /quiz\s+(today|tomorrow|this\s+week)/i,
    /due\s+(today|tomorrow|by\s+\d)/i,
    /submit\s+by\s+\d/i,
    
    // Exam type indicators
    /midterm\s+exam/i,
    /final\s+exam/i,
    /in-class\s+test/i,
    /timed\s+exam/i,
    /proctored\s+(exam|test)/i,
    
    // Confidentiality indicators
    /do\s+not\s+share/i,
    /confidential/i,
    /honor\s+code/i,
    /academic\s+integrity/i,
    /unauthorized\s+sharing/i,
    
    // Current semester/term indicators
    /fall\s+2024/i,
    /spring\s+2025/i,
    /current\s+semester/i,
    /this\s+semester/i
  ]

  const liveExamScore = liveExamPatterns.reduce((score, pattern) => {
    return score + (pattern.test(text) ? 1 : 0)
  }, 0)

  if (liveExamScore >= 2) {
    reasons.push('live_exam')
    confidence += 0.8
  } else if (liveExamScore >= 1) {
    reasons.push('live_exam')
    confidence += 0.4
  }

  // Answer key detection
  const answerKeyPatterns = [
    /answer\s+key/i,
    /test\s+answers/i,
    /correct\s+answers/i,
    /solution\s+set/i,
    /cheat\s+sheet/i
  ]

  const answerKeyScore = answerKeyPatterns.reduce((score, pattern) => {
    return score + (pattern.test(text) ? 1 : 0)
  }, 0)

  if (answerKeyScore >= 1) {
    reasons.push('wrong_info')
    confidence += 0.6
  }

  // Copyright detection
  const copyrightPatterns = [
    /©\s*\d{4}/,
    /copyright\s+\d{4}/i,
    /all\s+rights\s+reserved/i,
    /proprietary/i,
    /textbook\s+material/i
  ]

  const copyrightScore = copyrightPatterns.reduce((score, pattern) => {
    return score + (pattern.test(text) ? 1 : 0)
  }, 0)

  if (copyrightScore >= 1) {
    reasons.push('copyright')
    confidence += 0.3
  }

  // Spam detection
  const spamPatterns = [
    /buy\s+now/i,
    /click\s+here/i,
    /free\s+money/i,
    /viagra/i,
    /casino/i,
    /lottery/i
  ]

  const spamScore = spamPatterns.reduce((score, pattern) => {
    return score + (pattern.test(text) ? 1 : 0)
  }, 0)

  if (spamScore >= 1) {
    reasons.push('spam')
    confidence += 0.9
  }

  // Additional heuristics
  
  // Check for excessive capitalization (spam indicator)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (capsRatio > 0.3 && text.length > 100) {
    if (!reasons.includes('spam')) {
      reasons.push('spam')
      confidence += 0.2
    }
  }

  // Check for suspicious URLs
  const urlPattern = /https?:\/\/[^\s]+/gi
  const urls = text.match(urlPattern) || []
  const suspiciousUrlKeywords = ['bit.ly', 'tinyurl', 'goo.gl', 'free', 'download']
  
  const hasSuspiciousUrls = urls.some(url => 
    suspiciousUrlKeywords.some(keyword => url.toLowerCase().includes(keyword))
  )
  
  if (hasSuspiciousUrls) {
    if (!reasons.includes('spam')) {
      reasons.push('spam')
      confidence += 0.4
    }
  }

  // Normalize confidence score
  confidence = Math.min(confidence, 1.0)

  return {
    blocked: reasons.length > 0 && confidence > 0.3,
    reasons,
    confidence
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = checkContent(text)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in policy check:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
