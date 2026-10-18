import fs from 'node:fs/promises';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { createPool } from '../config/postgres.mjs';
const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    actor: { type: 'string' },
    output: { type: 'string' },
    issue: { type: 'boolean' },
  },
});
if (!values.issue || !values.email || !values.actor || !values.output)
  throw Error('Explicit --issue, --email, --actor and --output are required.');
const email = values.email.trim().toLowerCase(),
  actor = values.actor.trim().toLowerCase();
const digest = (x) => createHash('sha256').update(x).digest('hex');
const pool = createPool(),
  sql = await pool.connect();
try {
  await sql.query('BEGIN');
  const database = (await sql.query('SELECT current_database() d')).rows[0].d;
  if (!['bee_site', 'bee_site_qa'].includes(database)) throw Error('Unexpected database.');
  const grant = (
    await sql.query(
      "SELECT email FROM bee_creative_access WHERE email=$1 AND role='bee' AND NOT demo_only",
      [actor]
    )
  ).rows;
  if (grant.length !== 1) throw Error('Existing Bee operator required.');
  const rows = (
    await sql.query(
      'SELECT id,name,email,password_hash FROM bee_community_users WHERE lower(email)=$1 AND NOT disabled',
      [email]
    )
  ).rows;
  if (rows.length !== 1) throw Error('A unique active existing account is required.');
  const user = rows[0];
  await sql.query("SELECT pg_advisory_xact_lock(hashtext('community-recovery:'||$1))", [user.id]);
  const current = (
    await sql.query('SELECT password_hash FROM bee_community_users WHERE id=$1 FOR UPDATE', [
      user.id,
    ])
  ).rows[0];
  await sql.query(
    'UPDATE bee_community_password_resets SET revoked_at=now() WHERE user_id=$1 AND used_at IS NULL AND revoked_at IS NULL',
    [user.id]
  );
  const token = randomBytes(32).toString('hex');
  const row = (
    await sql.query(
      "INSERT INTO bee_community_password_resets(id,user_id,token_hash,password_fingerprint,created_by,expires_at) VALUES($1,$2,$3,$4,$5,now()+interval '24 hours') RETURNING id,expires_at",
      [randomUUID(), user.id, digest(token), digest(current.password_hash), actor]
    )
  ).rows[0];
  await fs.writeFile(
    values.output,
    JSON.stringify({
      id: row.id,
      email: user.email,
      name: user.name,
      expiresAt: row.expires_at,
      url: 'https://beeyondtheworld.com/community/reset-password#' + token,
    }),
    { flag: 'wx', mode: 0o600 }
  );
  await sql.query('COMMIT');
  console.log(
    JSON.stringify({
      issued: true,
      email: user.email,
      expiresAt: row.expires_at,
      secretLink: 'Saved privately; not printed',
    })
  );
} catch (e) {
  await sql.query('ROLLBACK');
  throw e;
} finally {
  sql.release();
  await pool.end();
}
