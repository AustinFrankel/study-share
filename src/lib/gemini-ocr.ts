// Google Gemini AI for advanced test processing
// Uses Google's Generative AI to extract and structure test questions from images

const GEMINI_API_KEY = 'AIzaSyD4icVauYHyo7e0Tdtd5TqBjDrQHWKRgM4'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

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

/**
 * Convert image file to base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Process image with Google Gemini AI
 */
export async function processImageWithGemini(imageFile: File): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const base64Image = await fileToBase64(imageFile)
    const mimeType = imageFile.type

    const requestBody = {
      contents: [{
        parts: [
          {
            text: `Extract ALL text from this standardized test image. Include:
- Question numbers
- Full question text (including any passages or context)
- All answer choices (A, B, C, D) with complete text
- Correct answers if marked
- Explanations if provided

Format the output as a structured list. Be extremely accurate and thorough.`
          },
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          }
        ]
      }]
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Gemini API error: ${response.status} - ${errorText}`
      }
    }

    const data = await response.json()

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return {
        success: false,
        error: 'No text extracted from image'
      }
    }

    return {
      success: true,
      text
    }
  } catch (error) {
    console.error('Gemini AI processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Parse extracted text into structured questions using Gemini AI
 */
export async function parseTextToQuestionsWithGemini(text: string, testId: string): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: `Parse this test content into a JSON array of questions. Each question should have:
- id: "${testId}-q-{number}"
- questionNumber: (integer)
- module: (calculate as: Math.ceil(questionNumber / 27))
- passage: (optional, any reading passage or context before the question)
- questionText: (the main question text)
- choices: array of { letter: "A"|"B"|"C"|"D", text: "choice text" }
- correctAnswer: (letter A-D)
- explanation: (optional, explanation of the correct answer)

Return ONLY valid JSON. No markdown, no code blocks, just the JSON array.

Test content:
${text}`
        }]
      }]
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Gemini parsing error: ${response.status}`
      }
    }

    const data = await response.json()
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      return {
        success: false,
        error: 'No response from Gemini AI'
      }
    }

    // Clean up response text (remove markdown code blocks if present)
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    const questions = JSON.parse(jsonText)

    if (!Array.isArray(questions) || questions.length === 0) {
      return {
        success: false,
        error: 'No valid questions found in response'
      }
    }

    return {
      success: true,
      questions
    }
  } catch (error) {
    console.error('Error parsing with Gemini:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Parse error'
    }
  }
}

/**
 * Process multiple test images with Gemini AI
 */
export async function processTestImagesWithGemini(
  imageFiles: File[],
  testId: string,
  onProgress?: (message: string) => void
): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
  try {
    onProgress?.('Starting AI-powered text extraction...')

    const allExtractedText: string[] = []

    // Process each image
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      onProgress?.(`Processing image ${i + 1} of ${imageFiles.length}: ${file.name}`)

      const result = await processImageWithGemini(file)

      if (!result.success) {
        return {
          success: false,
          error: `Failed to process ${file.name}: ${result.error}`
        }
      }

      if (result.text) {
        allExtractedText.push(result.text)
      }
    }

    if (allExtractedText.length === 0) {
      return {
        success: false,
        error: 'No text could be extracted from any images'
      }
    }

    onProgress?.('Text extracted successfully! Now parsing into questions...')

    // Combine all text and parse into questions
    const combinedText = allExtractedText.join('\n\n---\n\n')
    const parseResult = await parseTextToQuestionsWithGemini(combinedText, testId)

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error
      }
    }

    onProgress?.(`Successfully parsed ${parseResult.questions?.length || 0} questions!`)

    return {
      success: true,
      questions: parseResult.questions
    }
  } catch (error) {
    console.error('Error processing test images:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
