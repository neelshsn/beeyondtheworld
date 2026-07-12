/**
 * T-050 — création/mise à jour du schéma dans Neon PostgreSQL.
 * Usage : node scripts/db-push.mjs  (lit DATABASE_URL depuis .env.local)
 */
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

function loadEnvLocal() {
  if (process.env.DATABASE_URL) return;
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // .env.local absent — DATABASE_URL doit venir de l'environnement
  }
}

loadEnvLocal();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL manquant (.env.local)');
  process.exit(1);
}

const sql = neon(url);

const statements = [
  `CREATE TABLE IF NOT EXISTS journeys (
    id serial PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    season text NOT NULL DEFAULT 'spring-summer',
    season_tags jsonb NOT NULL DEFAULT '[]',
    season_visuals jsonb NOT NULL DEFAULT '{}',
    date_label text NOT NULL DEFAULT '',
    date_from text,
    date_to text,
    location text NOT NULL DEFAULT '',
    image text NOT NULL DEFAULT '',
    background_video text,
    regions jsonb NOT NULL DEFAULT '[]',
    moods jsonb NOT NULL DEFAULT '[]',
    sustainable_pdf text,
    position integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS locations (
    id serial PRIMARY KEY,
    journey_id integer NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    name text NOT NULL,
    subtitle text,
    left_title jsonb NOT NULL DEFAULT '[]',
    narrative text NOT NULL DEFAULT '',
    image text,
    video text,
    media jsonb NOT NULL DEFAULT '[]',
    position integer NOT NULL DEFAULT 0,
    published boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS locations_journey_id_idx ON locations(journey_id)`,
  `CREATE TABLE IF NOT EXISTS admin_users (
    id serial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS admin_sessions (
    token text PRIMARY KEY,
    admin_user_id integer NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at timestamp NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
];

for (const statement of statements) {
  await sql.query(statement);
}

const [{ count: journeyCount }] = await sql.query('SELECT count(*)::int AS count FROM journeys');
console.log(`Schéma OK — table journeys prête (${journeyCount} enregistrement(s)).`);
