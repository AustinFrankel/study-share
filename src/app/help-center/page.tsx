'use client'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MessageCircle, Book, Upload, Eye, Flag, Users, Shield } from 'lucide-react'

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Help Center & FAQ</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and get the support you need
          </p>
        </div>

        {/* Contact Support Section */}
        <Card className="mb-10 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Mail className="w-5 h-5" />
              Need Personal Support?
            </CardTitle>
            <CardDescription>
              Our team is here to help you with any questions or issues.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-gray-700 mb-2">
                  Contact our support team directly for personalized assistance.
                </p>
                <p className="text-sm text-gray-600">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
              <a
                href="mailto:austinhfrankel@gmail.com"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Uploading Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">How do I upload a resource?</h3>
                <p className="text-gray-600 text-sm">
                  Go to Upload, select your school/teacher/class, add a title and description, then upload your PDFs or images. Our AI will process them automatically.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What file types are supported?</h3>
                <p className="text-gray-600 text-sm">
                  We support PDFs, images (JPG, PNG), and text documents. Files should be under 50MB.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Do I get rewarded for uploading?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! You earn points and get 5 additional resource views for each upload.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Viewing Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Why can't I view more resources?</h3>
                <p className="text-gray-600 text-sm">
                  You have 5 free views per month. Upload resources or watch short ads to unlock more views (up to 8 total per month).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">How do I get more views?</h3>
                <p className="text-gray-600 text-sm">
                  Upload a resource (+5 views) or watch an ad (+1 view, max 3 ads per month).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">When do view limits reset?</h3>
                <p className="text-gray-600 text-sm">
                  View limits reset on the first of each month.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Community & Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">How do I earn points?</h3>
                <p className="text-gray-600 text-sm">
                  Earn points by uploading resources, getting upvotes, commenting, and helping classmates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What are badges for?</h3>
                <p className="text-gray-600 text-sm">
                  Badges showcase your contributions and achievements in the community.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Can I see who uploaded what?</h3>
                <p className="text-gray-600 text-sm">
                  We show anonymous handles to protect privacy while maintaining accountability.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Safety & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">How do I report inappropriate content?</h3>
                <p className="text-gray-600 text-sm">
                  Use the flag icon on any resource or comment to report issues. We review all reports promptly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What content is not allowed?</h3>
                <p className="text-gray-600 text-sm">
                  No copyrighted materials, inappropriate content, or academic dishonesty. See our Honor Code for details.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Is my data safe?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, we use secure encryption and never share your personal information. See our Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Still Need Help */}
        <Card className="mt-10 text-center">
          <CardContent className="py-8">
            <MessageCircle className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our support team is ready to assist you.
            </p>
            <a
              href="mailto:austinhfrankel@gmail.com"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


