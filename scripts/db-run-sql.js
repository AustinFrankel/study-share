#!/usr/bin/env node
/*
 Simple Postgres runner:
 - Loads POSTGRES_URL from .env.local or .env in the current working directory
 - Run a SQL file with --file <path>
 - Or run a statement with --sql "SELECT 1;"
*/
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from .env.local if available, else .env
const cwd = process.cwd();
const envLocal = path.resolve(cwd, '.env.local');
const envFile = path.resolve(cwd, '.env');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

const { Client } = require('pg');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { file: null, sql: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--file' || a === '-f') {
      out.file = args[++i];
    } else if (a === '--sql' || a === '-e') {
      out.sql = args[++i];
    }
  }
  return out;
}

async function run() {
  const { file, sql } = parseArgs();
  const conn = process.env.POSTGRES_URL;
  if (!conn) {
    console.error('POSTGRES_URL env var is required (set in .env.local or .env)');
    process.exit(1);
  }
  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    let text;
    if (file) {
      const filePath = path.resolve(process.cwd(), file);
      text = fs.readFileSync(filePath, 'utf8');
      console.log(`Running SQL file: ${filePath}`);
    } else if (sql) {
      text = sql;
      console.log(`Running SQL statement...`);
    } else {
      console.error('Provide --file <path> or --sql "..."');
      process.exit(1);
    }

    const res = await client.query(text);
    if (res && res.rows) {
      console.log(JSON.stringify(res.rows, null, 2));
    } else {
      console.log('Done.');
    }
  } catch (err) {
    console.error('Error running SQL:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
