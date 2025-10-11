#!/usr/bin/env node

/**
 * Test Zapier Webhook Integration
 * 
 * This script helps you test your Zapier webhook setup without
 * having to trigger actual events in your app.
 * 
 * Usage:
 *   node scripts/test-zapier-webhook.js signup
 *   node scripts/test-zapier-webhook.js upload
 *   node scripts/test-zapier-webhook.js test-completed
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Sample test data for different events
const testData = {
  signup: {
    event: 'user.signup',
    timestamp: new Date().toISOString(),
    data: {
      user_id: 'test-user-' + Date.now(),
      email: 'testuser@example.com',
      handle: 'cobalt-penguin-999',
      created_at: new Date().toISOString(),
      welcome_message: 'Welcome to the waitlist, cobalt-penguin-999!',
      
      // Waitlist specific information
      waitlist_position: Math.floor(Math.random() * 150) + 1,
      estimated_access_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      days_until_access: Math.ceil(Math.random() * 7) + 1,
      
      // Subject information
      subject_area: 'Test Preparation',
      test_type: 'Practice Tests',
      
      // Personalization
      user_name: 'cobalt-penguin-999',
      first_name: 'Cobalt',
      
      // Email content components
      email_subject: `Welcome to Study Share - You're #${Math.floor(Math.random() * 150) + 1} on the waitlist!`,
      personalized_greeting: 'Hi Cobalt!',
    },
  },
  upload: {
    event: 'user.upload',
    timestamp: new Date().toISOString(),
    data: {
      user_id: 'test-user-' + Date.now(),
      email: 'testuser@example.com',
      handle: 'cobalt-penguin-999',
      resource_id: 'test-resource-' + Date.now(),
      resource_title: 'Test Biology Chapter',
      file_count: 3,
    },
  },
  'test-completed': {
    event: 'test.completed',
    timestamp: new Date().toISOString(),
    data: {
      user_id: 'test-user-' + Date.now(),
      email: 'testuser@example.com',
      handle: 'cobalt-penguin-999',
      test_id: 'test-' + Date.now(),
      test_title: 'Biology Practice Test',
      score: 85,
      total_questions: 50,
    },
  },
};

// Environment variable mapping
const envVars = {
  signup: 'ZAPIER_WEBHOOK_USER_SIGNUP',
  upload: 'ZAPIER_WEBHOOK_USER_UPLOAD',
  'test-completed': 'ZAPIER_WEBHOOK_TEST_COMPLETED',
};

/**
 * Send a test webhook to Zapier
 */
async function sendTestWebhook(eventType) {
  log('\n🧪 Testing Zapier Webhook Integration\n', colors.bright);

  // Validate event type
  if (!testData[eventType]) {
    log('❌ Invalid event type. Use one of:', colors.red);
    log('   - signup', colors.yellow);
    log('   - upload', colors.yellow);
    log('   - test-completed', colors.yellow);
    process.exit(1);
  }

  // Get webhook URL from environment
  const envVar = envVars[eventType];
  const webhookUrl = process.env[envVar];

  if (!webhookUrl) {
    log(`❌ Webhook URL not found!`, colors.red);
    log(`\nPlease add this to your .env.local file:`, colors.yellow);
    log(`${envVar}=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/\n`, colors.cyan);
    process.exit(1);
  }

  log(`📡 Event Type: ${eventType}`, colors.blue);
  log(`🔗 Webhook URL: ${webhookUrl}`, colors.blue);
  log(`📦 Payload:`, colors.blue);
  log(JSON.stringify(testData[eventType], null, 2), colors.cyan);
  log('');

  // Send the webhook
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    const payload = JSON.stringify(testData[eventType]);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    log('📤 Sending webhook...', colors.yellow);

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          log('✅ Webhook sent successfully!', colors.green);
          log(`📊 Status Code: ${res.statusCode}`, colors.green);
          if (data) {
            log(`📄 Response: ${data}`, colors.cyan);
          }
          log('\n✨ Now check your Zapier dashboard to see if the webhook was received!', colors.bright);
          log('   Go to: Zapier → Your Zap → Test Trigger\n', colors.cyan);
          resolve();
        } else {
          log(`❌ Webhook failed with status: ${res.statusCode}`, colors.red);
          log(`📄 Response: ${data}`, colors.red);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Error sending webhook: ${error.message}`, colors.red);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

// Main execution
const eventType = process.argv[2];

if (!eventType) {
  log('🧪 Zapier Webhook Test Script\n', colors.bright);
  log('Usage:', colors.blue);
  log('  node scripts/test-zapier-webhook.js <event-type>\n', colors.cyan);
  log('Available event types:', colors.blue);
  log('  • signup          - Test user signup webhook', colors.yellow);
  log('  • upload          - Test file upload webhook', colors.yellow);
  log('  • test-completed  - Test test completion webhook', colors.yellow);
  log('\nExample:', colors.blue);
  log('  node scripts/test-zapier-webhook.js signup\n', colors.cyan);
  process.exit(0);
}

sendTestWebhook(eventType).catch((error) => {
  console.error(error);
  process.exit(1);
});

