'use client'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Shield, Ban, BookOpenCheck, GraduationCap } from 'lucide-react'

export default function HonorCodePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">Honor Code</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Study Share exists to accelerate learning. Use resources to practice and
            understand concepts—never to gain unfair advantage.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Learn Authentically
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>Use notes and guides to prepare for assessments and deepen understanding.</p>
              <p>Summarize in your own words and credit original authors where relevant.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>No active exam keys, solution banks for ongoing assignments, or impersonation.</p>
              <p>We remove content and may restrict accounts for violations.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-green-600" />
                Follow Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>Always follow your institution&apos;s academic integrity rules.</p>
              <p>If unsure whether something is allowed, ask your instructor first.</p>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <Shield className="h-5 w-5" />
          <AlertTitle>Reminder</AlertTitle>
          <AlertDescription>
            You are responsible for how you use shared materials. Keep our community fair and focused on growth.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  )
}


