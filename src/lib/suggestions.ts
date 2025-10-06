// Smart suggestions for resource names based on common patterns
export const COMMON_RESOURCE_PATTERNS = [
  // Generic patterns
  'Chapter {number} Notes',
  'Chapter {number} - {topic}',
  'Lecture {number} Notes', 
  'Week {number} Notes',
  'Unit {number} Study Guide',
  '{topic} Study Guide',
  '{topic} Practice Problems',
  '{topic} Exam Review',
  'Midterm Study Guide',
  'Final Exam Review',
  'Quiz {number} Review',
  'Assignment {number} Solution',
  '{topic} Cheat Sheet',
  '{topic} Summary',
  '{topic} Examples',
  
  // Subject-specific patterns
  'Calculus - {topic}',
  'Physics - {topic}', 
  'Chemistry - {topic}',
  'Biology - {topic}',
  'History - {topic}',
  'Psychology - {topic}',
  'Economics - {topic}',
  'Computer Science - {topic}',
  'Statistics - {topic}',
  'Linear Algebra - {topic}',
  
  // Common topics by subject
  'Derivatives and Integrals',
  'Kinematics and Dynamics',
  'Organic Chemistry Reactions',
  'Cell Biology Basics',
  'World War II Timeline',
  'Cognitive Psychology',
  'Supply and Demand',
  'Data Structures',
  'Probability Distributions',
  'Matrix Operations'
]

export const TOPIC_KEYWORDS = [
  'derivatives', 'integrals', 'limits', 'functions', 'equations',
  'kinematics', 'thermodynamics', 'electromagnetism', 'waves', 'optics',
  'organic', 'inorganic', 'reactions', 'molecules', 'bonds',
  'cell', 'genetics', 'evolution', 'ecology', 'anatomy',
  'revolution', 'war', 'empire', 'renaissance', 'enlightenment',
  'memory', 'learning', 'behavior', 'development', 'personality',
  'market', 'inflation', 'gdp', 'trade', 'monetary',
  'algorithms', 'programming', 'databases', 'networks', 'software',
  'statistics', 'probability', 'regression', 'hypothesis', 'sampling'
]

export function generateSuggestions(input: string, resourceType: string): string[] {
  try {
    const suggestions: string[] = []
    const lowerInput = input.toLowerCase()
    
    if (input.length < 2) return suggestions
  
  // Generate pattern-based suggestions
  for (const pattern of COMMON_RESOURCE_PATTERNS) {
    // Check if pattern matches input
    const patternLower = pattern.toLowerCase()
    
    if (patternLower.includes(lowerInput) || lowerInput.includes(patternLower.split(' ')[0])) {
      let suggestion = pattern
      
      // Replace placeholders with smart guesses
      if (suggestion.includes('{number}')) {
        const numberMatch = input.match(/(\d+)/)
        const number = numberMatch ? numberMatch[1] : '1'
        suggestion = suggestion.replace('{number}', number)
      }
      
      if (suggestion.includes('{topic}')) {
        // Try to extract topic from input
        const words = input.split(' ')
        const possibleTopic = words.find(word => 
          TOPIC_KEYWORDS.some(keyword => 
            word.toLowerCase().includes(keyword) || keyword.includes(word.toLowerCase())
          )
        )
        const topic = possibleTopic || 'Topic'
        suggestion = suggestion.replace('{topic}', topic)
      }
      
      suggestions.push(suggestion)
    }
  }
  
  // Add resource-type specific suggestions
  switch (resourceType) {
    case 'notes':
      if (lowerInput.includes('chapter')) {
        suggestions.push('Chapter Notes - Complete')
      }
      if (lowerInput.includes('lecture')) {
        suggestions.push('Lecture Notes - Detailed')
      }
      break
      
    case 'study_guide':
      suggestions.push('Complete Study Guide')
      suggestions.push('Comprehensive Review Guide')
      if (lowerInput.includes('exam') || lowerInput.includes('test')) {
        suggestions.push('Exam Study Guide - All Topics')
      }
      break
      
    case 'practice_set':
      suggestions.push('Practice Problems Set')
      suggestions.push('Problem Set with Solutions')
      if (lowerInput.includes('homework')) {
        suggestions.push('Homework Problems - Solved')
      }
      break
      
    case 'past_material':
      suggestions.push('Past Exam - Sample Questions')
      suggestions.push('Previous Quiz - Study Material')
      break
  }
  
    // Deduplicate and limit to 5 suggestions
    const uniqueSuggestions = Array.from(new Set(suggestions))
    return uniqueSuggestions.slice(0, 5)
  } catch (error) {
    console.warn('Error generating suggestions:', error)
    return []
  }
}

export function getSuggestionScore(suggestion: string, input: string): number {
  const lowerSuggestion = suggestion.toLowerCase()
  const lowerInput = input.toLowerCase()
  
  // Exact match gets highest score
  if (lowerSuggestion === lowerInput) return 100
  
  // Starts with input gets high score
  if (lowerSuggestion.startsWith(lowerInput)) return 90
  
  // Contains all words from input
  const inputWords = lowerInput.split(' ')
  const suggestionWords = lowerSuggestion.split(' ')
  const matchingWords = inputWords.filter(word => 
    suggestionWords.some(sWord => sWord.includes(word))
  )
  
  if (matchingWords.length === inputWords.length) return 80
  
  // Partial word matches
  const partialMatches = inputWords.filter(word => 
    lowerSuggestion.includes(word)
  )
  
  return (partialMatches.length / inputWords.length) * 70
}
