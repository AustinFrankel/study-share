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
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Lock className="w-5 h-5" />
            Daily View Limit Reached
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-700">
              <span>Views today</span>
              <span>{viewsUsed} / {maxViews}</span>
            </div>
            <Progress value={100} className="bg-blue-100" />
          </div>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your daily views will reset in {resetIn}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-blue-700">
              To continue viewing resources today, choose one of these options:
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {accessInfo.actionOptions.includes('upload') && (
                <Button
                  onClick={handleUploadOption}
                  className="flex items-center gap-2 h-auto p-4 bg-blue-600 hover:bg-blue-700"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Upload Resource</div>
                      <div className="text-xs opacity-90">Get 5 bonus views</div>
                    </div>
                  </div>
                  <Zap className="w-4 h-4 ml-auto" />
                </Button>
              )}

              {accessInfo.actionOptions.includes('ad') && (
                <Button
                  onClick={handleAdOption}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 border-blue-300 hover:bg-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Watch Ad to Unlock Content</div>
                      <div className="text-xs text-gray-600">Get 3 bonus views instantly</div>
                    </div>
                  </div>
                  <Gift className="w-4 h-4 ml-auto" />
                </Button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-white p-3 rounded border">
            <strong>💡 Tip:</strong> Upload study materials to help your classmates and unlock unlimited daily views!
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
