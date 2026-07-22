import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to migrate the lead inbox.');
}

const migrationUrl = new URL('../drizzle/0001_lead_submissions.sql', import.meta.url);
const migration = await readFile(fileURLToPath(migrationUrl), 'utf8');
const sql = neon(databaseUrl);
await sql.query(migration);
console.info('Lead inbox migration applied.');
