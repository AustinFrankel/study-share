// OCR API Integration for processing test images

const OCR_API_KEY = 'K84507617488957'
const OCR_API_URL = 'https://api.ocr.space/parse/image'

export interface OCRResult {
  success: boolean
  text?: string
  error?: string
}

/**
 * Process an image file using OCR API to extract text
 */
export async function processImageWithOCR(imageFile: File): Promise<OCRResult> {
  try {
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('apikey', OCR_API_KEY)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('scale', 'true')
    formData.append('OCREngine', '2') // Use OCR Engine 2 for better accuracy

    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      return {
        success: false,
        error: `OCR API request failed: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()

    if (data.IsErroredOnProcessing) {
      return {
        success: false,
        error: data.ErrorMessage?.[0] || 'OCR processing failed',
      }
    }

    const extractedText = data.ParsedResults?.[0]?.ParsedText || ''
    
    if (!extractedText) {
      return {
        success: false,
        error: 'No text extracted from image',
      }
    }

    return {
      success: true,
      text: extractedText,
    }
  } catch (error) {
    console.error('OCR processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown OCR error',
    }
  }
}

/**
 * Process an image from a URL using OCR API
 */
export async function processImageUrlWithOCR(imageUrl: string): Promise<OCRResult> {
  try {
    const formData = new FormData()
    formData.append('url', imageUrl)
    formData.append('apikey', OCR_API_KEY)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')
    formData.append('detectOrientation', 'true')
    formData.append('scale', 'true')
    formData.append('OCREngine', '2')

    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      return {
        success: false,
        error: `OCR API request failed: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()

    if (data.IsErroredOnProcessing) {
      return {
        success: false,
        error: data.ErrorMessage?.[0] || 'OCR processing failed',
      }
    }

    const extractedText = data.ParsedResults?.[0]?.ParsedText || ''
    
    if (!extractedText) {
      return {
        success: false,
        error: 'No text extracted from image',
      }
    }

    return {
      success: true,
      text: extractedText,
    }
  } catch (error) {
    console.error('OCR processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown OCR error',
    }
  }
}

/**
 * Parse OCR text into structured test questions
 */
export interface Question {
  id: string
  questionNumber: number
  module: number
  passage?: string
  questionText: string
  choices: {
    letter: string
    text: string
  }[]
  correctAnswer: string
  explanation?: string
}

export function parseOCRTextToQuestions(text: string, testId: string): Question[] {
  const questions: Question[] = []
  
  // Split text into potential question blocks
  // Look for patterns like "1.", "Question 1", etc.
  const questionBlocks = text.split(/(?=\d+\.|Question\s+\d+)/i).filter(block => block.trim())
  
  let questionNumber = 1
  
  for (const block of questionBlocks) {
    try {
      // Extract question number
      const questionMatch = block.match(/^(\d+)\.?\s+/i)
      if (questionMatch) {
        questionNumber = parseInt(questionMatch[1], 10)
      }
      
      // Extract question text (everything before answer choices)
      const choicePattern = /\b[A-D]\)?\s*[.:]\s*/gi
      const parts = block.split(choicePattern)
      
      if (parts.length < 2) {
        // No clear answer choices found, skip
        continue
      }
      
      const questionText = parts[0]
        .replace(/^\d+\.?\s+/i, '')
        .replace(/Question\s+\d+/i, '')
        .trim()
      
      if (!questionText) continue
      
      // Extract answer choices
      const choices: { letter: string; text: string }[] = []
      const choiceMatches = Array.from(block.matchAll(/([A-D])\)?\s*[.:]\s*([^\n\r]+)/gi))
      
      for (const match of choiceMatches) {
        const letter = match[1].toUpperCase()
        const text = match[2].trim()
        if (text) {
          choices.push({ letter, text })
        }
      }
      
      // Need at least 2 choices for a valid question
      if (choices.length < 2) {
        continue
      }
      
      // Try to extract correct answer (look for patterns like "Answer: B" or "Correct: B")
      const answerMatch = block.match(/(?:Answer|Correct|Key)\s*:?\s*([A-D])/i)
      const correctAnswer = answerMatch ? answerMatch[1].toUpperCase() : choices[0].letter
      
      // Try to extract explanation
      const explanationMatch = block.match(/(?:Explanation|Rationale|Because)\s*:?\s*([\s\S]+?)(?=\n\n|\n\d+\.|$)/i)
      const explanation = explanationMatch ? explanationMatch[1].trim() : undefined
      
      questions.push({
        id: `${testId}-q-${questionNumber}`,
        questionNumber,
        module: Math.ceil(questionNumber / 27),
        questionText,
        choices,
        correctAnswer,
        explanation,
      })
      
      questionNumber++
    } catch (error) {
      console.error('Error parsing question block:', error)
      continue
    }
  }
  
  return questions
}

/**
 * Process multiple images and combine into test questions
 */
export async function processTestImages(
  imageFiles: File[],
  testId: string
): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
  try {
    const allText: string[] = []
    
    for (const file of imageFiles) {
      const result = await processImageWithOCR(file)
      
      if (!result.success) {
        return {
          success: false,
          error: `Failed to process ${file.name}: ${result.error}`,
        }
      }
      
      if (result.text) {
        allText.push(result.text)
      }
    }
    
    const combinedText = allText.join('\n\n')
    const questions = parseOCRTextToQuestions(combinedText, testId)
    
    if (questions.length === 0) {
      return {
        success: false,
        error: 'No valid questions could be extracted from the images',
      }
    }
    
    return {
      success: true,
      questions,
    }
  } catch (error) {
    console.error('Error processing test images:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing images',
    }
  }
}
