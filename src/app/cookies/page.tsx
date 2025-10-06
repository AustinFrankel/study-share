'use client'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Cookie, Shield, Settings, BarChart3, Globe, Trash2 } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Cookie className="w-8 h-8 text-orange-600" />
            Cookie Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* What Are Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-orange-600" />
                1. What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and enabling essential functionality.
              </p>
              <p>
                We use cookies and similar technologies to enhance your experience on Study Resources, maintain security, and analyze how our platform is used.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies We Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                2. Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Essential Cookies (Required)
                </h4>
                <p className="mb-2 text-sm text-gray-600">
                  These cookies are necessary for the website to function properly and cannot be disabled.
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Authentication:</strong> Supabase session tokens to keep you logged in</li>
                  <li><strong>Security:</strong> CSRF protection and secure session management</li>
                  <li><strong>Preferences:</strong> Language settings and accessibility preferences</li>
                  <li><strong>Functionality:</strong> Remember your sorting preferences and view settings</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Analytics Cookies (Optional)
                </h4>
                <p className="mb-2 text-sm text-gray-600">
                  These cookies help us understand how users interact with our platform.
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Usage Analytics:</strong> Track page views, popular resources, and user flows</li>
                  <li><strong>Performance:</strong> Monitor loading times and identify technical issues</li>
                  <li><strong>Feature Usage:</strong> Understand which features are most valuable to users</li>
                  <li><strong>Error Tracking:</strong> Identify and fix bugs and usability issues</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Functional Cookies (Optional)
                </h4>
                <p className="mb-2 text-sm text-gray-600">
                  These cookies enhance your experience by remembering your choices.
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Theme Preferences:</strong> Remember dark/light mode selection</li>
                  <li><strong>Layout Settings:</strong> Save your preferred view options</li>
                  <li><strong>Filter Preferences:</strong> Remember your search and filter settings</li>
                  <li><strong>Notification Settings:</strong> Store your communication preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>3. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use trusted third-party services that may set their own cookies:
              </p>
              <div>
                <h4 className="font-semibold mb-2">Supabase (Authentication & Database)</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Manages user authentication and session security</li>
                  <li>Stores encrypted session tokens</li>
                  <li>Provides secure database connections</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">AI Processing Services</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Process uploaded content for question generation</li>
                  <li>Temporary cookies for API authentication</li>
                  <li>No personal data stored in these cookies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Duration */}
          <Card>
            <CardHeader>
              <CardTitle>4. Cookie Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Different cookies have different lifespans:
              </p>
              <div>
                <h4 className="font-semibold mb-2">Session Cookies</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Deleted when you close your browser
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Temporary authentication tokens</li>
                  <li>Current session preferences</li>
                  <li>Security validation cookies</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Persistent Cookies</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Stored for specific periods or until manually deleted
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Login Sessions:</strong> Up to 30 days (renewable)</li>
                  <li><strong>User Preferences:</strong> Up to 1 year</li>
                  <li><strong>Analytics Data:</strong> Up to 2 years (anonymized)</li>
                  <li><strong>Performance Metrics:</strong> Up to 90 days</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                5. Managing Your Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You have control over cookies on our platform:
              </p>
              <div>
                <h4 className="font-semibold mb-2">Browser Settings</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Block or delete cookies through your browser settings</li>
                  <li>Set preferences for third-party cookies</li>
                  <li>Enable "Do Not Track" requests</li>
                  <li>Use private/incognito browsing mode</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Platform Controls</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Sign out to clear authentication cookies</li>
                  <li>Reset preferences in your account settings</li>
                  <li>Clear stored data through your browser</li>
                  <li>Contact us for assistance with data deletion</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> Disabling essential cookies may affect website functionality. You may experience issues with login, navigation, or other core features.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Consent */}
          <Card>
            <CardHeader>
              <CardTitle>6. Your Consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By using Study Resources, you consent to our use of cookies as described in this policy. We may ask for specific consent for optional cookies through:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cookie consent banners for new users</li>
                <li>Settings pages for managing preferences</li>
                <li>Clear information about each cookie type</li>
                <li>Easy opt-out mechanisms where applicable</li>
              </ul>
            </CardContent>
          </Card>

          {/* Updates to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>7. Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal compliance. Updates will be posted on this page with a revised "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>8. Questions & Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have questions about our use of cookies or this policy, please contact us through our Help Center. For technical issues with cookies, you can also consult your browser's help documentation.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />
        
        <div className="text-center text-sm text-gray-500">
          <p>
            This Cookie Policy is part of our Privacy Policy and Terms of Service.
          </p>
        </div>
      </main>
    </div>
  )
}


