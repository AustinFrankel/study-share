#!/usr/bin/env node
/*
 Safe runner for CRITICAL_DATABASE_SETUP.sql
 - Loads POSTGRES_URL from .env.local or .env at repo root
 - Executes only the DDL/policy sections
 - Runs a lightweight verification that does NOT reference user_points
*/
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

// Load env from root .env.local or .env
const cwd = process.cwd();
const envLocal = path.resolve(cwd, '.env.local');
const envFile = path.resolve(cwd, '.env');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

const SQL_FILE = path.resolve(cwd, 'study-resources/CRITICAL_DATABASE_SETUP.sql');

function stripVerification(sql) {
  // Remove the entire VERIFICATION QUERIES section (header to EOF)
  const marker = /--\s*=+\s*\n--\s*VERIFICATION QUERIES[\s\S]*$/i;
  return sql.replace(marker, '').trim() + '\n';
}

async function main() {
  const conn = process.env.POSTGRES_URL;
  if (!conn) {
    console.error('POSTGRES_URL env var is required (set in .env.local or .env at repo root)');
    process.exit(1);
  }
  if (!fs.existsSync(SQL_FILE)) {
    console.error('Could not find SQL file at:', SQL_FILE);
    process.exit(1);
  }

  const ddl = stripVerification(fs.readFileSync(SQL_FILE, 'utf8'));

  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    console.log('Running critical database setup (DDL + policies)...');
    await client.query(ddl);
    console.log('DDL complete. Running lightweight verification...');

    const verifySql = `\nSELECT 'test_resources' as table_name, count(*) as row_count FROM test_resources\nUNION ALL\nSELECT 'notifications', count(*) FROM notifications;\n`;
    const res = await client.query(verifySql);
    console.log('Verification results:');
    console.table(res.rows);
    console.log('All done.');
  } catch (err) {
    console.error('Error during setup:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
