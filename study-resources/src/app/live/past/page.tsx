'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, Filter, BookOpen, Search, X, Calendar } from 'lucide-react'
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

export default function PastTestsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  // Combine all tests
  const allTests: TestDate[] = useMemo(() => {
    return [
      ...STANDARDIZED_TESTS_2025.map(t => ({ ...t, category: t.category || 'College Admissions' })),
      ...AP_EXAMS_2025.map(t => ({ ...t, category: 'AP Exams' })),
      ...REGENTS_NY_2025.map(t => ({ ...t, category: 'NY Regents' }))
    ]
  }, [])

  // Filter past tests (tests that have already occurred)
  const pastTests = useMemo(() => {
    const now = new Date().getTime()
    return allTests.filter(test => test.date.getTime() < now)
  }, [allTests])

  // Group tests by name (SAT, ACT, etc.)
  const testsByName = useMemo(() => {
    const grouped: Record<string, TestDate[]> = {}
    pastTests.forEach(test => {
      const key = test.name
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(test)
    })
    // Sort each group by date (most recent first)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => b.date.getTime() - a.date.getTime())
    })
    return grouped
  }, [pastTests])

  // Get categories, years, and months
  const categories = useMemo(() => {
    const cats = new Set(pastTests.map(t => t.category || 'Other'))
    return Array.from(cats).sort()
  }, [pastTests])

  const years = useMemo(() => {
    const yrs = new Set(pastTests.map(t => t.date.getFullYear().toString()))
    return Array.from(yrs).sort((a, b) => parseInt(b) - parseInt(a))
  }, [pastTests])

  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ]

  // Filter tests based on all filters
  const filteredTests = useMemo(() => {
    let filtered = Object.keys(testsByName).reduce((acc, testName) => {
      const tests = testsByName[testName].filter(t => {
        // Category filter
        const categoryMatch = selectedCategory === 'all' ||
          t.category === selectedCategory ||
          t.category?.includes(selectedCategory)

        // Search filter
        const searchMatch = !searchQuery.trim() ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))

        // Year filter
        const yearMatch = selectedYear === 'all' ||
          t.date.getFullYear().toString() === selectedYear

        // Month filter
        const monthMatch = selectedMonth === 'all' ||
          t.date.getMonth().toString() === selectedMonth

        return categoryMatch && searchMatch && yearMatch && monthMatch
      })

      if (tests.length > 0) {
        acc[testName] = tests
      }
      return acc
    }, {} as Record<string, TestDate[]>)

    return filtered
  }, [testsByName, selectedCategory, searchQuery, selectedYear, selectedMonth])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with improved spacing */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            Past Tests Archive
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Access previously administered tests by category. Perfect for practice and review.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <input
              type="text"
              placeholder="Search by test name, subject, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-base border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-md bg-white placeholder-gray-400 transition-all hover:border-indigo-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-center text-gray-600">
              Found {Object.values(filteredTests).reduce((sum, tests) => sum + tests.length, 0)} test{Object.values(filteredTests).reduce((sum, tests) => sum + tests.length, 0) !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Enhanced Filter Bar */}
        <Card className="mb-6 shadow-lg border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col gap-4">
              {/* Filter Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-indigo-200">
                <Filter className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-lg text-gray-800">Advanced Filters</span>
                <div className="ml-auto text-sm font-medium text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-200">
                  {Object.keys(filteredTests).length} test{Object.keys(filteredTests).length !== 1 ? ' types' : ' type'} •{' '}
                  {Object.values(filteredTests).reduce((sum, tests) => sum + tests.length, 0)} total
                </div>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full border-2 border-indigo-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Year
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full border-2 border-indigo-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Month Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Month
                  </label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full border-2 border-indigo-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 opacity-0">
                    Actions
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedYear('all')
                      setSelectedMonth('all')
                      setSearchQuery('')
                    }}
                    className="w-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 font-semibold transition-all"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Groups with improved layout */}
        {Object.keys(filteredTests).length === 0 ? (
          <Card className="shadow-md border border-gray-200">
            <CardContent className="py-16 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">
                No past tests found for this category.
              </p>
              <Button
                onClick={() => setSelectedCategory('all')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                View All Tests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredTests).map(([testName, tests]) => (
              <Card key={testName} className="shadow-md border border-indigo-100 overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${tests[0].color} text-white py-4`}>
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl">{tests[0].icon}</span>
                    <div>
                      <div>{testName}</div>
                      <div className="text-xs sm:text-sm font-normal opacity-90 mt-0.5">
                        {tests.length} test{tests.length > 1 ? 's' : ''} available
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 pb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tests.map((test) => (
                      <Card
                        key={test.id}
                        className="border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => router.push(`/live/test?test=${test.id}`)}
                      >
                        <CardContent className="pt-4 pb-4">
                          <div className="mb-3">
                            <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                              {test.fullName}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              {formatDate(test.date)}
                              {test.time && <span className="ml-2">• {test.time}</span>}
                            </div>
                            {test.category && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                                {test.category}
                              </span>
                            )}
                          </div>
                          <Button
                            className={`w-full bg-gradient-to-r ${test.color} hover:opacity-90 text-white text-sm`}
                            size="sm"
                          >
                            View Test
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions with better styling */}
        <Card className="mt-6 shadow-md border border-blue-200 bg-blue-50">
          <CardContent className="pt-5 pb-5">
            <h3 className="font-semibold text-blue-900 mb-3 text-base sm:text-lg">How to use this archive:</h3>
            <ul className="space-y-2.5 text-sm sm:text-base text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <div><strong>Browse by Test Type</strong>: Tests are grouped by name (SAT, ACT, AP Biology, etc.)</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <div><strong>Filter by Category</strong>: Use the dropdown to show only College Admissions, AP Exams, or NY Regents tests</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <div><strong>Practice Anytime</strong>: Click any test to take it in the interactive Bluebook-style interface</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <div><strong>Track Progress</strong>: Your answers are auto-saved so you can resume anytime</div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
