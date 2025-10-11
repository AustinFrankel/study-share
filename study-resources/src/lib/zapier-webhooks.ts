/**
 * Zapier Webhook Integration
 * 
 * This file handles sending webhook events to Zapier for automation triggers.
 * Add your Zapier webhook URLs to environment variables for security.
 */

interface ZapierEvent {
  event: string
  timestamp: string
  data: Record<string, unknown>
}

/**
 * Send a webhook event to Zapier
 * @param webhookUrl - The Zapier webhook URL (from environment variable)
 * @param event - The event name (e.g., 'user.signup', 'user.upload', 'test.completed')
 * @param data - The event data to send
 */
export async function sendZapierWebhook(
  webhookUrl: string,
  event: string,
  data: Record<string, unknown>
): Promise<boolean> {
  try {
    const payload: ZapierEvent = {
      event,
      timestamp: new Date().toISOString(),
      data
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`Zapier webhook failed: ${response.status} ${response.statusText}`)
      return false
    }

    console.log(`✅ Zapier webhook sent: ${event}`)
    return true
  } catch (error) {
    console.error('Error sending Zapier webhook:', error)
    return false
  }
}

/**
 * Trigger when a user signs up
 */
export async function triggerUserSignup(user: {
  id: string
  email?: string
  handle?: string
  created_at?: string
}) {
  const webhookUrl =
    typeof window === 'undefined'
      ? process.env.ZAPIER_WEBHOOK_USER_SIGNUP
      : process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_USER_SIGNUP
  if (!webhookUrl) {
    console.log('⚠️ ZAPIER_WEBHOOK_USER_SIGNUP not configured')
    return
  }

  // Generate personalized waitlist information
  const waitlistPosition = Math.floor(Math.random() * 150) + 1 // Simulate waitlist position
  const estimatedAccess = new Date()
  estimatedAccess.setDate(estimatedAccess.getDate() + Math.floor(Math.random() * 7) + 1) // 1-7 days

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  await sendZapierWebhook(webhookUrl, 'user.signup', {
    user_id: user.id,
    email: user.email,
    handle: user.handle,
    created_at: user.created_at || new Date().toISOString(),
    welcome_message: `Welcome to the waitlist, ${user.handle || 'user'}!`,
    
    // Waitlist specific information
    waitlist_position: waitlistPosition,
    estimated_access_date: estimatedAccess.toLocaleDateString(),
    days_until_access: Math.ceil((estimatedAccess.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    
    // Subject information (you can customize this based on your app)
    subject_area: 'Test Preparation', // You might want to capture this during signup
    test_type: 'Practice Tests',
    
    // Personalization
    user_name: user.handle || 'Student',
    first_name: user.handle?.split('-')[0] || 'Student', // Extract first part of handle
    
    // Email content components
    email_subject: `Welcome to Study Share – You're #${waitlistPosition} on the waitlist!`,
    personalized_greeting: `Hi ${user.handle?.split('-')[0] || 'Student'},`,
    email_text: [
      `Welcome to Study Share!`,
      '',
      `You're currently position #${waitlistPosition} on our waitlist. Estimated access: ${estimatedAccess.toLocaleDateString()} (${Math.ceil((estimatedAccess.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days).`,
      '',
      'What is Study Share?',
      'Study Share is an AI-powered test preparation platform where you can upload study materials, take practice tests with instant feedback, and collaborate with classmates.',
      '',
      'Quick links:',
      `- Upload resources: ${siteUrl ? siteUrl + '/upload' : ''}`,
      `- Practice tests: ${siteUrl ? siteUrl + '/live' : ''}`,
      `- Profile: ${siteUrl ? siteUrl + '/profile' : ''}`
    ].join('\n'),
    email_html: `<!doctype html><html><body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111; line-height:1.5;">`
      + `<p>Hi ${user.handle?.split('-')[0] || 'Student'},</p>`
      + `<p>Welcome to Study Share!</p>`
      + `<p>You're currently position <strong>#${waitlistPosition}</strong> on our waitlist.<br/>`
      + `Estimated access: <strong>${estimatedAccess.toLocaleDateString()}</strong> `
      + `(<strong>${Math.ceil((estimatedAccess.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</strong>).</p>`
      + `<h3 style="margin-top:20px;">Quick links</h3>`
      + `<ul>`
      + `<li><a href="${siteUrl ? siteUrl + '/upload' : '#'}">Upload resources</a></li>`
      + `<li><a href="${siteUrl ? siteUrl + '/live' : '#'}">Practice tests</a></li>`
      + `<li><a href="${siteUrl ? siteUrl + '/profile' : '#'}">Profile</a></li>`
      + `</ul>`
      + `<p>Good luck on your test! You've got this. 💪</p>`
      + `<p>— The Study Share Team</p>`
      + `</body></html>`,
  })
}

/**
 * Trigger when a user uploads content
 */
export async function triggerUserUpload(user: {
  id: string
  email?: string
  handle?: string
}, resource: {
  id: string
  title: string
  file_count?: number
}) {
  const webhookUrl =
    typeof window === 'undefined'
      ? process.env.ZAPIER_WEBHOOK_USER_UPLOAD
      : process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_USER_UPLOAD
  if (!webhookUrl) {
    console.log('⚠️ ZAPIER_WEBHOOK_USER_UPLOAD not configured')
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  await sendZapierWebhook(webhookUrl, 'user.upload', {
    user_id: user.id,
    email: user.email,
    handle: user.handle,
    resource_id: resource.id,
    resource_title: resource.title,
    file_count: resource.file_count || 1,
    resource_url: siteUrl ? `${siteUrl}/resource/${resource.id}` : undefined,
    email_subject: `Your upload is live: ${resource.title}`,
    personalized_greeting: `Hi ${user.handle?.split('-')[0] || 'Student'},`,
    email_text: [
      `Your upload is live!`,
      '',
      `Title: ${resource.title}`,
      `Files: ${resource.file_count || 1}`,
      siteUrl ? `View it here: ${siteUrl}/resource/${resource.id}` : ''
    ].join('\n'),
    email_html: `<!doctype html><html><body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111; line-height:1.5;">`
      + `<p>Hi ${user.handle?.split('-')[0] || 'Student'},</p>`
      + `<p>Your upload is live!</p>`
      + `<p><strong>Title:</strong> ${resource.title}<br/><strong>Files:</strong> ${resource.file_count || 1}</p>`
      + (siteUrl ? `<p><a href="${siteUrl}/resource/${resource.id}">View your resource</a></p>` : '')
      + `<p>Thanks for contributing to Study Share.</p>`
      + `</body></html>`,
  })
}

/**
 * Trigger when a user completes a test
 */
export async function triggerTestCompleted(user: {
  id: string
  email?: string
  handle?: string
}, test: {
  id: string
  title: string
  score?: number
  total_questions?: number
}) {
  const webhookUrl =
    typeof window === 'undefined'
      ? process.env.ZAPIER_WEBHOOK_TEST_COMPLETED
      : process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_TEST_COMPLETED
  if (!webhookUrl) {
    console.log('⚠️ ZAPIER_WEBHOOK_TEST_COMPLETED not configured')
    return
  }

  await sendZapierWebhook(webhookUrl, 'test.completed', {
    user_id: user.id,
    email: user.email,
    handle: user.handle,
    test_id: test.id,
    test_title: test.title,
    score: test.score,
    total_questions: test.total_questions,
  })
}

/**
 * Trigger custom event
 */
export async function triggerCustomEvent(
  webhookEnvVar: string,
  eventName: string,
  data: Record<string, unknown>
) {
  const webhookUrl = process.env[webhookEnvVar]
  if (!webhookUrl) {
    console.log(`⚠️ ${webhookEnvVar} not configured`)
    return
  }

  await sendZapierWebhook(webhookUrl, eventName, data)
}

