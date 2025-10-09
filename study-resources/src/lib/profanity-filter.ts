// Simple profanity filter for user input - restricted to specific severe words only
const PROFANE_WORDS = [
  'shit', 'cunt', 'nigga', 'nigger'
  // Only specific words that should trigger the filter
]

export function containsProfanity(text: string): boolean {
  const cleanText = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()

  // Split into words to avoid false positives (like "Richard" containing "dick")
  const words = cleanText.split(/\s+/)
  
  // Check for exact word matches only
  for (const word of words) {
    if (PROFANE_WORDS.includes(word)) {
      return true
    }
  }

  // Check for common substitutions (e.g., f@ck, sh1t, etc.) but only exact words
  const substitutionMap: { [key: string]: string } = {
    '@': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '7': 't',
    '$': 's', '+': 't', '!': 'i', '4': 'a'
  }

  const normalizedWords = words.map(word => {
    let normalizedWord = word
    for (const [char, replacement] of Object.entries(substitutionMap)) {
      // Escape special regex characters to prevent syntax errors
      const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      normalizedWord = normalizedWord.replace(new RegExp(escapedChar, 'g'), replacement)
    }
    return normalizedWord
  })

  for (const word of normalizedWords) {
    if (PROFANE_WORDS.includes(word)) {
      return true
    }
  }

  return false
}

export function sanitizeText(text: string): string {
  if (containsProfanity(text)) {
    throw new Error('Text contains inappropriate language. Please use respectful language.')
  }
  return text.trim()
}
