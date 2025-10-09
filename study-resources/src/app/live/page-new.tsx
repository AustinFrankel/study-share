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
import { Clock, Calendar, Bell, CheckCircle2, Loader2, ChevronRight, BookOpen, GraduationCap, Search, Filter } from 'lucide-react'
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
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const REGENTS_STATES = [
  { value: 'ny', label: 'New York' }
]

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
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

  // Combine all tests with proper categories
  const allTests: TestDate[] = [
    ...STANDARDIZED_TESTS_2025,
    ...AP_EXAMS_2025.map(exam => ({ ...exam, category: 'AP Exams', description: `AP ${exam.name} exam` })),
    ...(selectedState === 'ny' ? REGENTS_NY_2025.map(exam => ({ ...exam, category: 'NY Regents', description: `NY State ${exam.name} Regents exam` })) : [])
  ]

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
      router.push(`/live/upload?test=${test.id}&name=${encodeURIComponent(test.name)}`)
    } else {
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
            name: name.trim(),
            user_id: user?.id || null
          })

        if (error) {
          console.log('Waitlist table may not exist yet:', error.message)
        }
      }

      setSubmitted(true)
      setEmail('')
      setName('')
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

  // Filter and search tests
  const filteredTests = allTests
    .filter(test => {
      // Category filter
      if (selectedCategory !== 'all' && test.category !== selectedCategory) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          test.name.toLowerCase().includes(query) ||
          test.fullName.toLowerCase().includes(query) ||
          test.description?.toLowerCase().includes(query)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return a.date.getTime() - b.date.getTime()
      } else {
        return a.name.localeCompare(b.name)
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full mb-4 shadow-lg animate-pulse">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Live Test Countdown
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track upcoming exams with real-time countdowns. Join waitlists for reminders or view/upload past test materials.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-8 shadow-xl border-2 border-indigo-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="College Admissions">College Admissions</SelectItem>
                    <SelectItem value="AP Exams">AP Exams</SelectItem>
                    <SelectItem value="NY Regents">NY Regents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* State Filter (for Regents) */}
              {selectedCategory === 'NY Regents' && (
                <div className="md:col-span-2">
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="State" />
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
              )}

              {/* Sort */}
              <div className="md:col-span-2">
                <Select value={sortBy} onValueChange={(value: 'date' | 'name') => setSortBy(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">By Date</SelectItem>
                    <SelectItem value="name">By Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredTests.length}</span> {filteredTests.length === 1 ? 'test' : 'tests'}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </CardContent>
        </Card>

        {/* Test Cards Grid */}
        {filteredTests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">No tests found. Try adjusting your filters or search query.</p>
            </CardContent>
          </Card>
        ) : (
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
                        <p className="text-xs text-gray-500 font-medium line-clamp-1">{test.fullName}</p>
                        {test.category && (
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {test.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {test.description && (
                      <p className="text-sm text-gray-600 min-h-[40px] line-clamp-2">{test.description}</p>
                    )}
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 space-y-3 shadow-inner">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium">{formatDate(test.date)}</span>
                          {test.time && <span className="text-xs text-gray-500">{test.time}</span>}
                        </div>
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
                              <div className="text-xs text-gray-500 uppercase font-semibold">Hrs</div>
                            </div>
                            <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2">
                              <div className={`text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                                {countdown.minutes}
                              </div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">Min</div>
                            </div>
                            <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-2">
                              <div className={`text-3xl font-bold bg-gradient-to-br ${test.color} bg-clip-text text-transparent`}>
                                {countdown.seconds}
                              </div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">Sec</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 text-center">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <span className="text-green-700 font-semibold text-sm">Test Completed - View/Upload Materials</span>
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
                          {user ? 'Upload Materials' : 'View Materials'}
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
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border-2 border-indigo-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Before Test</h3>
              <p className="text-gray-600 text-sm">Join the waitlist to receive reminders and study resources before your exam date</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">After Test</h3>
              <p className="text-gray-600 text-sm">Upload test materials to help others, or view what&apos;s been shared by the community</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Real-Time Updates</h3>
              <p className="text-gray-600 text-sm">Live countdowns keep you informed and prepared for every upcoming test</p>
            </div>
          </div>
        </div>
      </main>

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
                    {selectedTest.time && <span>• {selectedTest.time}</span>}
                  </div>
                  {countdowns[selectedTest.id] && (
                    <div className="text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {countdowns[selectedTest.id].days} days remaining
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
                  <li>Email reminders before test day</li>
                  <li>Study tips and resources</li>
                  <li>Test preparation checklist</li>
                  <li>Access to past materials</li>
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
                We&apos;ll send you reminders and resources for {selectedTest?.name}.
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
