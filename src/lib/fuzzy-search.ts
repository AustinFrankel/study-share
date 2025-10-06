// Fuzzy search utilities for smart/approximation search

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

// Calculate similarity score (0-1, where 1 is exact match)
function similarityScore(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return 1 - (distance / maxLength)
}

// Check if strings are similar enough (fuzzy match)
export function isFuzzyMatch(str1: string, str2: string, threshold: number = 0.6): boolean {
  // Exact match or substring match
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  
  if (s1.includes(s2) || s2.includes(s1)) return true
  
  // Fuzzy match using similarity score
  return similarityScore(str1, str2) >= threshold
}

// Find fuzzy matches in a list of strings
export function findFuzzyMatches(query: string, items: string[], threshold: number = 0.6): string[] {
  if (!query.trim()) return []
  
  return items.filter(item => isFuzzyMatch(query, item, threshold))
}

// Smart search function that handles various search terms
export function createSmartSearchQuery(searchQuery: string): string {
  if (!searchQuery.trim()) return ''
  
  const terms = searchQuery.trim().split(/\s+/)
  
  // Handle common misspellings and variations
  const corrections: { [key: string]: string } = {
    'math': 'mathematics',
    'bio': 'biology',
    'chem': 'chemistry',
    'phys': 'physics',
    'psych': 'psychology',
    'econ': 'economics',
    'calc': 'calculus',
    'stats': 'statistics',
    'comp sci': 'computer science',
    'cs': 'computer science',
    'eng': 'english',
    'hist': 'history'
  }
  
  // Apply corrections and expansions
  const expandedTerms = terms.map(term => {
    const lowerTerm = term.toLowerCase()
    return corrections[lowerTerm] || term
  })
  
  return expandedTerms.join(' ')
}

// Generate PostgreSQL fuzzy search conditions
export function generateFuzzySearchConditions(query: string, fields: string[]): string {
  const cleanQuery = createSmartSearchQuery(query)
  const terms = cleanQuery.split(/\s+/).filter(t => t.length > 0)
  
  if (terms.length === 0) return ''
  
  const conditions: string[] = []
  
  fields.forEach(field => {
    terms.forEach(term => {
      // Exact substring match (higher priority)
      conditions.push(`${field}.ilike.%${term}%`)
      // Fuzzy match using trigrams (requires pg_trgm extension)
      if (term.length >= 3) {
        conditions.push(`${field}.<->.%${term}%`)
      }
    })
  })
  
  return conditions.join(',')
}

// Extract keywords from text for better search matching
export function extractKeywords(text: string): string[] {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .filter((word, index, array) => array.indexOf(word) === index) // remove duplicates
}

// Score relevance of search results
export function scoreRelevance(searchQuery: string, item: any): number {
  let score = 0
  const queryTerms = extractKeywords(searchQuery)
  
  // Check title relevance
  if (item.title) {
    const titleTerms = extractKeywords(item.title)
    queryTerms.forEach(term => {
      titleTerms.forEach(titleTerm => {
        score += similarityScore(term, titleTerm) * 3 // Title matches get higher weight
      })
    })
  }
  
  // Check class/subject relevance
  if (item.class?.subject?.name) {
    const subjectScore = queryTerms.reduce((acc, term) => {
      return acc + similarityScore(term, item.class.subject.name) * 2
    }, 0)
    score += subjectScore
  }
  
  // Check school relevance
  if (item.class?.school?.name) {
    const schoolScore = queryTerms.reduce((acc, term) => {
      return acc + similarityScore(term, item.class.school.name)
    }, 0)
    score += schoolScore
  }
  
  // Check teacher relevance
  if (item.class?.teacher?.name) {
    const teacherScore = queryTerms.reduce((acc, term) => {
      return acc + similarityScore(term, item.class.teacher.name)
    }, 0)
    score += teacherScore
  }
  
  return score
}
