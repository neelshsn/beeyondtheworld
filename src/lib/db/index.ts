import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from './schema';

let db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL manquant — renseigner .env.local (cf. dossier/MEGA-PROMPT.md).'
      );
    }
    db = drizzle(neon(url), { schema });
  }
  return db;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export * from './schema';
