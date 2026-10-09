import { sqlClient } from './client';
let ready: Promise<void> | null = null;
/** VPS schemas are applied during deployment; the application has no DDL privileges. */
export function ensureAdminAuthSchema(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    await sqlClient().query(
      'SELECT id,password_hash,setup_token,setup_token_expires_at FROM admin_users LIMIT 0'
    );
    await sqlClient().query('SELECT token,admin_user_id,expires_at FROM admin_sessions LIMIT 0');
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}
