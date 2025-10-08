'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Bell, ChevronRight } from 'lucide-react'

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

interface TestCardProps {
  test: TestDate
  compact?: boolean
}

export default function TestCard({ test, compact = false }: TestCardProps) {
  const [countdown, setCountdown] = useState<TimeRemaining | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const calculateCountdown = (): TimeRemaining => {
      const now = new Date().getTime()
      const testTime = test.date.getTime()
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
    }

    setCountdown(calculateCountdown())
    const interval = setInterval(() => {
      setCountdown(calculateCountdown())
    }, 1000)

    return () => clearInterval(interval)
  }, [test.date])

  const isPast = test.date.getTime() < new Date().getTime()
  const isThisWeek = countdown && countdown.days <= 7 && !isPast

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (compact) {
    return (
      <Link href={isPast ? `/live/test?test=${test.id}` : '/live'}>
        <Card className="hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: test.color.includes('from-') ? '#6366f1' : test.color }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{test.icon}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{test.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{formatDate(test.date)}</p>
                  {test.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {test.category}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {mounted && countdown && !isPast && (
                  <div className="text-right">
                    <div className="text-xs font-semibold text-indigo-600">
                      {countdown.days}d {countdown.hours}h
                    </div>
                    <div className="text-xs text-gray-500">remaining</div>
                  </div>
                )}
                {isPast && (
                  <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-50 rounded">
                    Available
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className={`h-2 bg-gradient-to-r ${test.color}`} />
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{test.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">{test.name}</h3>
            <p className="text-sm text-gray-600 truncate">{test.fullName}</p>
            {test.category && (
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {test.category}
              </span>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{formatDate(test.date)}</span>
              {test.time && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    {test.time}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {mounted && countdown && !isPast && (
          <div className="bg-indigo-50 rounded-lg p-3 mb-4">
            <div className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time Remaining
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600">{countdown.days}</div>
                <div className="text-xs text-gray-500">Days</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600">{countdown.hours}</div>
                <div className="text-xs text-gray-500">Hrs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600">{countdown.minutes}</div>
                <div className="text-xs text-gray-500">Min</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600">{countdown.seconds}</div>
                <div className="text-xs text-gray-500">Sec</div>
              </div>
            </div>
          </div>
        )}

        <Button
          asChild
          className={`w-full mt-auto ${isPast ? 'bg-green-600 hover:bg-green-700' : `bg-gradient-to-r ${test.color}`}`}
        >
          <Link href={isPast ? `/live/test?test=${test.id}` : '/live'}>
            {isPast ? (
              <>
                <ChevronRight className="w-4 h-4 mr-2" />
                View Test
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Join Waitlist
              </>
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
