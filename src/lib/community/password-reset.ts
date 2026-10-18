import { createHash, randomBytes, scrypt as rawScrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { withTransaction } from '@/lib/db/client';

const scrypt = promisify(rawScrypt);
export const resetDigest = (value: string) => createHash('sha256').update(value).digest('hex');
export const validResetToken = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export function validResetPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 12 && value.length <= 200;
}
export class PasswordResetUnavailable extends Error {}
export async function redeemPasswordReset(token: string, password: string) {
  if (!validResetToken(token) || !validResetPassword(password))
    throw new PasswordResetUnavailable();
  return withTransaction(async (sql) => {
    const [candidate] = await sql.query(
      'SELECT user_id FROM bee_community_password_resets WHERE token_hash=$1',
      [resetDigest(token)]
    );
    if (!candidate) throw new PasswordResetUnavailable();
    await sql.query("SELECT pg_advisory_xact_lock(hashtext('community-recovery:'||$1))", [
      candidate.user_id,
    ]);
    const [row] = await sql.query(
      `SELECT r.id,r.password_fingerprint,u.id AS user_id,u.password_hash,u.email
       FROM bee_community_password_resets r JOIN bee_community_users u ON u.id=r.user_id
       WHERE r.token_hash=$1 AND r.expires_at>now() AND r.used_at IS NULL
       AND r.revoked_at IS NULL AND NOT u.disabled FOR UPDATE OF r,u`,
      [resetDigest(token)]
    );
    if (!row || row.password_fingerprint !== resetDigest(row.password_hash))
      throw new PasswordResetUnavailable();
    const salt = randomBytes(16).toString('hex');
    const hash = salt + ':' + ((await scrypt(password, salt, 64)) as Buffer).toString('hex');
    await sql.query('UPDATE bee_community_users SET password_hash=$1 WHERE id=$2', [
      hash,
      row.user_id,
    ]);
    await sql.query('UPDATE bee_community_password_resets SET used_at=now() WHERE id=$1', [row.id]);
    await sql.query(
      'UPDATE bee_community_password_resets SET revoked_at=now() WHERE user_id=$1 AND id<>$2 AND used_at IS NULL AND revoked_at IS NULL',
      [row.user_id, row.id]
    );
    await sql.query('DELETE FROM bee_community_sessions WHERE user_id=$1', [row.user_id]);
    await sql.query('DELETE FROM bee_community_login_limits WHERE key=$1', [
      resetDigest(row.email.toLowerCase()),
    ]);
    return { ok: true };
  });
}
