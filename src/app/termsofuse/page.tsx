'use client'

import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText, Scale, AlertCircle, UserCheck, Shield, Ban, Copyright, Gavel, Globe } from 'lucide-react'

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center gap-3">
            <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            Terms of Use
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-gray-600 mt-2">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                1. Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Welcome to <strong>Study Share</strong> (the "Platform," "Service," "we," "us," or "our"). These Terms of Use ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Study Share governing your access to and use of our educational resource sharing platform, website, mobile application, and related services.
              </p>
              <p>
                <strong>By accessing or using Study Share, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</strong> If you do not agree to these Terms, you must not access or use the Service.
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                <strong>Important:</strong> These Terms include provisions that limit our liability to you and require you to resolve disputes with us through arbitration on an individual basis, not as part of any class or representative action. Please review Section 15 (Dispute Resolution) carefully.
              </p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                2. Eligibility and Account Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">2.1 Age Requirements</h3>
              <p>
                You must be at least <strong>13 years of age</strong> to use Study Share. If you are between 13 and 18 years old (or the age of majority in your jurisdiction), you represent that you have obtained permission from your parent or legal guardian to use the Service, and that your parent or guardian has read and agreed to these Terms on your behalf.
              </p>

              <h3 className="font-semibold text-lg mt-4">2.2 Account Creation</h3>
              <p>
                To access certain features of Study Share, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security and confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">2.3 Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to violation of these Terms, fraudulent activity, or engaging in conduct that we deem harmful to other users or the Service.
              </p>
            </CardContent>
          </Card>

          {/* License and Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                3. License and Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">3.1 Limited License</h3>
              <p>
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use Study Share for your personal, non-commercial educational purposes. This license does not include any right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Resell, redistribute, or sublicense access to the Service</li>
                <li>Use the Service for any commercial purpose without our express written consent</li>
                <li>Modify, reverse engineer, decompile, or disassemble any portion of the Service</li>
                <li>Remove, obscure, or alter any proprietary notices or labels</li>
                <li>Use automated systems (bots, scrapers, crawlers) to access the Service</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">3.2 Prohibited Conduct</h3>
              <p>
                You agree NOT to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Academic Dishonesty:</strong> Uploading or sharing materials that facilitate cheating, plagiarism, or other forms of academic misconduct</li>
                <li><strong>Copyright Infringement:</strong> Uploading materials you do not own or have permission to share</li>
                <li><strong>Malicious Content:</strong> Uploading viruses, malware, or any harmful code</li>
                <li><strong>Harassment:</strong> Harassing, threatening, or intimidating other users</li>
                <li><strong>Spam:</strong> Posting unsolicited promotional content or advertisements</li>
                <li><strong>Impersonation:</strong> Impersonating another person or entity</li>
                <li><strong>Data Mining:</strong> Harvesting user information without consent</li>
                <li><strong>System Interference:</strong> Interfering with or disrupting the Service or servers</li>
                <li><strong>Illegal Activity:</strong> Using the Service for any illegal purpose or in violation of applicable laws</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copyright className="w-5 h-5 text-orange-600" />
                4. User-Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">4.1 Your Content</h3>
              <p>
                Study Share allows you to upload, post, and share study materials, notes, comments, and other content ("User Content"). You retain all ownership rights in your User Content. However, by uploading User Content to Study Share, you grant us the following license:
              </p>
              <p className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
                <strong>Content License:</strong> You grant Study Share a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with operating and providing the Service, including for promotional purposes.
              </p>

              <h3 className="font-semibold text-lg mt-4">4.2 Content Representations and Warranties</h3>
              <p>
                By uploading User Content, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You own or have the necessary rights to upload and share the content</li>
                <li>Your content does not infringe upon any third-party intellectual property rights</li>
                <li>Your content does not violate any applicable laws or regulations</li>
                <li>Your content does not contain confidential information without permission</li>
                <li>Your content is not defamatory, obscene, pornographic, or otherwise objectionable</li>
                <li>You have obtained all necessary permissions, releases, and consents for the content</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">4.3 Content Moderation</h3>
              <p>
                We reserve the right, but are not obligated, to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Monitor, review, and moderate User Content for compliance with these Terms</li>
                <li>Remove or disable access to any User Content that violates these Terms</li>
                <li>Remove content that we deem inappropriate, harmful, or offensive</li>
                <li>Cooperate with law enforcement regarding illegal content or activity</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                We do not pre-screen User Content and are not responsible for the content posted by users.
              </p>

              <h3 className="font-semibold text-lg mt-4">4.4 DMCA Copyright Policy</h3>
              <p>
                We respect intellectual property rights and respond to notices of alleged copyright infringement in accordance with the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted work has been infringed, please submit a DMCA notice to our designated Copyright Agent at: <strong>dmca@studyshare.com</strong>
              </p>
              <p className="text-sm text-gray-600">
                Repeat infringers will have their accounts terminated in accordance with our Copyright Policy.
              </p>
            </CardContent>
          </Card>

          {/* Academic Integrity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                5. Academic Integrity and Honor Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="bg-red-50 p-4 rounded border-l-4 border-red-600">
                <strong>Important:</strong> Study Share is designed to facilitate legitimate educational support and study collaboration. You are responsible for ensuring that your use of the Service complies with your institution's academic integrity policies and honor code.
              </p>
              
              <h3 className="font-semibold text-lg">5.1 Permitted Uses</h3>
              <p>Study Share may be used for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sharing personal study notes and summaries</li>
                <li>Collaborating on group projects (where permitted)</li>
                <li>Reviewing past course materials for studying</li>
                <li>Accessing practice problems and study guides</li>
                <li>Seeking clarification on course concepts</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">5.2 Prohibited Uses</h3>
              <p>Study Share may NOT be used for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sharing or accessing exam questions, answers, or solutions during an active exam period</li>
                <li>Completing graded assignments on behalf of others or with unauthorized collaboration</li>
                <li>Sharing instructor-copyrighted materials without permission</li>
                <li>Facilitating contract cheating or academic fraud</li>
                <li>Circumventing academic integrity policies or honor code requirements</li>
              </ul>

              <p className="mt-4">
                <strong>You acknowledge that violations of academic integrity policies may result in serious consequences, including academic penalties from your institution and termination of your Study Share account.</strong>
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Content and Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-600" />
                6. Third-Party Content and Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Study Share may contain links to third-party websites, services, or content that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services.
              </p>
              <p>
                You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by your use of any third-party content or services. We encourage you to read the terms and privacy policies of any third-party sites you visit.
              </p>
            </CardContent>
          </Card>

          {/* Payments and Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                7. Payments and Subscriptions (If Applicable)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">7.1 Free and Paid Services</h3>
              <p>
                Study Share offers both free and paid subscription tiers. Certain features may require a paid subscription or one-time payment.
              </p>

              <h3 className="font-semibold text-lg mt-4">7.2 Billing</h3>
              <p>
                If you purchase a paid subscription:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You authorize us to charge your payment method on a recurring basis</li>
                <li>Subscriptions automatically renew unless cancelled prior to the renewal date</li>
                <li>You are responsible for all charges incurred under your account</li>
                <li>All fees are non-refundable except as required by law or stated in our Refund Policy</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">7.3 Cancellation</h3>
              <p>
                You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. You will continue to have access to paid features until the end of the period for which you have paid.
              </p>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                8. Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our <a href="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</a>, which is incorporated into these Terms by reference.
              </p>
              <p>
                By using Study Share, you consent to our collection, use, and disclosure of your information as described in the Privacy Policy, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (email, username, profile data)</li>
                <li>Usage data and analytics</li>
                <li>Content you upload and share</li>
                <li>Communications and support interactions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-yellow-600" />
                9. Disclaimers and Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-600">
                <p className="uppercase font-bold mb-2">THE SERVICE IS PROVIDED "AS IS"</p>
                <p>
                  STUDY SHARE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
                </p>
              </div>

              <p>We do not warrant that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>The quality of content, information, or materials will meet your expectations</li>
                <li>Any errors or defects will be corrected</li>
                <li>The Service will be available at all times or any specific time</li>
                <li>User Content is accurate, reliable, or appropriate</li>
              </ul>

              <p className="mt-4 text-sm text-gray-600">
                <strong>Educational Disclaimer:</strong> Study Share is a platform for sharing educational materials and does not provide academic advising, tutoring, or educational services. Content on the platform is user-generated and we make no representations about its accuracy, quality, or appropriateness for any particular purpose.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-red-600" />
                10. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded border-l-4 border-red-600">
                <p className="uppercase font-bold mb-2">LIMITATION OF LIABILITY</p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL STUDY SHARE, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Loss of profits, revenue, or data</li>
                  <li>Loss of use or business interruption</li>
                  <li>Cost of substitute services</li>
                  <li>Academic penalties or disciplinary actions</li>
                  <li>Personal injury or emotional distress</li>
                </ul>
              </div>

              <p className="mt-4">
                <strong>Maximum Liability Cap:</strong> Our total liability to you for all claims arising from your use of the Service shall not exceed the greater of (a) the amount you paid to us in the 12 months preceding the claim, or (b) $100 USD.
              </p>

              <p className="text-sm text-gray-600 mt-2">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability for incidental or consequential damages. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.
              </p>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                11. Indemnification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You agree to indemnify, defend, and hold harmless Study Share and its officers, directors, employees, agents, affiliates, and partners from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party, including intellectual property rights</li>
                <li>Your User Content or any content you post</li>
                <li>Your violation of any applicable laws or regulations</li>
                <li>Any academic integrity violations or disciplinary actions</li>
              </ul>
              <p className="mt-4">
                We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate with our defense of such claim.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-gray-600" />
                12. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">12.1 Termination by You</h3>
              <p>
                You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
              </p>

              <h3 className="font-semibold text-lg mt-4">12.2 Termination by Us</h3>
              <p>
                We may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Extended period of inactivity</li>
                <li>Request by law enforcement or other government agencies</li>
                <li>Discontinuation of the Service (in whole or part)</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">12.3 Effect of Termination</h3>
              <p>
                Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your right to use the Service immediately ceases</li>
                <li>We may delete your account and User Content</li>
                <li>We have no obligation to retain or provide copies of your content</li>
                <li>Sections of these Terms that by their nature should survive termination will remain in effect</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                13. Changes to Terms of Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify or update these Terms at any time. If we make material changes, we will notify you by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the updated Terms with a new "Last Updated" date</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a prominent notice on the Service</li>
              </ul>
              <p className="mt-4">
                Your continued use of the Service after changes become effective constitutes your acceptance of the revised Terms. If you do not agree to the modified Terms, you must stop using the Service.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                14. Governing Law and Jurisdiction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of [Your State], United States, without regard to its conflict of law provisions.
              </p>
              <p>
                You agree to submit to the personal jurisdiction of the state and federal courts located in [Your County, State] for the purpose of litigating all such claims or disputes.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                If you are accessing the Service from outside the United States, you are responsible for compliance with local laws.
              </p>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-orange-600" />
                15. Dispute Resolution and Arbitration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-600">
                <p className="font-bold mb-2">PLEASE READ THIS SECTION CAREFULLY</p>
                <p>
                  This section contains an arbitration clause and class action waiver that affects your rights. It requires you to resolve disputes with us through individual arbitration rather than in court.
                </p>
              </div>

              <h3 className="font-semibold text-lg mt-4">15.1 Informal Resolution</h3>
              <p>
                Before initiating arbitration or litigation, you agree to first contact us at <strong>legal@studyshare.com</strong> to attempt to resolve the dispute informally. We will attempt to resolve the dispute within 60 days.
              </p>

              <h3 className="font-semibold text-lg mt-4">15.2 Binding Arbitration</h3>
              <p>
                If informal resolution is unsuccessful, any dispute arising from these Terms or the Service will be resolved through binding arbitration in accordance with the American Arbitration Association (AAA) Consumer Arbitration Rules.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Arbitration will be conducted by a single neutral arbitrator</li>
                <li>The arbitration will take place in [Your State]</li>
                <li>The arbitrator's decision will be final and binding</li>
                <li>Judgment on the award may be entered in any court of competent jurisdiction</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">15.3 Class Action Waiver</h3>
              <p className="bg-red-50 p-4 rounded border-l-4 border-red-600">
                <strong>YOU AND STUDY SHARE AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.</strong>
              </p>

              <h3 className="font-semibold text-lg mt-4">15.4 Exceptions</h3>
              <p>
                The following disputes are not subject to arbitration:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Disputes related to intellectual property rights</li>
                <li>Claims that may be brought in small claims court</li>
                <li>Requests for injunctive or equitable relief</li>
              </ul>

              <p className="text-sm text-gray-600 mt-4">
                <strong>Opt-Out Right:</strong> You may opt out of the arbitration agreement by sending written notice to legal@studyshare.com within 30 days of first registering your account. Your notice must include your name, address, and a clear statement that you wish to opt out of the arbitration agreement.
              </p>
            </CardContent>
          </Card>

          {/* Miscellaneous */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                16. Miscellaneous Provisions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">16.1 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Study Share regarding the Service.
              </p>

              <h3 className="font-semibold mt-4">16.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
              </p>

              <h3 className="font-semibold mt-4">16.3 Waiver</h3>
              <p>
                No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term.
              </p>

              <h3 className="font-semibold mt-4">16.4 Assignment</h3>
              <p>
                You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.
              </p>

              <h3 className="font-semibold mt-4">16.5 Force Majeure</h3>
              <p>
                We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, war, terrorism, pandemics, natural disasters, or government actions.
              </p>

              <h3 className="font-semibold mt-4">16.6 Survival</h3>
              <p>
                Sections that by their nature should survive termination will survive, including intellectual property provisions, disclaimers, limitations of liability, and dispute resolution.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                17. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions, concerns, or comments about these Terms of Use, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <p><strong>Study Share Support Team</strong></p>
                <p>Email: <a href="mailto:legal@studyshare.com" className="text-blue-600 hover:underline">legal@studyshare.com</a></p>
                <p>Support: <a href="mailto:support@studyshare.com" className="text-blue-600 hover:underline">support@studyshare.com</a></p>
                <p>DMCA Copyright Agent: <a href="mailto:dmca@studyshare.com" className="text-blue-600 hover:underline">dmca@studyshare.com</a></p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                We strive to respond to all inquiries within 2-3 business days.
              </p>
            </CardContent>
          </Card>

          {/* Acknowledgment */}
          <Card className="border-2 border-indigo-600">
            <CardContent className="pt-6">
              <div className="bg-indigo-50 p-6 rounded-lg">
                <p className="font-bold text-lg mb-3 text-center">Acknowledgment of Terms</p>
                <p className="text-center">
                  BY USING STUDY SHARE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF USE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.
                </p>
                <p className="text-center mt-3 text-sm text-gray-600">
                  If you do not agree to these Terms, please discontinue use of the Service immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-gray-600">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="mt-2">
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            {' • '}
            <a href="/honor-code" className="text-blue-600 hover:underline">Honor Code</a>
            {' • '}
            <a href="/help-center" className="text-blue-600 hover:underline">Help Center</a>
          </p>
        </div>
      </main>
    </div>
  )
}
