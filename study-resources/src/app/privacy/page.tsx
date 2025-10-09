'use client'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, Database, Eye, Lock, UserCheck, Globe, Settings, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At Study Resources, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our educational resource sharing platform.
              </p>
              <p>
                By using our service, you consent to the data practices described in this policy. We encourage you to read this policy carefully and contact us if you have any questions.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Information:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Anonymous handle (randomly generated username)</li>
                  <li>Email address (for authentication only)</li>
                  <li>Account creation date and last login</li>
                  <li>Authentication tokens (managed by Supabase)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Content & Activity Data:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Uploaded educational resources (files, titles, descriptions)</li>
                  <li>Comments and discussions on resources</li>
                  <li>Votes and ratings on content</li>
                  <li>Points earned and activity history</li>
                  <li>Resource views and access patterns</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technical Information:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address and browser information</li>
                  <li>Device type and operating system</li>
                  <li>Usage analytics and performance metrics</li>
                  <li>Error logs and diagnostic data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Educational Metadata:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>School and institution information</li>
                  <li>Course and subject classifications</li>
                  <li>Resource categorizations and tags</li>
                  <li>Academic difficulty ratings</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Operations:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Authenticate users and maintain account security</li>
                  <li>Enable resource sharing and community features</li>
                  <li>Generate AI-powered practice questions and summaries</li>
                  <li>Implement access controls and usage limits</li>
                  <li>Provide personalized recommendations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Community Features:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Display user contributions and achievements</li>
                  <li>Calculate points, rankings, and badges</li>
                  <li>Enable commenting and discussion features</li>
                  <li>Show resource ratings and feedback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Service Improvement:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Analyze usage patterns to improve functionality</li>
                  <li>Monitor system performance and reliability</li>
                  <li>Detect and prevent abuse or policy violations</li>
                  <li>Develop new features based on user needs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <div>
                <h4 className="font-semibold mb-2">Technical Safeguards:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encrypted data transmission (HTTPS/SSL)</li>
                  <li>Secure database storage with access controls</li>
                  <li>Regular security audits and vulnerability testing</li>
                  <li>Multi-factor authentication for administrative access</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Operational Safeguards:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Limited employee access to personal data</li>
                  <li>Regular staff training on privacy practices</li>
                  <li>Incident response procedures for security breaches</li>
                  <li>Regular backups and disaster recovery plans</li>
                </ul>
              </div>
              <p className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
                <strong>Note:</strong> While we implement robust security measures, no system is completely secure. We continuously work to improve our security practices and will notify users of any significant security incidents.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                5. Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You have several rights regarding your personal information:
              </p>
              <div>
                <h4 className="font-semibold mb-2">Access & Control:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>View and download your account data through your profile</li>
                  <li>Edit or delete your uploaded resources</li>
                  <li>Update your account preferences and settings</li>
                  <li>Generate a new anonymous handle</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Deletion:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Delete individual resources and comments</li>
                  <li>Request complete account deletion through Help Center</li>
                  <li>Understand that some data may be retained for legal compliance</li>
                  <li>Know that public contributions may remain anonymized</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                6. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us through our Help Center or the contact information provided on our platform. Data deletion requests can be submitted through your account settings.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />
        
        <div className="text-center text-sm text-gray-500">
          <p>
            This Privacy Policy is part of our Terms of Service and governs your use of Study Resources.
          </p>
        </div>
      </main>
    </div>
  )
}


