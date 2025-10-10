'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Bell, ChevronRight } from 'lucide-react'
import WaitlistModal from './WaitlistModal'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const [hasResources, setHasResources] = useState(false)

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

  // Determine if this test has uploaded resources available
  useEffect(() => {
    let cancelled = false
    const checkResources = async () => {
      if (!isSupabaseConfigured) {
        setHasResources(false)
        return
      }
      try {
        const [r1, r2] = await Promise.all([
          supabase
            .from('test_resources')
            .select('*', { count: 'exact', head: true })
            .eq('test_id', test.id),
          supabase
            .from('live_test_uploads')
            .select('*', { count: 'exact', head: true })
            .eq('test_id', test.id)
        ])
        const c1 = (r1 && typeof r1.count === 'number') ? r1.count : 0
        const c2 = (r2 && typeof r2.count === 'number') ? r2.count : 0
        if (!cancelled) setHasResources((c1 > 0) || (c2 > 0))
      } catch (e) {
        if (!cancelled) setHasResources(false)
      }
    }
    checkResources()
    return () => { cancelled = true }
  }, [test.id])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (compact) {
    const cardInner = (
      <div className="w-full text-left cursor-pointer" onClick={() => setShowWaitlistModal(true)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowWaitlistModal(true) }}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">{test.icon}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">{test.name}</h3>
                <p className="text-xs text-gray-500 truncate">{formatDate(test.date)}</p>
                {test.category && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full whitespace-nowrap">
                    {test.category}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {mounted && countdown && !isPast && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Time remaining</div>
                  <div className="text-xs font-semibold text-indigo-600">
                    {countdown.days}d {countdown.hours}h
                  </div>
                </div>
              )}
              {hasResources && (
                <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-50 rounded">
                  Available
                </span>
              )}
            </div>
        </div>
        {/* Move join button under time for visual balance */}
        {!hasResources && (
          <div className="mt-3">
            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowWaitlistModal(true) }}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Join Waitlist
            </Button>
          </div>
        )}
      </div>
    )

    return (
      <>
        <Card className="hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: test.color.includes('from-') ? '#6366f1' : test.color }}>
          <CardContent className="p-4">
            {hasResources ? (
              <Button asChild variant="ghost" className="p-0 h-auto w-full justify-start">
                <Link href={`/live/test?test=${test.id}`}>{cardInner}</Link>
              </Button>
            ) : (
              cardInner
            )}
          </CardContent>
        </Card>
        <WaitlistModal
          isOpen={showWaitlistModal}
          onClose={() => setShowWaitlistModal(false)}
          testName={test.name}
          testDate={test.date}
          onJoinWaitlist={async (email, phone) => {
            console.log('Joining waitlist:', { email, phone, testId: test.id })
            await new Promise(resolve => setTimeout(resolve, 1000))
          }}
        />
      </>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className={`h-2 bg-gradient-to-r ${test.color}`} />
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="text-left cursor-pointer" role="button" tabIndex={0} onClick={() => setShowWaitlistModal(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowWaitlistModal(true) }}>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{test.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">{test.name}</h3>
            <p className="text-sm text-gray-600 truncate">{test.fullName}</p>
            {test.category && (
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full whitespace-nowrap">
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
          <div className="bg-indigo-50 rounded-lg p-3 mb-2">
            <div className="text-xs font-semibold text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time Remaining
            </div>
            <div className="text-sm font-bold text-indigo-600">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m
            </div>
          </div>
        )}
        </div>

        {hasResources ? (
          <Button
            asChild
            className="w-full mt-auto bg-green-600 hover:bg-green-700"
          >
            <Link href={`/live/test?test=${test.id}`}>
              <ChevronRight className="w-4 h-4 mr-2" />
              View Test
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => setShowWaitlistModal(true)}
            className={`w-full mt-auto bg-gradient-to-r ${test.color}`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Join Waitlist
          </Button>
        )}
      </CardContent>

      <WaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
        testName={test.name}
        testDate={test.date}
        onJoinWaitlist={async (email, phone) => {
          // TODO: Implement actual waitlist functionality
          console.log('Joining waitlist:', { email, phone, testId: test.id })
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
        }}
      />
    </Card>
  )
}
