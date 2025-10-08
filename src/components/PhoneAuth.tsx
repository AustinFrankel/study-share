'use client'

import { useState } from 'react'
import { signInWithPhone, verifyPhoneOtp } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Smartphone, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'

export default function PhoneAuth() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')

    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  const getE164Phone = (formattedPhone: string) => {
    // Convert (XXX) XXX-XXXX to +1XXXXXXXXXX
    const cleaned = formattedPhone.replace(/\D/g, '')
    return `+1${cleaned}`
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const cleanedPhone = phone.replace(/\D/g, '')

    if (cleanedPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      setLoading(false)
      return
    }

    const e164Phone = getE164Phone(phone)
    const { error: sendError } = await signInWithPhone(e164Phone)

    if (sendError) {
      setError(sendError.message || 'Failed to send code. Please try again.')
    } else {
      setMessage('Code sent! Check your phone.')
      setStep('otp')
    }

    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code')
      setLoading(false)
      return
    }

    const e164Phone = getE164Phone(phone)
    const { error: verifyError } = await verifyPhoneOtp(e164Phone, otp)

    if (verifyError) {
      setError('Invalid code. Please try again.')
      setLoading(false)
    } else {
      setMessage('Success! Signing you in...')
      // Auth context will handle the redirect
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    const e164Phone = getE164Phone(phone)
    const { error: sendError } = await signInWithPhone(e164Phone)

    if (sendError) {
      setError('Failed to resend code. Please try again.')
    } else {
      setMessage('Code resent! Check your phone.')
    }

    setLoading(false)
  }

  if (step === 'phone') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-5 rounded-2xl shadow-sm">
            <Smartphone className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign in with Phone</h3>
          <p className="text-base text-gray-600">We'll send you a 6-digit code</p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-3">
            <label className="text-base font-semibold text-gray-800 block">Phone Number</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-semibold text-lg">
                +1
              </span>
              <Input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="pl-14 h-14 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                maxLength={14}
                required
              />
            </div>
            <p className="text-sm text-gray-500 font-medium">US numbers only</p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-2">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="border-2 border-green-500 bg-green-50">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <AlertDescription className="text-green-700 font-medium">{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all rounded-xl"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                <span>Send Code</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full">
          <MessageSquare className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Verification Code</h3>
        <p className="text-sm text-gray-600">
          Sent to {phone}
        </p>
        <button
          onClick={() => {
            setStep('phone')
            setOtp('')
            setMessage('')
            setError('')
          }}
          className="text-sm text-indigo-600 hover:underline mt-1"
        >
          Change number
        </button>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">6-Digit Code</label>
          <Input
            type="text"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setOtp(value)
            }}
            placeholder="123456"
            className="h-14 text-center text-2xl font-mono tracking-widest"
            maxLength={6}
            required
            autoFocus
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-700">{message}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Verify & Sign In</span>
            </div>
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline disabled:opacity-50"
          >
            Didn't receive code? Resend
          </button>
        </div>
      </form>
    </div>
  )
}
