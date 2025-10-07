'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, Filter, BookOpen } from 'lucide-react'
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

  // Get categories
  const categories = useMemo(() => {
    const cats = new Set(pastTests.map(t => t.category || 'Other'))
    return Array.from(cats).sort()
  }, [pastTests])

  // Filter tests based on selected category
  const filteredTests = useMemo(() => {
    if (selectedCategory === 'all') {
      return testsByName
    }

    const filtered: Record<string, TestDate[]> = {}
    Object.keys(testsByName).forEach(testName => {
      const tests = testsByName[testName].filter(t =>
        t.category === selectedCategory ||
        (t.category?.includes(selectedCategory))
      )
      if (tests.length > 0) {
        filtered[testName] = tests
      }
    })
    return filtered
  }, [testsByName, selectedCategory])

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            Past Tests Archive
          </h1>
          <p className="text-gray-600">
            Access previously administered tests by category. Perfect for practice and review.
          </p>
        </div>

        {/* Filter */}
        <Card className="mb-8 shadow-lg border-2 border-indigo-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">Filter by:</span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-500">
                {Object.keys(filteredTests).length} test types •{' '}
                {Object.values(filteredTests).reduce((sum, tests) => sum + tests.length, 0)} total tests
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Groups */}
        {Object.keys(filteredTests).length === 0 ? (
          <Card className="shadow-xl border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 text-lg">
                No past tests found for this category.
              </p>
              <Button
                onClick={() => setSelectedCategory('all')}
                className="mt-4"
                variant="outline"
              >
                View All Tests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredTests).map(([testName, tests]) => (
              <Card key={testName} className="shadow-xl border-2 border-indigo-100">
                <CardHeader className={`bg-gradient-to-r ${tests[0].color} text-white`}>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <span className="text-4xl">{tests[0].icon}</span>
                    <div>
                      <div>{testName}</div>
                      <div className="text-sm font-normal opacity-90 mt-1">
                        {tests.length} test{tests.length > 1 ? 's' : ''} available
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tests.map((test) => (
                      <Card
                        key={test.id}
                        className="border-2 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => router.push(`/live/test?test=${test.id}`)}
                      >
                        <CardContent className="pt-6 pb-4">
                          <div className="mb-3">
                            <div className="font-semibold text-gray-900 mb-1">
                              {test.fullName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(test.date)}
                              {test.time && <span className="ml-2">• {test.time}</span>}
                            </div>
                            {test.category && (
                              <span className="inline-block mt-2 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                                {test.category}
                              </span>
                            )}
                          </div>
                          <Button
                            className={`w-full bg-gradient-to-r ${test.color} hover:opacity-90 text-white`}
                            size="sm"
                          >
                            <ChevronRight className="w-4 h-4 mr-1" />
                            View Test
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

        {/* Instructions */}
        <Card className="mt-8 shadow-lg border-2 border-blue-100 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">How to use this archive:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• <strong>Browse by Test Type</strong>: Tests are grouped by name (SAT, ACT, AP Biology, etc.)</li>
              <li>• <strong>Filter by Category</strong>: Use the dropdown to show only College Admissions, AP Exams, or NY Regents tests</li>
              <li>• <strong>Practice Anytime</strong>: Click any test to take it in the interactive Bluebook-style interface</li>
              <li>• <strong>Track Progress</strong>: Your answers are auto-saved so you can resume anytime</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
