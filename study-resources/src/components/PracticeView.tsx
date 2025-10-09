'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Edit, CheckCircle, XCircle } from 'lucide-react'
import { StructuredContent } from '@/lib/types'

interface PracticeViewProps {
  structured: StructuredContent
  onSuggestFix?: (itemIndex: number, patch: Array<Record<string, unknown>>) => void | Promise<void>
  className?: string
}

export default function PracticeView({ structured, onSuggestFix, className }: PracticeViewProps) {
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set())
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Record<string, unknown>>({})

  const toggleAnswer = (itemIndex: number) => {
    const newShowAnswers = new Set(showAnswers)
    if (newShowAnswers.has(itemIndex)) {
      newShowAnswers.delete(itemIndex)
    } else {
      newShowAnswers.add(itemIndex)
    }
    setShowAnswers(newShowAnswers)
  }

  const handleAnswerChange = (itemIndex: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [itemIndex]: value
    }))
  }

  const startEditing = (itemIndex: number) => {
    const item = structured.items[itemIndex]
    setEditingItem(itemIndex)
    setEditValues({
      prompt: item.prompt,
      answer: item.answer,
      explanation: item.explanation,
      choices: item.choices ? [...item.choices] : undefined
    })
  }

  const cancelEditing = () => {
    setEditingItem(null)
    setEditValues({})
  }

  const submitFix = (itemIndex: number) => {
    if (!onSuggestFix) return

    const item = structured.items[itemIndex]
    const patches = []

    // Create JSON patches for changes
    if (editValues.prompt !== item.prompt) {
      patches.push({
        op: 'replace',
        path: `/items/${itemIndex}/prompt`,
        value: editValues.prompt
      })
    }

    if (editValues.answer !== item.answer) {
      patches.push({
        op: 'replace',
        path: `/items/${itemIndex}/answer`,
        value: editValues.answer
      })
    }

    if (editValues.explanation !== item.explanation) {
      patches.push({
        op: 'replace',
        path: `/items/${itemIndex}/explanation`,
        value: editValues.explanation
      })
    }

    if (editValues.choices && item.choices && Array.isArray(editValues.choices)) {
      (editValues.choices as string[]).forEach((choice: string, choiceIndex: number) => {
        if (choice !== item.choices![choiceIndex]) {
          patches.push({
            op: 'replace',
            path: `/items/${itemIndex}/choices/${choiceIndex}`,
            value: choice
          })
        }
      })
    }

    if (patches.length > 0) {
      onSuggestFix(itemIndex, patches)
    }

    cancelEditing()
  }

  const checkAnswer = (itemIndex: number) => {
    const item = structured.items[itemIndex]
    const userAnswer = userAnswers[itemIndex]?.trim().toLowerCase()
    const correctAnswer = item.answer.trim().toLowerCase()

    if (item.type === 'mcq') {
      return userAnswer === correctAnswer
    } else {
      // For short and FRQ, we'll do a simple contains check
      // In production, you might want more sophisticated comparison
      return correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Meta Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{structured.meta.approx_topic}</span>
            <Badge variant="outline">
              {structured.items.length} questions
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {structured.meta.class} • {structured.meta.teacher}
          </p>
        </CardHeader>
      </Card>

      {/* Practice Items */}
      <div className="space-y-6">
        {structured.items.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </span>
                  <Badge 
                    className={
                      item.type === 'mcq' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200' :
                      item.type === 'short' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' :
                      'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200'
                    }
                    variant="outline"
                  >
                    {item.type === 'mcq' ? 'Multiple Choice' :
                     item.type === 'short' ? 'Short Answer' :
                     'Free Response'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAnswer(index)}
                    className="bg-slate-50 hover:bg-slate-100 border-slate-200"
                  >
                    {showAnswers.has(index) ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show Answer
                      </>
                    )}
                  </Button>
                  {onSuggestFix && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(index)}
                      disabled={editingItem !== null}
                      className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Suggest Fix
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Question Prompt */}
              <div>
                {editingItem === index ? (
                  <Textarea
                    value={(editValues.prompt as string) || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, prompt: e.target.value }))}
                    className="font-medium"
                    rows={3}
                  />
                ) : (
                  <p className="font-medium">{item.prompt}</p>
                )}
              </div>

              {/* Answer Options */}
              {item.type === 'mcq' && item.choices ? (
                <div className="space-y-2">
                  {item.choices.map((choice, choiceIndex) => (
                    <label
                      key={choiceIndex}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={choice}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="form-radio"
                      />
                      {editingItem === index ? (
                        <input
                          type="text"
                          value={(editValues.choices as string[])?.[choiceIndex] || choice}
                          onChange={(e) => {
                            const newChoices = [...((editValues.choices as string[]) || item.choices!)]
                            newChoices[choiceIndex] = e.target.value
                            setEditValues(prev => ({ ...prev, choices: newChoices }))
                          }}
                          className="flex-1 bg-transparent border-none focus:outline-none"
                        />
                      ) : (
                        <span>{choice}</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <Textarea
                    placeholder="Enter your answer..."
                    value={userAnswers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    rows={item.type === 'frq' ? 6 : 3}
                    className="w-full"
                  />
                </div>
              )}

              {/* Show Answer Section */}
              {showAnswers.has(index) && (
                <div className="space-y-3 pt-4 border-t">
                  {/* User Answer Feedback */}
                  {userAnswers[index] && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        {checkAnswer(index) ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">Correct!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">Not quite right</span>
                          </>
                        )}
                      </div>
                    </Alert>
                  )}

                  {/* Correct Answer */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800 mb-1">Correct Answer:</div>
                    {editingItem === index ? (
                      <Textarea
                        value={(editValues.answer as string) || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, answer: e.target.value }))}
                        className="bg-white"
                        rows={2}
                      />
                    ) : (
                      <p className="text-green-700">{item.answer}</p>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800 mb-1">Explanation:</div>
                    {editingItem === index ? (
                      <Textarea
                        value={(editValues.explanation as string) || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, explanation: e.target.value }))}
                        className="bg-white"
                        rows={3}
                      />
                    ) : (
                      <p className="text-blue-700">{item.explanation}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Edit Actions */}
              {editingItem === index && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => submitFix(index)} size="sm">
                    Submit Fix
                  </Button>
                  <Button variant="outline" onClick={cancelEditing} size="sm">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Notes */}
      {structured.notes && structured.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              {structured.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
