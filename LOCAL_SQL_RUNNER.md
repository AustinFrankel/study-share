# Local SQL Runner

This runner lets you execute SQL against your Supabase Postgres without leaving VS Code or configuring MCP.

Usage:

1) Export your connection string once per terminal session. Be sure to URL-encode special chars in passwords (e.g. ! -> %21, $ -> %24), and add sslmode=require.

Example (zsh):

export POSTGRES_URL='postgresql://postgres:Lifetime123%21Eagles20072007%24@db.dnknanwmaekhtmpbpjpo.supabase.co:5432/postgres?sslmode=require'

2) Run a single statement

npm run db:sql:stmt -- "SELECT 1;"

3) Run a .sql file (e.g. create tables/policies)

npm run db:sql:file -- study-resources/CRITICAL_DATABASE_SETUP.sql

Notes:
- The runner uses SSL with rejectUnauthorized=false for Supabase.
- You can create a .env.local with POSTGRES_URL and install dotenv if preferred.
- This bypasses MCP entirely.
