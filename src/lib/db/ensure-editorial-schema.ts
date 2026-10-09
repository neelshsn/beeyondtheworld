import { sqlClient } from './client';
let ready: Promise<void> | null = null;
/** VPS schemas are applied during deployment; the application has no DDL privileges. */
export function ensureEditorialSchema(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    await sqlClient().query(
      'SELECT id,kind,slug,draft,published,revision FROM content_documents LIMIT 0'
    );
    await sqlClient().query('SELECT id,url,pathname,archived_at FROM media_assets LIMIT 0');
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}
