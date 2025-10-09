'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserAccessInfo, grantViewsForUpload, grantViewsForAd, UserAccessInfo } from '@/lib/access-gate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Upload, Play, Clock, Gift, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AccessGateProps {
  onAccessGranted?: () => void
  resourceId?: string
}

export default function AccessGate({ onAccessGranted, resourceId }: AccessGateProps) {
  const { user } = useAuth()
  const [accessInfo, setAccessInfo] = useState<UserAccessInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdModal, setShowAdModal] = useState(false)
  const [adWatching, setAdWatching] = useState(false)
  const [adCountdown, setAdCountdown] = useState(15) // 15 second ad simulation

  useEffect(() => {
    if (user) {
      fetchAccessInfo()
    }
  }, [user])

  const fetchAccessInfo = async () => {
    if (!user) return

    setLoading(true)
    try {
      const info = await getUserAccessInfo(user.id)
      setAccessInfo(info)
    } catch (error) {
      console.error('Error fetching access info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadOption = () => {
    // Redirect to upload page
    window.location.href = '/upload'
  }

  const handleAdOption = () => {
    setShowAdModal(true)
  }

  const startAdWatching = () => {
    setAdWatching(true)
    setAdCountdown(15)

    const interval = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          finishAdWatching()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const finishAdWatching = async () => {
    if (!user) return

    try {
      await grantViewsForAd(user.id)
      setShowAdModal(false)
      setAdWatching(false)
      setAdCountdown(15)
      
      // Immediately grant viewing by notifying parent first (so content shows right away)
      onAccessGranted?.()
      // Then refresh access info in the background
      fetchAccessInfo()
    } catch (error) {
      console.error('Error granting ad views:', error)
    }
  }

  if (!user || loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!accessInfo || accessInfo.canView) {
    return null // Don't show gate if user can view
  }

  const viewsUsed = accessInfo.viewsThisMonth
  const maxViews = accessInfo.maxViewsThisMonth
  const resetIn = formatDistanceToNow(accessInfo.resetTime)

  return (
    <>
      {/* Amber/Orange warning theme with gradient header and polished content */}
      <Card className="border-amber-300 bg-amber-50/80 backdrop-blur-sm shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-white drop-shadow-sm">
            <span className="text-xl">⚠️</span>
            <Lock className="w-5 h-5" />
            <span className="font-extrabold">Monthly View Limit Reached</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-amber-900/90 font-medium">
              <span>Views used this month</span>
              <span>{viewsUsed} / {maxViews}</span>
            </div>
            <Progress value={Math.min(100, Math.round((viewsUsed / Math.max(1, maxViews)) * 100))} className="bg-amber-100" />
          </div>

          <Alert className="bg-white/70 border-amber-200">
            <Clock className="h-4 w-4 text-amber-700" />
            <AlertDescription className="text-amber-900/90">
              Resets in {resetIn}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-amber-900/90 font-medium">
              Continue now with one of these options:
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {accessInfo.actionOptions.includes('upload') && (
                <Button
                  onClick={handleUploadOption}
                  className="flex items-center gap-3 h-auto p-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-left rounded-xl"
                >
                  <Upload className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-semibold">Upload a Study Resource</div>
                    <div className="text-xs opacity-90">Instantly adds 5 monthly views</div>
                  </div>
                  <Zap className="w-4 h-4" />
                </Button>
              )}

              {accessInfo.actionOptions.includes('ad') && (
                <Button
                  onClick={handleAdOption}
                  variant="outline"
                  className="flex items-center gap-3 h-auto p-4 border-amber-300 hover:bg-amber-100/60 text-amber-900 rounded-xl"
                >
                  <Play className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-semibold">Watch a short ad</div>
                    <div className="text-xs opacity-90">Adds 3 monthly views</div>
                  </div>
                  <Gift className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="text-xs text-amber-900/90 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
            <strong>Tip:</strong> Sharing your notes helps classmates and unlocks more views for you.
          </div>
        </CardContent>
      </Card>

      {/* Ad Modal */}
      <Dialog open={showAdModal} onOpenChange={setShowAdModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Watch Ad for Bonus Views</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!adWatching ? (
              <>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Ready to watch?</h3>
                  <p className="text-gray-600 text-sm">
                    Watch a 15-second ad to unlock 3 additional resource views for today.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => setShowAdModal(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={startAdWatching} className="flex-1">
                    Start Ad
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 relative">
                    <Play className="w-12 h-12 text-white" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {adCountdown}
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Ad Playing...</h3>
                  <p className="text-gray-600 text-sm">
                    Please wait {adCountdown} seconds
                  </p>
                  <Progress value={((15 - adCountdown) / 15) * 100} className="mt-4" />
                </div>
                
                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    You&apos;ll receive 3 bonus views when the ad completes
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
