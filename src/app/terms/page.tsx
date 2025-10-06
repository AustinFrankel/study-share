'use client'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Shield, Users, AlertTriangle, Scale, FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-600" />
            Terms of Service
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using Study Resources (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your use of our educational resource sharing platform. By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Use of Service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                2. Use of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Study Resources is an educational platform designed to help students share and access study materials, notes, practice questions, and other academic resources.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Permitted Uses:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Sharing original study materials, notes, and educational content</li>
                  <li>Accessing and downloading shared educational resources</li>
                  <li>Participating in educational discussions through comments</li>
                  <li>Rating and providing feedback on educational materials</li>
                  <li>Using AI-generated practice questions for study purposes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Prohibited Uses:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Uploading copyrighted material without proper authorization</li>
                  <li>Sharing exam answers or materials that violate academic integrity</li>
                  <li>Posting inappropriate, offensive, or harmful content</li>
                  <li>Attempting to circumvent access controls or security measures</li>
                  <li>Using the service for commercial purposes without permission</li>
                  <li>Impersonating others or providing false information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Academic Integrity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                3. Academic Integrity & Honor Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We are committed to maintaining the highest standards of academic integrity. All users must adhere to their institution&apos;s honor code and academic policies.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Our Honor Code:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Only share materials that are your own work or that you have permission to share</li>
                  <li>Respect intellectual property rights of authors and institutions</li>
                  <li>Do not share current exam materials, answer keys, or graded assignments</li>
                  <li>Use shared resources as study aids, not as substitutes for your own work</li>
                  <li>Give proper attribution when using others&apos; materials</li>
                  <li>Report violations of academic integrity when encountered</li>
                </ul>
              </div>
              <p className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                <strong>Important:</strong> It is your responsibility to ensure that your use of this platform complies with your institution&apos;s academic policies. Violations may result in academic penalties at your school and suspension from our platform.
              </p>
            </CardContent>
          </Card>

          {/* User Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                4. User Content & Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You retain ownership of the content you upload, but grant us certain rights to operate the service effectively.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Your Content Rights:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You retain all ownership rights to your original content</li>
                  <li>You are responsible for ensuring you have the right to share uploaded content</li>
                  <li>You grant us a non-exclusive, worldwide license to host, display, and distribute your content on our platform</li>
                  <li>You can delete your content at any time, which will remove it from public access</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Our Content Rights:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>AI-generated practice questions and summaries remain our intellectual property</li>
                  <li>Platform features, design, and functionality are protected by copyright</li>
                  <li>User statistics, analytics, and aggregated data belong to us</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                5. Content Moderation & Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to review, moderate, and remove content that violates these terms or community standards.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Moderation Actions:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Content may be automatically flagged by AI systems for review</li>
                  <li>Users can report inappropriate content through our flagging system</li>
                  <li>Violations may result in content removal, warnings, or account suspension</li>
                  <li>Repeated violations may lead to permanent account termination</li>
                  <li>We may cooperate with educational institutions regarding policy violations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Appeal Process:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Users may appeal moderation decisions through our Help Center</li>
                  <li>Appeals will be reviewed by human moderators within 7 business days</li>
                  <li>Decisions on appeals are final</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Additional sections */}
          <Card>
            <CardHeader>
              <CardTitle>6. Privacy & Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Your privacy is important to us. Our data collection and use practices are detailed in our Privacy Policy, which is incorporated by reference into these Terms. By using our service, you consent to the collection and use of information as outlined in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Disclaimers & Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The service is provided &quot;as is&quot; without warranties of any kind, either express or implied.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Service Disclaimers:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We do not guarantee the accuracy or completeness of user-generated content</li>
                  <li>AI-generated content may contain errors and should be verified independently</li>
                  <li>We are not responsible for academic consequences of using shared materials</li>
                  <li>Service availability may be interrupted for maintenance or technical issues</li>
                  <li>We do not guarantee that the service will meet your specific requirements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Account Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Either party may terminate this agreement at any time. You may delete your account through your profile settings. We may terminate accounts that violate these terms. Upon termination, your access to the service will cease, but these terms will continue to apply to any content you shared before termination.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated &quot;Last modified&quot; date. Continued use of the service after changes constitutes acceptance of the new terms. For significant changes, we will provide additional notice through the platform or email.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have questions about these Terms of Service, please contact us through our Help Center or at the contact information provided on our platform.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />
        
        <div className="text-center text-sm text-gray-500">
          <p>
            By using Study Resources, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
          </p>
        </div>
      </main>
    </div>
  )
}


