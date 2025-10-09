#!/usr/bin/env node

// This script helps set up the environment variables
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')

const envTemplate = `# Supabase Configuration
# Replace these with your actual Supabase project values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For edge functions
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
`

console.log('🔧 Setting up environment variables...')

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  const existingContent = fs.readFileSync(envPath, 'utf8')
  
  if (existingContent.includes('your_supabase_project_url') || existingContent.includes('your-project-id')) {
    console.log('📝 Updating existing .env.local with template...')
    fs.writeFileSync(envPath, envTemplate)
    console.log('✅ Updated .env.local with template values')
  } else {
    console.log('✅ .env.local already exists with custom values')
  }
} else {
  console.log('📝 Creating new .env.local file...')
  fs.writeFileSync(envPath, envTemplate)
  console.log('✅ Created .env.local with template values')
}

console.log('\n📋 Next steps:')
console.log('1. Go to https://supabase.com and create a new project')
console.log('2. Get your API keys from Settings → API')
console.log('3. Update the values in .env.local with your actual Supabase credentials')
console.log('4. Run the database migrations in Supabase SQL editor')
console.log('5. Run "npm run dev" to start the application')
console.log('\n🎯 The app will show a setup guide until Supabase is properly configured!')
