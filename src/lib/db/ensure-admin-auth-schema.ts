import { neon } from '@neondatabase/serverless';

let ready: Promise<void> | null = null;

/** Migration additive requise par les invitations limitées dans le temps. */
export function ensureAdminAuthSchema(): Promise<void> {
  if (ready) return ready;

  ready = (async () => {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not configured.');
    const sql = neon(url);
    await sql.query(`CREATE TABLE IF NOT EXISTS admin_users (
      id serial PRIMARY KEY,
      email text NOT NULL UNIQUE,
      password_hash text,
      setup_token text,
      setup_token_expires_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )`);
    await sql.query('ALTER TABLE admin_users ALTER COLUMN password_hash DROP NOT NULL');
    await sql.query('ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS setup_token text');
    await sql.query(
      'ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS setup_token_expires_at timestamp'
    );
    await sql.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS admin_users_setup_token_idx ON admin_users(setup_token)'
    );
    await sql.query(`CREATE TABLE IF NOT EXISTS admin_sessions (
      token text PRIMARY KEY,
      admin_user_id integer NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at timestamp NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )`);
  })().catch((error) => {
    ready = null;
    throw error;
  });

  return ready;
}
