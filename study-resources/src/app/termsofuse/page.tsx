'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page redirects to /terms to avoid duplicate content issues
// Keeping this route active for backwards compatibility with old links
export default function TermsOfUsePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/terms')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 text-lg">Redirecting to Terms of Service...</p>
      </div>
    </div>
  )
}
