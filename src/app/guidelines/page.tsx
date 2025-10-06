'use client'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldCheck, Users, Flag, Sparkles, FileText } from 'lucide-react'

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">Community Guidelines</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Help keep Study Share friendly, useful, and safe for everyone. These principles
            explain what to post, how to interact, and how to report issues.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Quality First
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>Upload original notes, summaries, and practice materials that you created or have the right to share.</p>
              <p>Cite sources when appropriate and prefer clear, organized content.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Be Respectful
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>Discuss ideas, not people. No harassment, hate speech, or spam.</p>
              <p>Keep posts relevant to your classes and helpful to classmates.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Respect Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>No copyrighted material you don&apos;t own or have permission to share.</p>
              <p>Don&apos;t include personal data or sensitive information in uploads.</p>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <ShieldCheck className="h-5 w-5" />
          <AlertTitle>Tip</AlertTitle>
          <AlertDescription>
            Great uploads are concise, well-structured, and tagged accurately so classmates can discover them quickly.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-600" />
              Reporting & Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>See something off? Use the flag button on any resource to notify moderators. Repeated violations may result in removal or account restrictions.</p>
            <p>We may update these guidelines as the community grows.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


