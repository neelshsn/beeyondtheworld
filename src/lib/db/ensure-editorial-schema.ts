import { neon } from '@neondatabase/serverless';

let ready: Promise<void> | null = null;

/**
 * Migration additive et idempotente. Elle permet au nouveau CMS d'être activé
 * sans toucher aux tables Journeys/Locations ni à leur contenu existant.
 */
export function ensureEditorialSchema(): Promise<void> {
  if (ready) return ready;

  ready = (async () => {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not configured.');
    const sql = neon(url);

    await sql.query(`CREATE TABLE IF NOT EXISTS content_documents (
      id serial PRIMARY KEY,
      kind text NOT NULL,
      slug text NOT NULL,
      draft jsonb NOT NULL,
      published jsonb,
      revision integer NOT NULL DEFAULT 1,
      published_revision integer NOT NULL DEFAULT 0,
      position integer NOT NULL DEFAULT 0,
      archived boolean NOT NULL DEFAULT false,
      updated_by text,
      published_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )`);
    await sql.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS content_documents_kind_slug_idx ON content_documents(kind, slug)'
    );
    await sql.query(`CREATE TABLE IF NOT EXISTS media_assets (
      id serial PRIMARY KEY,
      url text NOT NULL UNIQUE,
      pathname text NOT NULL UNIQUE,
      original_name text NOT NULL,
      content_type text NOT NULL,
      media_type text NOT NULL,
      size integer NOT NULL DEFAULT 0,
      uploaded_by text,
      archived_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )`);
  })().catch((error) => {
    ready = null;
    throw error;
  });

  return ready;
}
