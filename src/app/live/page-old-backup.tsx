'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Calendar, Bell, CheckCircle2, Loader2, ChevronRight, BookOpen, GraduationCap } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface TestDate {
  id: string
  name: string
  fullName: string
  date: Date
  description: string
  color: string
  icon: string
  category?: string
  subjects?: string[]
  requiresState?: boolean
}

const TEST_DATES: TestDate[] = [
  {
    id: 'sat',
    name: 'SAT',
    fullName: 'SAT Reasoning Test',
    date: new Date('2025-03-08T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions'
  },
  {
    id: 'act',
    name: 'ACT',
    fullName: 'American College Testing',
    date: new Date('2025-02-08T08:00:00'),
    description: 'Standardized test for college admissions in the US',
    color: 'from-green-500 to-green-600',
    icon: '✏️',
    category: 'College Admissions'
  },
  {
    id: 'mcat',
    name: 'MCAT',
    fullName: 'Medical College Admission Test',
    date: new Date('2025-03-14T08:00:00'),
    description: 'Standardized examination for medical school admissions',
    color: 'from-red-500 to-red-600',
    icon: '🏥',
    category: 'Graduate Admissions'
  },
  {
    id: 'toefl',
    name: 'TOEFL',
    fullName: 'Test of English as a Foreign Language',
    date: new Date('2025-02-22T09:00:00'),
    description: 'English proficiency test for non-native speakers',
    color: 'from-purple-500 to-purple-600',
    icon: '🌍',
    category: 'Language Proficiency'
  },
  {
    id: 'psat',
    name: 'PSAT',
    fullName: 'Preliminary SAT/National Merit Scholarship Qualifying Test',
    date: new Date('2025-10-15T08:00:00'),
    description: 'Practice test for SAT and National Merit Scholarship qualifier',
    color: 'from-indigo-500 to-indigo-600',
    icon: '📝',
    category: 'College Admissions'
  }
]

// Comprehensive AP Exams List (2025 Schedule)
const AP_EXAMS: TestDate[] = [
  {
    id: 'ap-art-history',
    name: 'AP Art History',
    fullName: 'Advanced Placement Art History',
    date: new Date('2025-05-05T08:00:00'),
    description: 'Explore art from prehistoric to contemporary periods',
    color: 'from-pink-500 to-rose-600',
    icon: '🎨',
    category: 'AP Exams'
  },
  {
    id: 'ap-biology',
    name: 'AP Biology',
    fullName: 'Advanced Placement Biology',
    date: new Date('2025-05-12T08:00:00'),
    description: 'College-level biology covering evolution, cells, and genetics',
    color: 'from-green-500 to-emerald-600',
    icon: '🧬',
    category: 'AP Exams'
  },
  {
    id: 'ap-calculus-ab',
    name: 'AP Calculus AB',
    fullName: 'Advanced Placement Calculus AB',
    date: new Date('2025-05-06T08:00:00'),
    description: 'Limits, derivatives, integrals and the Fundamental Theorem',
    color: 'from-blue-500 to-cyan-600',
    icon: '📐',
    category: 'AP Exams'
  },
  {
    id: 'ap-calculus-bc',
    name: 'AP Calculus BC',
    fullName: 'Advanced Placement Calculus BC',
    date: new Date('2025-05-06T08:00:00'),
    description: 'Extended calculus including series and parametric functions',
    color: 'from-blue-600 to-indigo-600',
    icon: '∫',
    category: 'AP Exams'
  },
  {
    id: 'ap-chemistry',
    name: 'AP Chemistry',
    fullName: 'Advanced Placement Chemistry',
    date: new Date('2025-05-07T08:00:00'),
    description: 'College-level chemistry covering atomic structure and reactions',
    color: 'from-teal-500 to-cyan-600',
    icon: '⚗️',
    category: 'AP Exams'
  },
  {
    id: 'ap-computer-science-a',
    name: 'AP Computer Science A',
    fullName: 'Advanced Placement Computer Science A',
    date: new Date('2025-05-08T12:00:00'),
    description: 'Java programming including data structures and algorithms',
    color: 'from-slate-500 to-gray-600',
    icon: '💻',
    category: 'AP Exams'
  },
  {
    id: 'ap-computer-science-principles',
    name: 'AP Computer Science Principles',
    fullName: 'Advanced Placement Computer Science Principles',
    date: new Date('2025-05-15T12:00:00'),
    description: 'Foundational CS concepts including internet and cybersecurity',
    color: 'from-violet-500 to-purple-600',
    icon: '🖥️',
    category: 'AP Exams'
  },
  {
    id: 'ap-english-lang',
    name: 'AP English Language',
    fullName: 'Advanced Placement English Language and Composition',
    date: new Date('2025-05-14T08:00:00'),
    description: 'Rhetoric and composition skills through reading and writing',
    color: 'from-amber-500 to-orange-600',
    icon: '📖',
    category: 'AP Exams'
  },
  {
    id: 'ap-english-lit',
    name: 'AP English Literature',
    fullName: 'Advanced Placement English Literature and Composition',
    date: new Date('2025-05-09T08:00:00'),
    description: 'Literary analysis through reading and discussing literature',
    color: 'from-yellow-500 to-amber-600',
    icon: '📚',
    category: 'AP Exams'
  },
  {
    id: 'ap-environmental-science',
    name: 'AP Environmental Science',
    fullName: 'Advanced Placement Environmental Science',
    date: new Date('2025-05-13T08:00:00'),
    description: 'Scientific principles and analysis of environmental issues',
    color: 'from-lime-500 to-green-600',
    icon: '🌱',
    category: 'AP Exams'
  },
  {
    id: 'ap-european-history',
    name: 'AP European History',
    fullName: 'Advanced Placement European History',
    date: new Date('2025-05-09T12:00:00'),
    description: 'European history from 1450 to the present',
    color: 'from-red-500 to-pink-600',
    icon: '🏰',
    category: 'AP Exams'
  },
  {
    id: 'ap-french',
    name: 'AP French Language',
    fullName: 'Advanced Placement French Language and Culture',
    date: new Date('2025-05-13T12:00:00'),
    description: 'French language proficiency and cultural understanding',
    color: 'from-blue-500 to-indigo-600',
    icon: '�🇷',
    category: 'AP Exams'
  },
  {
    id: 'ap-spanish',
    name: 'AP Spanish Language',
    fullName: 'Advanced Placement Spanish Language and Culture',
    date: new Date('2025-05-08T08:00:00'),
    description: 'Spanish language proficiency and cultural understanding',
    color: 'from-yellow-500 to-red-600',
    icon: '🇪🇸',
    category: 'AP Exams'
  },
  {
    id: 'ap-physics-1',
    name: 'AP Physics 1',
    fullName: 'Advanced Placement Physics 1: Algebra-Based',
    date: new Date('2025-05-07T12:00:00'),
    description: 'Algebra-based physics including mechanics and waves',
    color: 'from-cyan-500 to-blue-600',
    icon: '⚡',
    category: 'AP Exams'
  },
  {
    id: 'ap-physics-2',
    name: 'AP Physics 2',
    fullName: 'Advanced Placement Physics 2: Algebra-Based',
    date: new Date('2025-05-15T12:00:00'),
    description: 'Algebra-based physics including thermodynamics and modern physics',
    color: 'from-sky-500 to-cyan-600',
    icon: '🔬',
    category: 'AP Exams'
  },
  {
    id: 'ap-psychology',
    name: 'AP Psychology',
    fullName: 'Advanced Placement Psychology',
    date: new Date('2025-05-08T12:00:00'),
    description: 'Systematic study of behavior and mental processes',
    color: 'from-purple-500 to-fuchsia-600',
    icon: '🧠',
    category: 'AP Exams'
  },
  {
    id: 'ap-statistics',
    name: 'AP Statistics',
    fullName: 'Advanced Placement Statistics',
    date: new Date('2025-05-15T08:00:00'),
    description: 'Collecting, analyzing, and drawing conclusions from data',
    color: 'from-indigo-500 to-purple-600',
    icon: '📊',
    category: 'AP Exams'
  },
  {
    id: 'ap-us-government',
    name: 'AP US Government',
    fullName: 'Advanced Placement United States Government and Politics',
    date: new Date('2025-05-12T08:00:00'),
    description: 'US political system including Constitution and civil liberties',
    color: 'from-red-500 to-blue-600',
    icon: '🏛️',
    category: 'AP Exams'
  },
  {
    id: 'ap-us-history',
    name: 'AP US History',
    fullName: 'Advanced Placement United States History',
    date: new Date('2025-05-06T08:00:00'),
    description: 'US history from pre-Columbian to the present',
    color: 'from-red-600 to-blue-500',
    icon: '🗽',
    category: 'AP Exams'
  },
  {
    id: 'ap-world-history',
    name: 'AP World History',
    fullName: 'Advanced Placement World History: Modern',
    date: new Date('2025-05-14T08:00:00'),
    description: 'World history from 1200 CE to the present',
    color: 'from-orange-500 to-red-600',
    icon: '🌍',
    category: 'AP Exams'
  }
]

// Regents Exams by State
const REGENTS_STATES = [
  { value: 'ny', label: 'New York' }
  // Regents exams are primarily New York State exams
]

const REGENTS_EXAMS: TestDate[] = [
  {
    id: 'regents-algebra-1',
    name: 'Algebra I Regents',
    fullName: 'New York State Regents Algebra I',
    date: new Date('2025-06-17T09:00:00'),
    description: 'NYS Regents exam covering algebra fundamentals',
    color: 'from-blue-500 to-indigo-600',
    icon: '➕',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-geometry',
    name: 'Geometry Regents',
    fullName: 'New York State Regents Geometry',
    date: new Date('2025-06-18T09:00:00'),
    description: 'NYS Regents exam covering geometric concepts',
    color: 'from-cyan-500 to-blue-600',
    icon: '📐',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-algebra-2',
    name: 'Algebra II Regents',
    fullName: 'New York State Regents Algebra II',
    date: new Date('2025-06-19T09:00:00'),
    description: 'NYS Regents exam covering advanced algebra',
    color: 'from-indigo-500 to-purple-600',
    icon: '∑',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-english',
    name: 'English Regents',
    fullName: 'New York State Regents English Language Arts',
    date: new Date('2025-06-17T09:00:00'),
    description: 'NYS Regents exam for English comprehension and composition',
    color: 'from-amber-500 to-orange-600',
    icon: '📝',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-living-environment',
    name: 'Living Environment Regents',
    fullName: 'New York State Regents Living Environment',
    date: new Date('2025-06-18T09:00:00'),
    description: 'NYS Regents biology exam',
    color: 'from-green-500 to-emerald-600',
    icon: '🌿',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-earth-science',
    name: 'Earth Science Regents',
    fullName: 'New York State Regents Earth Science',
    date: new Date('2025-06-20T09:00:00'),
    description: 'NYS Regents exam covering geology, meteorology, and astronomy',
    color: 'from-teal-500 to-cyan-600',
    icon: '🌎',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-chemistry',
    name: 'Chemistry Regents',
    fullName: 'New York State Regents Chemistry',
    date: new Date('2025-06-19T09:00:00'),
    description: 'NYS Regents chemistry exam',
    color: 'from-purple-500 to-pink-600',
    icon: '⚗️',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-physics',
    name: 'Physics Regents',
    fullName: 'New York State Regents Physics',
    date: new Date('2025-06-20T09:00:00'),
    description: 'NYS Regents physics exam',
    color: 'from-sky-500 to-blue-600',
    icon: '⚡',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-us-history',
    name: 'US History Regents',
    fullName: 'New York State Regents US History and Government',
    date: new Date('2025-06-17T13:30:00'),
    description: 'NYS Regents exam for American history',
    color: 'from-red-500 to-blue-600',
    icon: '🗽',
    category: 'NY Regents',
    requiresState: true
  },
  {
    id: 'regents-global-history',
    name: 'Global History Regents',
    fullName: 'New York State Regents Global History and Geography',
    date: new Date('2025-06-18T13:30:00'),
    description: 'NYS Regents exam for world history',
    color: 'from-orange-500 to-red-600',
    icon: '🌍',
    category: 'NY Regents',
    requiresState: true
  }
]

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function LivePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedTest, setSelectedTest] = useState<TestDate | null>(null)
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [countdowns, setCountdowns] = useState<Record<string, TimeRemaining>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedState, setSelectedState] = useState<string>('')
  const [showAPDialog, setShowAPDialog] = useState(false)
  const [showRegentsDialog, setShowRegentsDialog] = useState(false)

  // Combine all tests
  const allTests = [...TEST_DATES, ...AP_EXAMS, ...(selectedState === 'ny' ? REGENTS_EXAMS : [])]

  // Calculate countdown for each test
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, TimeRemaining> = {}
      
      allTests.forEach(test => {
        const now = new Date().getTime()
        const testTime = test.date.getTime()
        const distance = testTime - now

        if (distance > 0) {
          newCountdowns[test.id] = {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          }
        } else {
          newCountdowns[test.id] = { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }
      })
      
      setCountdowns(newCountdowns)
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 1000)

    return () => clearInterval(interval)
  }, [selectedState])

  const handleTestClick = (test: TestDate) => {
    const countdown = countdowns[test.id]
    const isPast = countdown && countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0

    if (isPast) {
      // Timer expired - go to upload page
      router.push(`/live/upload?test=${test.id}&name=${encodeURIComponent(test.name)}`)
    } else {
      // Timer still running - show waitlist
      setSelectedTest(test)
      setShowWaitlistDialog(true)
      setSubmitted(false)
    }
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Store waitlist signup in database if configured
      if (isSupabaseConfigured && selectedTest) {
        const { error } = await supabase
          .from('test_waitlist')
          .insert({
            test_id: selectedTest.id,
            test_name: selectedTest.name,
            email: email.trim(),
            name: name.trim(),
            user_id: user?.id || null
          })

        if (error) {
          // If table doesn't exist, just log it
          console.log('Waitlist table may not exist yet:', error.message)
        }
      }

      setSubmitted(true)
      setEmail('')
      setName('')
    } catch (error) {
      console.error('Error submitting to waitlist:', error)
      // Still show success to user
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  // Filter tests by category
  const filteredTests = allTests.filter(test => {
    if (selectedCategory === 'all') return true
    return test.category === selectedCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full mb-4 shadow-lg animate-pulse">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Live Test Countdown
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time countdowns to major standardized tests. Join waitlists, access study materials, and never miss an exam date.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className={selectedCategory === 'all' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            All Tests
          </Button>
          <Button
            onClick={() => setSelectedCategory('College Admissions')}
            variant={selectedCategory === 'College Admissions' ? 'default' : 'outline'}
            className={selectedCategory === 'College Admissions' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            College Admissions
          </Button>
          <Button
            onClick={() => {
              setShowAPDialog(true)
            }}
            variant={selectedCategory === 'AP Exams' ? 'default' : 'outline'}
            className={selectedCategory === 'AP Exams' ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            AP Exams ({AP_EXAMS.length})
          </Button>
          <Button
            onClick={() => setShowRegentsDialog(true)}
            variant={selectedCategory === 'NY Regents' ? 'default' : 'outline'}
            className={selectedCategory === 'NY Regents' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Regents Exams
          </Button>
        </div>

        {/* Regents State Selector */}
        {selectedCategory === 'NY Regents' && (
          <Card className="mb-8 border-2 border-green-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label htmlFor="state" className="text-lg font-semibold whitespace-nowrap">
                  Select Your State:
                </Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Choose your state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REGENTS_STATES.map(state => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!selectedState && (
                <p className="text-sm text-gray-600 mt-3">
                  Note: Regents exams are specific to New York State. Select NY to see available exams.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            const countdown = countdowns[test.id]
            const isPast = countdown && countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0

            return (
              <Card 
                key={test.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 hover:border-indigo-300 bg-white"
                onClick={() => handleTestClick(test)}
              >
                <div className={`h-3 bg-gradient-to-r ${test.color}`} />
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold mb-1 flex items-center gap-2">
                        <span className="text-4xl">{test.icon}</span>
                        <span>{test.name}</span>
                      </CardTitle>
                      <p className="text-xs text-gray-500 font-medium">{test.fullName}</p>
                      {test.category && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {test.category}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 min-h-[40px]">{test.description}</p>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">{formatDate(test.date)}</span>
                    </div>

                    {countdown && !isPast ? (
                      <div className="bg-white rounded-lg p-4 shadow-md border-2 border-indigo-100">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Time Remaining</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2">
                            <div className={`text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                              {countdown.days}
                            </div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Days</div>
                          </div>
                          <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2">
                            <div className={`text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                              {countdown.hours}
                            </div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Hours</div>
                          </div>
                          <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2">
                            <div className={`text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                              {countdown.minutes}
                            </div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Mins</div>
                          </div>
                          <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2">
                            <div className={`text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                              {countdown.seconds}
                            </div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Secs</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <span className="text-green-700 font-semibold text-sm">Test Date Passed - Upload Materials</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className={`w-full bg-gradient-to-r ${test.color} hover:opacity-90 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTestClick(test)
                    }}
                  >
                    {isPast ? (
                      <>
                        <ChevronRight className="w-5 h-5 mr-2" />
                        Upload Test Materials
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5 mr-2" />
                        Join Waitlist
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border-2 border-indigo-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Why Join the Waitlist?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Get Reminders</h3>
              <p className="text-gray-600 text-sm">Receive timely notifications before your test date so you never miss important deadlines</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Study Resources</h3>
              <p className="text-gray-600 text-sm">Access curated study materials, practice tests, and expert tips to maximize your score</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Early Access</h3>
              <p className="text-gray-600 text-sm">Be the first to know about prep courses, study groups, and exclusive events</p>
            </div>
          </div>
        </div>
      </main>

      {/* AP Exams Dialog */}
      <Dialog open={showAPDialog} onOpenChange={setShowAPDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-orange-600" />
              AP Exams 2025
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-gray-600">
              Select an AP exam to join the waitlist and get reminders. All exams are administered by the College Board in May 2025.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AP_EXAMS.map(exam => (
                <button
                  key={exam.id}
                  onClick={() => {
                    setSelectedCategory('AP Exams')
                    setShowAPDialog(false)
                    handleTestClick(exam)
                  }}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
                >
                  <span className="text-3xl">{exam.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{exam.name}</div>
                    <div className="text-xs text-gray-500">{formatDate(exam.date)}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setSelectedCategory('AP Exams')
                  setShowAPDialog(false)
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
              >
                View All AP Exams
              </Button>
              <Button
                onClick={() => setShowAPDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regents Dialog */}
      <Dialog open={showRegentsDialog} onOpenChange={setShowRegentsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-green-600" />
              Regents Exams
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <p className="text-gray-600">
              Regents Examinations are statewide standardized tests in New York State. Select your state to view available exams.
            </p>
            
            <div>
              <Label htmlFor="regents-state" className="text-lg font-semibold mb-3 block">
                Select Your State:
              </Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger id="regents-state">
                  <SelectValue placeholder="Choose your state..." />
                </SelectTrigger>
                <SelectContent>
                  {REGENTS_STATES.map(state => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedState === 'ny' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-green-900">
                  New York State Regents - {REGENTS_EXAMS.length} Available Exams
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {REGENTS_EXAMS.map(exam => (
                    <div key={exam.id} className="flex items-center gap-2">
                      <span>{exam.icon}</span>
                      <span className="text-gray-700">{exam.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (selectedState) {
                    setSelectedCategory('NY Regents')
                    setShowRegentsDialog(false)
                  }
                }}
                disabled={!selectedState}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
              >
                {selectedState ? 'View Regents Exams' : 'Select State First'}
              </Button>
              <Button
                onClick={() => setShowRegentsDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waitlist Dialog */}
      <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {selectedTest && (
                <>
                  <span className="text-3xl">{selectedTest.icon}</span>
                  Join {selectedTest.name} Waitlist
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {!submitted ? (
            <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-4">
              {selectedTest && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formatDate(selectedTest.date)}</span>
                  </div>
                  {countdowns[selectedTest.id] && (
                    <div className="text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {countdowns[selectedTest.id].days} days, {countdowns[selectedTest.id].hours} hours remaining
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">What you&apos;ll get:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Countdown reminders via email</li>
                  <li>Study tips and resources</li>
                  <li>Test day preparation checklist</li>
                  <li>Early access to prep materials</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${selectedTest ? `bg-gradient-to-r ${selectedTest.color}` : 'bg-indigo-600'} hover:opacity-90 text-white font-semibold py-6`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </div>
                ) : (
                  <>
                    <Bell className="w-5 h-5 mr-2" />
                    Join Waitlist
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re on the list!</h3>
              <p className="text-gray-600 mb-6">
                We&apos;ll send you reminders and study resources for the {selectedTest?.name}.
              </p>
              <Button
                onClick={() => {
                  setShowWaitlistDialog(false)
                  setSubmitted(false)
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
