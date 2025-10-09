#!/bin/bash

# Kill any existing Next.js processes
pkill -9 -f "next dev" 2>/dev/null || true
sleep 2

# Navigate to project directory
cd /Users/austinfrankel/Downloads/AnswersHelp/study-resources

# Clear Next.js cache
rm -rf .next

# Start the development server
npx next dev --turbopack
