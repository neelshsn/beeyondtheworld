/**
 * T-050 — invite un éditeur du dashboard : crée (ou ré-invite) un compte SANS
 * mot de passe avec un lien d'activation à usage unique — l'invité choisit son
 * mot de passe lui-même en ouvrant le lien.
 *
 * Usage : node scripts/invite-admin.mjs eugenie@beeyondtheworld.com
 * (Ré-exécuter sur un e-mail existant régénère un lien = réinitialisation.)
 */
import { createHash, randomBytes } from 'node:crypto';
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
const email = (process.argv[2] ?? '').trim().toLowerCase();

if (!url) {
  console.error('DATABASE_URL manquant (.env.local)');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage : node scripts/invite-admin.mjs <email>');
  process.exit(1);
}

const sql = neon(url);
const token = randomBytes(32).toString('hex');
const tokenDigest = createHash('sha256').update(token).digest('hex');
const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

const invited = await sql.query(
  `INSERT INTO admin_users (email, password_hash, setup_token, setup_token_expires_at)
   VALUES ($1, NULL, $2, $3)
   ON CONFLICT (email) DO UPDATE SET
     setup_token = EXCLUDED.setup_token,
     setup_token_expires_at = EXCLUDED.setup_token_expires_at
   WHERE admin_users.password_hash IS NULL
   RETURNING email`,
  [email, tokenDigest, expiresAt]
);

if (invited.length === 0) {
  console.error('Ce compte est déjà actif. Utilise un flux de réinitialisation séparé.');
  process.exit(1);
}

console.log(`Invitation créée pour ${email}`);
console.log("Lien d'activation (usage unique, valable 72 h, ne pas commiter) :");
console.log(`  /admin#invite=${token}`);
