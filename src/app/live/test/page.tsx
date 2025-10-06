'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calculator, Flag, StickyNote, Highlighter, X, Check, ChevronLeft, ChevronRight, Clock, Maximize2, Minimize2, Eye, EyeOff, Home, Lock, Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// Question interface
interface Question {
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

interface UserAnswer {
  questionId: string
  selectedAnswer: string | null
  eliminated: string[]
  flagged: boolean
  note: string
  highlightedText: string[]
}

const TestViewPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const testId = searchParams?.get('test')

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentModule, setCurrentModule] = useState(1)
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({})
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorMinimized, setCalculatorMinimized] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(3840) // 64 minutes in seconds
  const [timerVisible, setTimerVisible] = useState(true)
  const [testStarted, setTestStarted] = useState(false)
  const [testSubmitted, setTestSubmitted] = useState(false)
  const [highlighterActive, setHighlighterActive] = useState(false)
  const [answerEliminatorActive, setAnswerEliminatorActive] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [hasResources, setHasResources] = useState(false)
  const [loadingResources, setLoadingResources] = useState(true)

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : null

  // Initialize user answers
  useEffect(() => {
    const initAnswers: Record<string, UserAnswer> = {}
    questions.forEach(q => {
      initAnswers[q.id] = {
        questionId: q.id,
        selectedAnswer: null,
        eliminated: [],
        flagged: false,
        note: '',
        highlightedText: []
      }
    })
    setUserAnswers(initAnswers)
  }, [questions])

  // Load test questions
  useEffect(() => {
    const loadQuestions = async () => {
      if (!testId) return

      setLoadingResources(true)
      const { data } = await supabase
        .from('test_resources')
        .select('questions')
        .eq('test_id', testId)
        .single()

      if (data?.questions) {
        setQuestions(data.questions as Question[])
        setHasResources(true)
        setLoadingResources(false)
      } else {
        // No resources available - test is locked
        setHasResources(false)
        setLoadingResources(false)
      }
    }

    loadQuestions()
  }, [testId])

  // Timer countdown
  useEffect(() => {
    if (!testStarted || testSubmitted) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          handleSubmitModule()
          return 0
        }

        // Show timer when 5 minutes remaining
        if (prev === 300 && !timerVisible) {
          setTimerVisible(true)
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [testStarted, testSubmitted, timerVisible])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (letter: string) => {
    if (!currentQuestion || testSubmitted) return

    const newUserAnswers = { ...userAnswers }
    newUserAnswers[currentQuestion.id] = {
      ...newUserAnswers[currentQuestion.id],
      selectedAnswer: letter
    }
    setUserAnswers(newUserAnswers)
  }

  const toggleEliminate = (letter: string) => {
    if (!currentQuestion || testSubmitted) return

    const newUserAnswers = { ...userAnswers }
    const currentEliminated = newUserAnswers[currentQuestion.id].eliminated

    if (currentEliminated.includes(letter)) {
      newUserAnswers[currentQuestion.id].eliminated = currentEliminated.filter(l => l !== letter)
    } else {
      newUserAnswers[currentQuestion.id].eliminated = [...currentEliminated, letter]
    }

    setUserAnswers(newUserAnswers)
  }

  const toggleFlag = () => {
    if (!currentQuestion || testSubmitted) return

    const newUserAnswers = { ...userAnswers }
    newUserAnswers[currentQuestion.id].flagged = !newUserAnswers[currentQuestion.id].flagged
    setUserAnswers(newUserAnswers)
  }

  const handleSubmitModule = async () => {
    setTestSubmitted(true)
    setShowResults(true)

    // Save progress to database
    if (user) {
      const progress = Object.entries(userAnswers).map(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId)
        return {
          user_id: user.id,
          test_id: testId,
          question_id: questionId,
          selected_answer: answer.selectedAnswer,
          is_correct: answer.selectedAnswer === question?.correctAnswer,
          created_at: new Date().toISOString()
        }
      })

      await supabase
        .from('test_user_progress')
        .upsert(progress, { onConflict: 'user_id,test_id,question_id' })
    }
  }

  const moduleQuestions = questions.filter(q => q.module === currentModule)
  const questionsInModule = moduleQuestions.length
  const answeredInModule = moduleQuestions.filter(q => userAnswers[q.id]?.selectedAnswer).length

  const getQuestionStatus = (question: Question) => {
    const answer = userAnswers[question.id]
    if (!answer) return 'unanswered'
    if (answer.flagged) return 'flagged'
    if (answer.selectedAnswer) return 'answered'
    if (answer.eliminated.length > 0) return 'eliminated'
    return 'unanswered'
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach(q => {
      const answer = userAnswers[q.id]
      if (answer?.selectedAnswer === q.correctAnswer) {
        correct++
      }
    })
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) }
  }

  // Smooth navigation to question
  const navigateToQuestion = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentQuestionIndex(index)
      setIsTransitioning(false)
    }, 150)
  }

  // Show locked state if no resources
  if (loadingResources) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-[#0E66FF] animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Test...</h2>
          <p className="text-gray-600">Please wait while we prepare your test</p>
        </div>
      </div>
    )
  }

  if (!hasResources) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <Lock className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Test Locked</h2>
          <p className="text-gray-600 mb-8">
            This test does not have any questions uploaded yet. An administrator needs to upload content before this test becomes available.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push('/live')}
              variant="outline"
              className="px-6 py-6"
            >
              Back to Tests
            </Button>
            <Button
              onClick={() => router.push(`/live/upload?test=${testId}&name=${encodeURIComponent('Test')}`)}
              className="bg-[#0E66FF] hover:bg-[#0052CC] text-white px-6 py-6"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Content (Admin)
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Digital SAT Practice Test</h1>
          <div className="space-y-4 mb-8">
            <p className="text-gray-700">
              <strong>Test ID:</strong> {testId}
            </p>
            <p className="text-gray-700">
              <strong>Total Questions:</strong> {questions.length}
            </p>
            <p className="text-gray-700">
              <strong>Time Limit:</strong> 64 minutes
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>You can navigate within the current module only</li>
                <li>Use the question palette to jump to any question</li>
                <li>Flag questions for review</li>
                <li>Use the built-in calculator, highlighter, and answer eliminator tools</li>
                <li>Answers auto-save and auto-submit when time expires</li>
                <li>Do NOT close your device during the test</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setTestStarted(true)}
              className="flex-1 bg-[#0E66FF] hover:bg-[#0052CC] text-white font-semibold py-6 text-lg"
            >
              Begin Test
            </Button>
            <Button
              onClick={() => router.push('/live')}
              variant="outline"
              className="px-6 py-6"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (testSubmitted && showResults) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h1>
            <p className="text-gray-600">Your answers have been submitted</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Score</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Correct Answers:</span>
              <span className="text-2xl font-bold text-green-600">{score.correct} / {score.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Percentage:</span>
              <span className="text-2xl font-bold text-blue-600">{score.percentage}%</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setShowResults(false)
                setTestSubmitted(false)
                setCurrentQuestionIndex(0)
              }}
              className="flex-1 bg-[#0E66FF] hover:bg-[#0052CC] text-white font-semibold py-6"
            >
              Review Answers
            </Button>
            <Button
              onClick={() => router.push('/live')}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 font-semibold py-6"
            >
              Back to Tests
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="text-sm text-gray-600">
          Digital SAT — Module {currentModule} of 2
        </div>
        <div className="text-sm font-medium text-gray-900">
          Reading & Writing — Module {currentModule}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTimerVisible(!timerVisible)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            {timerVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {timerVisible && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeRemaining <= 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm font-medium">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* Main Content */}
          <div className={`space-y-4 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-6 flex items-center justify-between">
                <button 
                  onClick={() => {/* Open question selector */}}
                  className="text-sm font-medium text-[#0E66FF] hover:text-[#0052CC] transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  <span>Question {currentQuestion?.questionNumber} of {questions.length}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Passage */}
              {currentQuestion?.passage && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg max-h-[300px] overflow-y-auto">
                  <p className="text-gray-800 leading-relaxed">{currentQuestion.passage}</p>
                </div>
              )}

              {/* Question Text */}
              <div className="mb-8">
                <p className="text-[18px] leading-[1.45] text-gray-900">{currentQuestion?.questionText}</p>
              </div>

              {/* Answer Choices */}
              <div className="space-y-3">
                {currentQuestion?.choices.map((choice) => {
                  const isSelected = currentAnswer?.selectedAnswer === choice.letter
                  const isEliminated = currentAnswer?.eliminated.includes(choice.letter)
                  const isCorrect = showResults && choice.letter === currentQuestion.correctAnswer
                  const isWrong = showResults && isSelected && choice.letter !== currentQuestion.correctAnswer

                  return (
                    <button
                      key={choice.letter}
                      onClick={() => handleAnswerSelect(choice.letter)}
                      disabled={testSubmitted && !showResults}
                      className={`
                        w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all
                        ${isSelected && !showResults ? 'border-[#0E66FF] bg-[#0E66FF]/5 shadow-md' : 'border-[#E6E7EB] hover:border-[#B8BAC0] hover:shadow-sm'}
                        ${isEliminated ? 'opacity-40' : ''}
                        ${isCorrect ? 'border-green-500 bg-green-50 shadow-md' : ''}
                        ${isWrong ? 'border-red-500 bg-red-50 shadow-md' : ''}
                      `}
                    >
                      <div className={`
                        min-w-[36px] w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-semibold text-[16px]
                        ${isSelected && !showResults ? 'border-[#0E66FF] bg-[#0E66FF] text-white' : 'border-[#B8BAC0] text-gray-700 bg-white'}
                        ${isCorrect ? 'border-green-500 bg-green-500 text-white' : ''}
                        ${isWrong ? 'border-red-500 bg-red-500 text-white' : ''}
                      `}>
                        {isCorrect ? <Check className="w-5 h-5" /> : isWrong ? <X className="w-5 h-5" /> : choice.letter}
                      </div>
                      <div className="flex-1 text-left pt-1">
                        <span className={`text-[16px] leading-[1.4] text-gray-800 ${isEliminated ? 'line-through' : ''}`}>{choice.text}</span>
                      </div>
                      {answerEliminatorActive && !testSubmitted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleEliminate(choice.letter)
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation (shown after submission) */}
              {showResults && currentQuestion?.explanation && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                  <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                </div>
              )}
            </div>

            {/* Tool Bar */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFlag}
                  className={currentAnswer?.flagged ? 'bg-orange-50 border-orange-300' : ''}
                >
                  <Flag className={`w-4 h-4 ${currentAnswer?.flagged ? 'fill-orange-500 text-orange-500' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHighlighterActive(!highlighterActive)}
                  className={highlighterActive ? 'bg-yellow-50 border-yellow-300' : ''}
                >
                  <Highlighter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAnswerEliminatorActive(!answerEliminatorActive)}
                  className={answerEliminatorActive ? 'bg-red-50 border-red-300' : ''}
                >
                  <X className="w-4 h-4" />
                  <span className="ml-1 text-xs">Eliminate</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCalculator(!showCalculator)}
                >
                  <Calculator className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToQuestion(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToQuestion(Math.min(moduleQuestions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === moduleQuestions.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">Progress</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {answeredInModule} / {questionsInModule}
              </div>
              <div className="text-xs text-gray-500">Answered</div>
            </div>

            {/* Question Palette */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-700 mb-3">Questions</div>
              <div className="grid grid-cols-6 gap-2">
                {moduleQuestions.map((question, idx) => {
                  const status = getQuestionStatus(question)
                  const isCurrent = currentQuestionIndex === idx

                  return (
                    <button
                      key={question.id}
                      onClick={() => navigateToQuestion(idx)}
                      className={`
                        w-full aspect-square rounded-lg border-2 text-sm font-semibold transition-all hover:scale-105
                        ${isCurrent ? 'ring-2 ring-[#0E66FF] ring-offset-2' : ''}
                        ${status === 'answered' ? 'bg-[#0E66FF] text-white border-[#0E66FF]' : ''}
                        ${status === 'flagged' ? 'bg-orange-50 border-orange-300 text-orange-700' : ''}
                        ${status === 'unanswered' ? 'bg-white border-gray-300 text-gray-700 hover:border-gray-400' : ''}
                      `}
                    >
                      {question.questionNumber}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit Button */}
            {!testSubmitted && (
              <Button
                onClick={handleSubmitModule}
                className="w-full bg-[#0E66FF] hover:bg-[#0052CC] text-white font-semibold py-6"
              >
                Submit Module
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className={`fixed ${calculatorMinimized ? 'bottom-4 right-4 w-16 h-16' : 'top-1/2 right-8 -translate-y-1/2 w-80'} bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all`}>
          <div className="bg-gray-100 p-3 rounded-t-xl flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Calculator</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalculatorMinimized(!calculatorMinimized)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {calculatorMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {!calculatorMinimized && (
            <div className="p-4">
              <div className="bg-gray-800 text-white text-right text-2xl p-4 rounded mb-4 font-mono">0</div>
              <div className="grid grid-cols-4 gap-2">
                {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
                  <button
                    key={btn}
                    className="bg-gray-200 hover:bg-gray-300 p-4 rounded font-semibold text-gray-800 transition-colors"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TestViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">Loading test...</div>}>
      <TestViewPageContent />
    </Suspense>
  )
}
