'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Clock, Calendar, Bell, CheckCircle2, Loader2, ChevronRight, AlertCircle, BookOpen, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { STANDARDIZED_TESTS_2025, AP_EXAMS_2025, REGENTS_NY_2025 } from '@/lib/test-dates'

interface TestDate {
  id: string
  name: string
  fullName: string
  date: Date
  time?: string
  description?: string
  color: string
  icon: string
  category?: string
  hasResources?: boolean
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

type TestStatus = 'upcoming' | 'thisWeek' | 'past' | 'archived'

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default function LivePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedTest, setSelectedTest] = useState<TestDate | null>(null)
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [countdowns, setCountdowns] = useState<Record<string, TimeRemaining>>({})
  const [mounted, setMounted] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  // Filters for Archived (Past) tests
  const [archiveFilters, setArchiveFilters] = useState<{ month: string; year: string; category: string }>({ month: 'all', year: 'all', category: 'all' })

  // Prevent flicker during interaction: lock updates briefly after clicks
  const interactionLockRef = useRef(false)
  const lockInteractions = useCallback((ms: number = 1200) => {
    interactionLockRef.current = true
    setTimeout(() => { interactionLockRef.current = false }, ms)
  }, [])

  // Priority order: SAT, ACT, PSAT first
  const priorityTests = useMemo(() => {
    // Clone before sort to avoid mutating the imported array
    return [...STANDARDIZED_TESTS_2025].sort((a, b) => {
      const priority = { SAT: 0, ACT: 1, PSAT: 2 } as const
      const aPriority = (priority as any)[a.name] ?? 999
      const bPriority = (priority as any)[b.name] ?? 999
      if (aPriority !== bPriority) return aPriority - bPriority
      return a.date.getTime() - b.date.getTime()
    })
  }, [])

  // AP Exams section
  const apTests = useMemo(() => {
    return AP_EXAMS_2025.map(exam => ({
      ...exam,
      category: 'AP Exams',
      description: `AP ${exam.name} exam`
    })).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [])

  // All tests combined
  const allTests: TestDate[] = useMemo(() => [
    ...priorityTests,
    ...apTests
  ], [priorityTests, apTests])

  // Calculate countdown for each test
  const calculateCountdown = useCallback((testDate: Date): TimeRemaining => {
    const now = new Date().getTime()
    const testTime = testDate.getTime()
    const distance = testTime - now

    if (distance > 0) {
      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      }
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }, [])

  // Get test status
  const getTestStatus = useCallback((testDate: Date, countdown: TimeRemaining | null): TestStatus => {
    const now = new Date().getTime()
    const testTime = testDate.getTime()
    const timeDiff = testTime - now

    if (timeDiff < 0) {
      // Past test
      const daysSincePassed = Math.abs(Math.floor(timeDiff / (1000 * 60 * 60 * 24)))
      return daysSincePassed > 7 ? 'archived' : 'past'
    } else if (countdown && countdown.days <= 7) {
      return 'thisWeek'
    }
    return 'upcoming'
  }, [])

  // Update countdowns
  useEffect(() => {
    setMounted(true)

    const updateCountdowns = () => {
      // Skip updates while dialog open or during user interaction to avoid flicker
      if (showWaitlistDialog || interactionLockRef.current) return
      const newCountdowns: Record<string, TimeRemaining> = {}
      allTests.forEach(test => {
        newCountdowns[test.id] = calculateCountdown(test.date)
      })
      setCountdowns(prev => {
        // Avoid state churn if values didn't change
        let changed = false
        for (const k of Object.keys(newCountdowns)) {
          const a = prev[k]
          const b = newCountdowns[k]
          if (!a || a.days !== b.days || a.hours !== b.hours || a.minutes !== b.minutes || a.seconds !== b.seconds) {
            changed = true
            break
          }
        }
        return changed ? newCountdowns : prev
      })
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 1000)
    return () => clearInterval(interval)
  }, [allTests, calculateCountdown, showWaitlistDialog])

  // Categorize tests
  const categorizedTests = useMemo(() => {
    const priority: TestDate[] = []
    const ap: TestDate[] = []
    const archived: TestDate[] = []

    allTests.forEach(test => {
      const countdown = countdowns[test.id]
      const status = getTestStatus(test.date, countdown)

      if (status === 'archived') {
        archived.push(test)
      } else if (test.category === 'AP Exams') {
        ap.push(test)
      } else {
        priority.push(test)
      }
    })

    return { priority, ap, archived }
  }, [allTests, countdowns, getTestStatus])

  // Archived filter option lists
  const archivedMonths = useMemo<string[]>(() => {
    const set = new Set<string>()
    categorizedTests.archived.forEach(t => set.add(String(t.date.getMonth() + 1).padStart(2, '0')))
    return Array.from(set).sort()
  }, [categorizedTests.archived])

  const archivedYears = useMemo<string[]>(() => {
    const set = new Set<string>()
    categorizedTests.archived.forEach(t => set.add(String(t.date.getFullYear())))
    return Array.from(set).sort()
  }, [categorizedTests.archived])

  const archivedCategories = useMemo<string[]>(() => {
    const set = new Set<string>()
    categorizedTests.archived.forEach(t => set.add(t.category || t.name))
    return Array.from(set).sort()
  }, [categorizedTests.archived])

  // Apply filters to archived tests
  const filteredArchived = useMemo<TestDate[]>(() => {
    return categorizedTests.archived.filter(t => {
      const m = String(t.date.getMonth() + 1).padStart(2, '0')
      const y = String(t.date.getFullYear())
      const c = t.category || t.name
      return (archiveFilters.month === 'all' || archiveFilters.month === m)
        && (archiveFilters.year === 'all' || archiveFilters.year === y)
        && (archiveFilters.category === 'all' || archiveFilters.category === c)
    })
  }, [categorizedTests.archived, archiveFilters])

  const handleTestClick = async (test: TestDate) => {
    const countdown = countdowns[test.id]
    const status = getTestStatus(test.date, countdown)

    if (status === 'past' || status === 'archived') {
      // Navigate to the test page (Bluebook-style test interface)
      router.push(`/live/test?test=${test.id}`)
      return
    } else {
      // Upcoming test - show waitlist
      setSelectedTest(test)
      setShowWaitlistDialog(true)
      setSubmitted(false)
    }
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSupabaseConfigured && selectedTest) {
        const { error } = await supabase
          .from('test_waitlist')
          .insert({
            test_id: selectedTest.id,
            test_name: selectedTest.name,
            email: email.trim(),
            name: email.split('@')[0], // Use email prefix as name
            user_id: user?.id || null
          })

        if (error) {
          console.log('Waitlist table may not exist yet:', error.message)
        }
      }

      setSubmitted(true)
      setEmail('')
    } catch (error) {
      console.error('Error submitting to waitlist:', error)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Status indicator component
  const StatusIndicator = ({ status, countdown }: { status: TestStatus, countdown: TimeRemaining | null }) => {
    if (status === 'archived') {
      return (
        <div className="absolute top-2 right-2 w-3 h-3 bg-gray-400 rounded-full shadow-lg"
             title="Archived - over 1 week old" />
      )
    }
    if (status === 'past') {
      return (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse"
             title="Test available" />
      )
    }
    if (status === 'thisWeek') {
      return (
        <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full shadow-lg animate-pulse"
             title="This week!" />
      )
    }
    return (
      <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"
           title="Upcoming test" />
    )
  }

  // Test card component
  const TestCard = ({ test }: { test: TestDate }) => {
    const countdown = countdowns[test.id]
    const status = getTestStatus(test.date, countdown)
    const isPast = status === 'past' || status === 'archived'

    const onCardClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as HTMLButtonElement).blur()
      lockInteractions()
      handleTestClick(test)
    }

    return (
      <Card
        key={test.id}
        className="relative overflow-hidden border-2 bg-white"
      >
        {mounted && <StatusIndicator status={status} countdown={countdown} />}
        <div className={`h-2 sm:h-3 bg-gradient-to-r ${test.color}`} />

        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-6">
              <CardTitle className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {mounted && <span className="text-3xl sm:text-4xl">{test.icon}</span>}
                <span className="break-words">{test.name}</span>
              </CardTitle>
              <p className="text-xs text-gray-500 font-medium line-clamp-1">{test.fullName}</p>
              {test.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {test.category}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Description removed per user request */}

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-xs sm:text-sm">{formatDate(test.date)}</span>
                {test.time && <span className="text-xs text-gray-500">{test.time}</span>}
              </div>
            </div>

            {mounted && countdown && !isPast ? (
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-2 border-indigo-100">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Time Remaining</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-1.5 sm:p-2">
                    <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                      {countdown.days}
                    </div>
                    <div className="text-[9px] sm:text-xs text-gray-500 uppercase font-semibold">Days</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-1.5 sm:p-2">
                    <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                      {countdown.hours}
                    </div>
                    <div className="text-[9px] sm:text-xs text-gray-500 uppercase font-semibold">Hrs</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-1.5 sm:p-2">
                    <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                      {countdown.minutes}
                    </div>
                    <div className="text-[9px] sm:text-xs text-gray-500 uppercase font-semibold">Min</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-1.5 sm:p-2">
                    <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                      {countdown.seconds}
                    </div>
                    <div className="text-[9px] sm:text-xs text-gray-500 uppercase font-semibold">Sec</div>
                  </div>
                </div>
              </div>
            ) : mounted && status !== 'archived' ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4 text-center">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
                <span className="text-blue-700 font-semibold text-xs sm:text-sm">
                  Test Date Passed
                </span>
              </div>
            ) : mounted ? null : (
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4 text-center">
                <div className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            )}
          </div>

          <Button
            className={`w-full bg-gradient-to-r ${test.color} hover:opacity-90 text-white font-semibold py-5 sm:py-6 text-sm sm:text-base shadow-lg hover:shadow-xl transition-colors`}
            onClick={onCardClick}
            type="button"
          >
            {isPast ? (
              <>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                View
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Join Waitlist
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {/* Hero Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="inline-block p-3 sm:p-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full mb-3 sm:mb-4 shadow-lg animate-pulse">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Live Test Countdown
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Track upcoming exams with real-time countdowns and access practice materials.
          </p>

          {/* Quick Links */}
          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={() => router.push('/live/past')}
              variant="outline"
              className="bg-white hover:bg-indigo-50 border-2 border-indigo-300 text-indigo-700 font-semibold"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Past Tests Archive
            </Button>
            <Button
              onClick={() => router.push('/admin/waitlist')}
              variant="outline"
              className="bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-700 font-semibold"
            >
              <Users className="w-4 h-4 mr-2" />
              Admin: Waitlist
            </Button>
          </div>

          {/* Status Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-gray-600">This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-600">Available Now</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-gray-600">Archived</span>
            </div>
          </div>
        </div>

        {/* SAT, ACT, PSAT Section with Grouping */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            SAT, ACT & PSAT
          </h2>
          <div className="space-y-6">
            {(() => {
              // Group tests by name (SAT, ACT, PSAT)
              const groupedByName: Record<string, TestDate[]> = {}
              categorizedTests.priority.forEach(test => {
                if (!groupedByName[test.name]) {
                  groupedByName[test.name] = []
                }
                groupedByName[test.name].push(test)
              })

              // Sort each group by date (newest date first)
              Object.keys(groupedByName).forEach(name => {
                groupedByName[name].sort((a, b) => b.date.getTime() - a.date.getTime())
              })

              return Object.entries(groupedByName).map(([testName, tests]) => {
                const mostRecentTest = tests[0]
                const hasMultiple = tests.length > 1
                const isExpanded = expandedGroups[testName]

                return (
                  <div key={testName} className="space-y-4">
                    {/* Show most recent test */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                      <TestCard test={mostRecentTest} />

                      {/* Show expand button if multiple tests exist */}
                      {hasMultiple && !isExpanded && (
                        <div className="flex items-center justify-center">
                          <Button
                            onClick={() => setExpandedGroups(prev => ({ ...prev, [testName]: true }))}
                            variant="outline"
                            className="h-full w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <ChevronDown className="w-8 h-8 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">
                                Show {tests.length - 1} more {testName} date{tests.length - 1 > 1 ? 's' : ''}
                              </span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Show additional tests when expanded */}
                    {hasMultiple && isExpanded && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                          {tests.slice(1).map(test => (
                            <TestCard key={test.id} test={test} />
                          ))}
                        </div>
                        <div className="flex justify-center">
                          <Button
                            onClick={() => setExpandedGroups(prev => ({ ...prev, [testName]: false }))}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <ChevronUp className="w-4 h-4" />
                            Show less
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        </section>

        {/* AP Exams Section */}
        {categorizedTests.ap.length > 0 && (
          <section className="mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              AP Exams
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {categorizedTests.ap.map(test => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </section>
        )}

        {/* Archived Tests Section with Better Formatting */}
        {categorizedTests.archived.length > 0 && (
          <section className="mb-10 sm:mb-12">
            <div className="bg-white border-2 border-gray-300 rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Past Tests Archive</h2>
                  </div>
                  
                  {/* Desktop Filters */}
                  <div className="hidden md:flex items-center gap-2">
                    <select
                      className="bg-white border-2 border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      value={archiveFilters.month}
                      onChange={(e) => setArchiveFilters(prev => ({ ...prev, month: e.target.value }))}
                      aria-label="Filter month"
                    >
                      <option value="all">All Months</option>
                      {archivedMonths.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      className="bg-white border-2 border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      value={archiveFilters.year}
                      onChange={(e) => setArchiveFilters(prev => ({ ...prev, year: e.target.value }))}
                      aria-label="Filter year"
                    >
                      <option value="all">All Years</option>
                      {archivedYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <select
                      className="bg-white border-2 border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      value={archiveFilters.category}
                      onChange={(e) => setArchiveFilters(prev => ({ ...prev, category: e.target.value }))}
                      aria-label="Filter category"
                    >
                      <option value="all">All Subjects</option>
                      {archivedCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mobile Filters */}
                <div className="md:hidden grid grid-cols-3 gap-2 mt-3">
                  <select 
                    className="bg-white border-2 border-gray-300 rounded-lg px-2 py-1.5 text-xs font-medium"
                    value={archiveFilters.month} 
                    onChange={(e) => setArchiveFilters(prev => ({ ...prev, month: e.target.value }))}
                  >
                    <option value="all">Month</option>
                    {archivedMonths.map(m => (<option key={m} value={m}>{m}</option>))}
                  </select>
                  <select 
                    className="bg-white border-2 border-gray-300 rounded-lg px-2 py-1.5 text-xs font-medium"
                    value={archiveFilters.year} 
                    onChange={(e) => setArchiveFilters(prev => ({ ...prev, year: e.target.value }))}
                  >
                    <option value="all">Year</option>
                    {archivedYears.map(y => (<option key={y} value={y}>{y}</option>))}
                  </select>
                  <select 
                    className="bg-white border-2 border-gray-300 rounded-lg px-2 py-1.5 text-xs font-medium"
                    value={archiveFilters.category} 
                    onChange={(e) => setArchiveFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="all">Subject</option>
                    {archivedCategories.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>

              {/* Content Area with Better Spacing */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="space-y-8">
                  {(() => {
                    // Group archived tests by name (SAT, ACT, etc.)
                    const groupedByName: Record<string, TestDate[]> = {}
                    filteredArchived.forEach(test => {
                      if (!groupedByName[test.name]) {
                        groupedByName[test.name] = []
                      }
                      groupedByName[test.name].push(test)
                    })

                    // Sort each group by date (newest date first)
                    Object.keys(groupedByName).forEach(name => {
                      groupedByName[name].sort((a, b) => b.date.getTime() - a.date.getTime())
                    })

                    if (Object.keys(groupedByName).length === 0) {
                      return (
                        <div className="text-center py-12">
                          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg text-gray-600">No archived tests match your filters.</p>
                          <Button
                            onClick={() => setArchiveFilters({ month: 'all', year: 'all', category: 'all' })}
                            variant="outline"
                            className="mt-4"
                          >
                            Clear Filters
                          </Button>
                        </div>
                      )
                    }

                    return Object.entries(groupedByName).map(([testName, tests]) => {
                      const mostRecentTest = tests[0]
                      const hasMultiple = tests.length > 1
                      const isExpanded = expandedGroups[`archived-${testName}`]

                      return (
                        <div key={`archived-${testName}`} className="space-y-4">
                          {/* Show most recent test */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                            <TestCard test={mostRecentTest} />

                            {/* Show expand button if multiple tests exist */}
                            {hasMultiple && !isExpanded && (
                              <div className="flex items-center justify-center">
                                <Button
                                  onClick={() => setExpandedGroups(prev => ({ ...prev, [`archived-${testName}`]: true }))}
                                  variant="outline"
                                  className="h-full w-full min-h-[200px] border-2 border-dashed border-gray-400 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                                >
                                  <div className="flex flex-col items-center gap-3 p-4">
                                    <ChevronDown className="w-10 h-10 text-gray-500" />
                                    <span className="text-base font-semibold text-gray-700">
                                      View {tests.length - 1} More
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      Past {testName} Test{tests.length - 1 > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Show additional tests when expanded */}
                          {hasMultiple && isExpanded && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                                {tests.slice(1).map(test => (
                                  <TestCard key={test.id} test={test} />
                                ))}
                              </div>
                              <div className="flex justify-center pt-2">
                                <Button
                                  onClick={() => setExpandedGroups(prev => ({ ...prev, [`archived-${testName}`]: false }))}
                                  variant="outline"
                                  className="flex items-center gap-2 hover:bg-gray-100"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                  Show Less
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Info Section */}
        <div className="mt-10 sm:mt-12 md:mt-16 bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8 border-2 border-indigo-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8">
            <div className="text-center p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="inline-block p-3 sm:p-4 bg-blue-100 rounded-full mb-3 sm:mb-4">
                <Bell className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Before Test</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Join the waitlist to receive reminders and study resources before your exam date</p>
            </div>
            <div className="text-center p-4 sm:p-5 md:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="inline-block p-3 sm:p-4 bg-purple-100 rounded-full mb-3 sm:mb-4">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">After Test</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Access practice materials and test questions once the exam date has passed</p>
            </div>
          </div>
        </div>
      </main>

      {/* Waitlist Dialog */}
      <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              {selectedTest && mounted && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">{selectedTest.icon}</span>
                  <span>Join the Waitlist</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {!submitted ? (
            <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-4">
              {selectedTest && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{selectedTest.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{selectedTest.fullName}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedTest.date)}</span>
                      </div>
                    </div>
                  </div>
                  {mounted && countdowns[selectedTest.id] && (
                    <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mt-3 bg-white/50 rounded-lg px-3 py-2">
                      <Clock className="w-4 h-4" />
                      {countdowns[selectedTest.id].days > 0
                        ? `${countdowns[selectedTest.id].days} days until test`
                        : 'Test coming soon'}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full h-12 text-base border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${selectedTest ? `bg-gradient-to-r ${selectedTest.color}` : 'bg-gradient-to-r from-indigo-600 to-purple-600'} hover:opacity-90 text-white font-bold py-4 text-base rounded-xl shadow-lg hover:shadow-xl transition-all`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Joining Waitlist...</span>
                  </div>
                ) : (
                  <>
                    <Bell className="w-5 h-5 mr-2" />
                    Join Waitlist
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 mt-2">
                We&apos;ll notify you when test materials are available
              </p>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re on the list!</h3>
              <p className="text-base text-gray-600 mb-6 px-4">
                We&apos;ll notify you when materials are available for {selectedTest?.name}.
              </p>
              <Button
                onClick={() => {
                  setShowWaitlistDialog(false)
                  setSubmitted(false)
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white py-3 px-8 rounded-xl font-semibold"
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
