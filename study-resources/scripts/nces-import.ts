/*
  NCES School Import Script
  Usage:
    NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ts-node scripts/nces-import.ts path/to/nces_schools.csv

  CSV expected columns (subset):
    NCESSCH (nces_id), LEAID (district), SCH_NAME, CITY, ST
*/

import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const [,, csvPath] = process.argv
  if (!csvPath) {
    console.error('Provide path to NCES CSV as first argument')
    process.exit(1)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const fileStream = fs.createReadStream(path.resolve(csvPath))
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  // Parse header
  let header: string[] = []
  let processed = 0
  let inserted = 0
  let updated = 0

  for await (const line of rl) {
    if (!header.length) {
      header = line.split(',').map(h => h.replace(/^"|"$/g, ''))
      continue
    }
    if (!line.trim()) continue
    const cols = splitCSV(line)
    const row: Record<string, string> = {}
    header.forEach((h, i) => row[h] = (cols[i] || '').replace(/^"|"$/g, ''))

    const nces_id = row['NCESSCH'] || row['ncessch']
    const name = row['SCH_NAME'] || row['sch_name']
    const city = row['CITY'] || row['city']
    const state = row['ST'] || row['state']
    if (!nces_id || !name) continue

    processed++

    // Upsert by nces_id
    const { data: existing, error: fetchErr } = await supabase
      .from('schools')
      .select('id')
      .eq('nces_id', nces_id)
      .maybeSingle()
    if (fetchErr) {
      console.error('Fetch error:', fetchErr.message)
      continue
    }

    if (existing?.id) {
      const { error: upErr } = await supabase
        .from('schools')
        .update({ name, city, state })
        .eq('id', existing.id)
      if (upErr) {
        console.warn('Update failed:', upErr.message)
      } else {
        updated++
      }
    } else {
      const { error: insErr } = await supabase
        .from('schools')
        .insert({ nces_id, name, city, state })
      if (insErr) {
        console.warn('Insert failed:', insErr.message)
      } else {
        inserted++
      }
    }
    if (processed % 500 === 0) {
      console.log(`Processed: ${processed}, inserted: ${inserted}, updated: ${updated}`)
    }
  }

  console.log(`Done. Processed: ${processed}, inserted: ${inserted}, updated: ${updated}`)
}

function splitCSV(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { // escaped quote
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


