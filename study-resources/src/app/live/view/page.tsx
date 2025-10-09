'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Lock, Eye, PlayCircle, CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth'
import { Input } from '@/components/ui/input'

interface Problem {
  number: number
  content: string
  imageUrl?: string
}

function LiveViewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const testId = searchParams.get('test')
  const testName = searchParams.get('name')

  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewedCount, setViewedCount] = useState(0)
  const [showAdDialog, setShowAdDialog] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showPaywallDialog, setShowPaywallDialog] = useState(false)
  const [adWatched, setAdWatched] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)
  const [email, setEmail] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [adCountdown, setAdCountdown] = useState(15)

  useEffect(() => {
    if (testId) {
      loadTestContent()
    }
  }, [testId])

  const loadTestContent = async () => {
    try {
      const { data, error } = await supabase
        .from('live_test_uploads')
        .select('*')
        .eq('test_id', testId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data) {
        // Parse problems from content or images
        const parsedProblems = parseProblems(data)
        setProblems(parsedProblems)
      } else {
        // Fallback: build demo problems for SAT using embedded content when no DB data exists
        const fallback = buildSATFallback()
        if (fallback.length > 0) setProblems(fallback)
      }
    } catch (err) {
      console.error('Error loading test:', err)
      // Also attempt fallback if DB call failed
      const fallback = buildSATFallback()
      if (fallback.length > 0) setProblems(fallback)
    } finally {
      setLoading(false)
    }
  }

  const parseProblems = (data: { upload_type: string; content?: string; image_urls?: string[] }): Problem[] => {
    const problems: Problem[] = []

    if (data.upload_type === 'text' && data.content) {
      // Parse text content into problems
      const lines = data.content.split('\n')
      let currentProblem = ''
      let problemNumber = 1

      lines.forEach((line: string) => {
        const trimmed = line.trim()
        // Check if line starts with a number followed by period or parenthesis
        const match = trimmed.match(/^(\d+)[.)]\s*(.*)/)
        
        if (match) {
          if (currentProblem) {
            problems.push({
              number: problemNumber - 1,
              content: currentProblem.trim()
            })
          }
          problemNumber = parseInt(match[1])
          currentProblem = match[2]
        } else if (trimmed) {
          currentProblem += (currentProblem ? '\n' : '') + trimmed
        }
      })

      if (currentProblem) {
        problems.push({
          number: problemNumber,
          content: currentProblem.trim()
        })
      }
    } else if (data.upload_type === 'image' && data.image_urls) {
      // Create problems from images (assume each image is a set of problems)
      data.image_urls.forEach((url: string, idx: number) => {
        problems.push({
          number: idx + 1,
          content: `Problem Set ${idx + 1}`,
          imageUrl: url
        })
      })
    }

    return problems
  }

  // Provide a small built-in SAT text fallback the user supplied so the Live section works immediately
  const buildSATFallback = (): Problem[] => {
    const t = (testId || '').toLowerCase()
    // Only use fallback for SAT tests to avoid polluting other exams
    if (!t.startsWith('sat-')) return []

    // Minimal selection of problems from the user-provided SAT content
    const raw = `1. The general store was essential to daily life... Which choice completes the text?
A) source
B) rival
C) condition
D) waste

2. For painter Jacob Lawrence, being ____ was an important part of the artistic process... Which choice?
A) skeptical
B) observant
C) critical
D) confident

3. Former astronaut Ellen Ochoa says that ... she ____ that humans will someday need to live elsewhere. Which choice?
A) demands
B) speculates
C) doubts
D) establishes`

    // Convert to Problem[]
    const lines = raw.split('\n')
    const out: Problem[] = []
    let content = ''
    let number = 1
    for (const line of lines) {
      const m = line.trim().match(/^(\d+)\./)
      if (m) {
        if (content) {
          out.push({ number: number, content: content.trim() })
        }
        number = parseInt(m[1], 10)
        content = line.replace(/^(\d+)\./, '').trim()
      } else {
        content += (content ? '\n' : '') + line
      }
    }
    if (content) {
      out.push({ number, content: content.trim() })
    }
    return out
  }

  const canViewProblem = (index: number): boolean => {
    if (hasPaid) return true
    if (index < 5) return true // First 5 are free
    if (index < 8 && adWatched) return true // Next 3 after ad
    if (user) return true // Logged in users can see 8 problems
    return false
  }

  const handleProblemClick = (index: number) => {
    if (canViewProblem(index)) {
      setViewedCount(index + 1)
      return
    }

    // Determine what gate to show
    if (index >= 5 && !adWatched) {
      setShowAdDialog(true)
    } else if (index >= 8 && !user) {
      setShowAuthDialog(true)
    } else if (user && !hasPaid) {
      setShowPaywallDialog(true)
    }
  }

  const handleWatchAd = () => {
    let countdown = 15
    setAdCountdown(countdown)
    
    const interval = setInterval(() => {
      countdown--
      setAdCountdown(countdown)
      
      if (countdown <= 0) {
        clearInterval(interval)
        setAdWatched(true)
        setShowAdDialog(false)
        setAdCountdown(15)
      }
    }, 1000)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')

    const { error } = await signInWithEmail(email)
    
    if (error) {
      setAuthMessage(error.message)
    } else {
      setAuthMessage('Check your email for the login link!')
    }
    
    setAuthLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    setAuthMessage('')
    const { error } = await signInWithGoogle()
    if (error) setAuthMessage(error.message)
    setAuthLoading(false)
  }

  const handlePayment = async () => {
    // In a real app, integrate with Stripe or similar
    // For now, simulate payment
    setHasPaid(true)
    setShowPaywallDialog(false)
    
    // Store payment in database
    if (user) {
      await supabase.from('test_purchases').insert({
        user_id: user.id,
        test_id: testId,
        test_name: testName,
        amount: 4.99,
        paid_at: new Date().toISOString()
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600" />
          <p className="mt-4 text-gray-600">Loading test content...</p>
        </div>
      </div>
    )
  }

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Content Available Yet</h2>
          <p className="text-gray-600 mb-6">
            Test materials for {testName} haven&apos;t been uploaded yet. Check back soon!
          </p>
          <Button onClick={() => router.push('/live')}>
            Back to Live Tests
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-indigo-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{testName}</h1>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {problems.length} Problems
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Viewing {viewedCount}/{problems.length}
            </span>
          </div>
          
          {/* Access Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Access Progress</span>
              <span>{viewedCount}/{problems.length} problems</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                style={{ width: `${(viewedCount / problems.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0-5: Free</span>
              <span>6-8: Watch Ad</span>
              <span>9+: Account</span>
              <span>Full: $4.99</span>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          {problems.map((problem, index) => {
            const canView = canViewProblem(index)
            const isLocked = !canView

            return (
              <Card 
                key={index}
                className={`transition-all ${
                  isLocked 
                    ? 'opacity-60 border-2 border-dashed border-gray-300' 
                    : 'hover:shadow-lg border-2 border-indigo-100'
                }`}
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">Problem {problem.number}</span>
                    {isLocked && (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {canView ? (
                    <div>
                      {problem.imageUrl ? (
                        <img 
                          src={problem.imageUrl} 
                          alt={`Problem ${problem.number}`}
                          className="w-full rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                            {problem.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-4">
                        {index < 5 && 'This problem is free to view'}
                        {index >= 5 && index < 8 && !adWatched && 'Watch a short ad to unlock'}
                        {index >= 8 && !user && 'Sign in to continue viewing'}
                        {index >= 8 && user && !hasPaid && 'Upgrade for full access'}
                      </p>
                      <Button 
                        onClick={() => handleProblemClick(index)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
                      >
                        {index >= 5 && index < 8 && !adWatched && (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Watch Ad to Unlock
                          </>
                        )}
                        {index >= 8 && !user && 'Sign In to Continue'}
                        {index >= 8 && user && !hasPaid && (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Unlock All for $4.99
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      {/* Ad Dialog */}
      <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <PlayCircle className="w-7 h-7 text-indigo-600" />
              Watch Ad to Continue
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-12 mb-4">
              <p className="text-white text-lg mb-4">Advertisement</p>
              <div className="text-6xl font-bold text-white mb-4">{adCountdown}</div>
              <p className="text-gray-300 text-sm">Please wait...</p>
            </div>
            <Button 
              onClick={handleWatchAd}
              disabled={adCountdown < 15}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {adCountdown < 15 ? `Wait ${adCountdown}s...` : 'Start Ad'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to Continue</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Create a free account to unlock more problems!
              </p>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={authLoading}>
              {authLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
            <div className="relative text-center">
              <span className="px-2 text-xs text-gray-500 bg-white relative z-10">or</span>
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={authLoading}
            >
              Continue with Google
            </Button>
            {authMessage && (
              <p className="text-sm text-green-600">{authMessage}</p>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Paywall Dialog */}
      <Dialog open={showPaywallDialog} onOpenChange={setShowPaywallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-indigo-600" />
              Unlock Full Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">$4.99</div>
              <p className="text-gray-600">One-time payment</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">Access all {problems.length} problems</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">Download and print for offline study</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">Lifetime access to this test</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">Support the platform</span>
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white py-6 text-lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Purchase Full Access - $4.99
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Secure payment processing • Money-back guarantee
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LiveViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LiveViewContent />
    </Suspense>
  )
}
