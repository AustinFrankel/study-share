#!/bin/bash

# Live Test System Setup Script

echo "🚀 Setting up Live Test System..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    echo "Please create .env.local with Supabase credentials"
    exit 1
fi

# Get Supabase URL
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    exit 1
fi

echo "✅ Supabase URL found: $SUPABASE_URL"
echo ""

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/025_live_test_tables.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration file found"
echo ""

echo "📋 To complete setup, please:"
echo ""
echo "1. Go to your Supabase Dashboard:"
echo "   ${SUPABASE_URL/https:\/\//https://app.supabase.com/project/}/sql"
echo ""
echo "2. Create a new query and paste the contents of:"
echo "   $MIGRATION_FILE"
echo ""
echo "3. Run the query to create the tables"
echo ""
echo "4. Verify the following tables were created:"
echo "   - test_waitlist"
echo "   - live_test_uploads"
echo "   - test_purchases"
echo ""

# Optional: If supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "5. OR run this command (Supabase CLI detected):"
    echo "   supabase db push"
    echo ""
fi

echo "✅ Setup instructions displayed"
echo ""
echo "📚 For more information, see LIVE_SYSTEM_DOCS.md"
