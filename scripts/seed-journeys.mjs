/**
 * T-050 — seed initial hors serveur : importe src/data/journeys-carousel.ts
 * (fichier quasi-JSON : on retire l'import de type et l'annotation) et upsert
 * les voyages dans Neon. Ré-exécutable. Usage : node scripts/seed-journeys.mjs
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
    /* DATABASE_URL doit venir de l'environnement */
  }
}

loadEnvLocal();
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL manquant (.env.local)');
  process.exit(1);
}

const source = readFileSync(new URL('../src/data/journeys-carousel.ts', import.meta.url), 'utf8')
  .replace(/import[^;]+;/g, '')
  .replace('export const journeys: Journey[] =', 'globalThis.__journeys =');
new Function(source)();
const journeys = globalThis.__journeys;

const SUSTAINABLE_PDFS = {
  philippines: '/pdfs/philippines-lighting-oceans-wonders.pdf',
};

const sql = neon(url);
let seeded = 0;

for (const [index, journey] of journeys.entries()) {
  await sql.query(
    `INSERT INTO journeys (slug, title, season, season_tags, season_visuals, date_label, location, image, background_video, regions, moods, sustainable_pdf, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       season = EXCLUDED.season,
       season_tags = EXCLUDED.season_tags,
       season_visuals = EXCLUDED.season_visuals,
       date_label = EXCLUDED.date_label,
       location = EXCLUDED.location,
       image = EXCLUDED.image,
       background_video = EXCLUDED.background_video,
       regions = EXCLUDED.regions,
       moods = EXCLUDED.moods,
       sustainable_pdf = EXCLUDED.sustainable_pdf,
       position = EXCLUDED.position,
       updated_at = now()`,
    [
      journey.slug,
      journey.title,
      journey.season,
      JSON.stringify(journey.seasonTags ?? [journey.season]),
      JSON.stringify(journey.seasonVisuals ?? {}),
      journey.date ?? '',
      journey.location ?? '',
      journey.image ?? '',
      journey.backgroundVideo ?? null,
      JSON.stringify(journey.regions ?? []),
      JSON.stringify(journey.moods ?? []),
      SUSTAINABLE_PDFS[journey.slug] ?? null,
      index,
    ]
  );
  seeded += 1;
}

const [{ count }] = await sql.query('SELECT count(*)::int AS count FROM journeys');
console.log(`Seed OK — ${seeded} voyage(s) upsertés, ${count} en base.`);
