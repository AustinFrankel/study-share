'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, ExternalLink, Copy } from 'lucide-react'
import { useState } from 'react'

export default function SetupGuide() {
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StudyShare Setup
          </h1>
          <p className="text-xl text-gray-600">
            Almost ready! Just need to configure your Supabase database.
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Supabase not configured.</strong> Follow the steps below to get started.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Step 1: Create Supabase Project */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Create Supabase Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
                <li>Sign up or log in to your account</li>
                <li>Click &quot;New Project&quot;</li>
                <li>Choose your organization</li>
                <li>Enter project name: &quot;study-resources&quot;</li>
                <li>Set a database password (save this!)</li>
                <li>Choose a region close to you</li>
                <li>Click &quot;Create new project&quot;</li>
              </ol>
              <Button asChild className="w-full">
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Get API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Get API Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In your Supabase project dashboard</li>
                <li>Go to Settings → API</li>
                <li>Copy the &quot;Project URL&quot;</li>
                <li>Copy the &quot;anon public&quot; key</li>
                <li>Copy the &quot;service_role&quot; key (keep this secret!)</li>
              </ol>
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Note:</strong> The service_role key has admin privileges. Never commit it to version control.
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Update Environment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Update Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Replace the placeholder values in your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
              </p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <pre>{envContent}</pre>
              </div>
              
              <Button 
                onClick={() => copyToClipboard(envContent, 'env')}
                variant="outline" 
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied === 'env' ? 'Copied!' : 'Copy Environment Template'}
              </Button>
            </CardContent>
          </Card>

          {/* Step 4: Run Database Migrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Set Up Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Run the SQL migrations in your Supabase SQL editor:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>001_initial_schema.sql</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>002_indexes.sql</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>003_rls_policies.sql</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                <strong>Tip:</strong> You can find these files in the <code>supabase/migrations/</code> folder
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 5: Test Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Test Your Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              After completing the steps above, refresh this page. If everything is configured correctly, you&apos;ll see the StudyShare homepage.
            </p>
            
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button variant="outline" asChild>
                <a href="https://supabase.com/docs/guides/getting-started" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Supabase Docs
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <strong>Common Issues:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Make sure your .env.local file is in the project root</li>
                <li>Restart the dev server after updating environment variables</li>
                <li>Check that your Supabase project is active (not paused)</li>
                <li>Verify the API keys are copied correctly (no extra spaces)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
