/**
 * Add nullable per-Location seasons without rewriting any saved content.
 * Default / --check: read-only schema inspection using server DATABASE_URL.
 * --apply: additive, idempotent; requires VERCEL_ENV=production.
 * No environment files are loaded and no credentials/raw DB errors are printed.
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { neon } from '@neondatabase/serverless';

export const LOCATION_SEASONS_SQL =
  'ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS season_tags jsonb';

const INSPECT_SQL = `SELECT data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'season_tags'`;

export async function migrateLocationSeasons({ apply = false, environment, query }) {
  if (apply && environment !== 'production') {
    throw new Error('Location seasons migration requires VERCEL_ENV=production to apply.');
  }
  if (apply) await query(LOCATION_SEASONS_SQL);
  const [column] = await query(INSPECT_SQL);
  const ready =
    column?.data_type === 'jsonb' &&
    column?.is_nullable === 'YES' &&
    column?.column_default == null;
  if (apply && !ready) {
    throw new Error('Location seasons schema does not match the expected nullable JSON column.');
  }
  return {
    mode: apply ? 'apply' : 'check',
    ready,
    column: 'public.locations.season_tags',
    present: Boolean(column),
    nullable: column?.is_nullable === 'YES',
    type: column?.data_type ?? null,
    contentChanged: false,
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length === 1 && !['--check', '--apply'].includes(args[0]))) {
      throw new Error('Use --check (read-only, default) or --apply.');
    }
    const apply = args[0] === '--apply';
    if (apply && process.env.VERCEL_ENV !== 'production') {
      throw new Error('Apply is only allowed during an authorized production release.');
    }
    if (!process.env.DATABASE_URL) throw new Error('Server DATABASE_URL is required.');
    const sql = neon(process.env.DATABASE_URL);
    const result = await migrateLocationSeasons({
      apply,
      environment: process.env.VERCEL_ENV,
      query: (statement) => sql.query(statement),
    });
    console.info(JSON.stringify(result, null, 2));
    if (!result.ready) process.exitCode = 1;
  } catch {
    console.error(
      'Location seasons schema check/migration failed. No completion is confirmed; inspect the server configuration and run --check.'
    );
    process.exitCode = 1;
  }
}
