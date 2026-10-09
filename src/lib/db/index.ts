import { getPool } from './client';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from './schema';

let db: NodePgDatabase<typeof schema> | null = null;

export function getDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL manquant — renseigner .env.local (cf. dossier/MEGA-PROMPT.md).'
      );
    }
    db = drizzle(getPool(), { schema });
  }
  return db;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export * from './schema';
