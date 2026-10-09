import { createPool } from '../../../config/postgres.mjs';
import type { Pool, QueryResultRow } from 'pg';
let pool: Pool | undefined;
export function getPool() {
  return (pool ??= createPool());
}
export function sqlClient() {
  return {
    query: async <T extends QueryResultRow = QueryResultRow>(
      text: string,
      params: unknown[] = []
    ): Promise<T[]> => (await getPool().query<T>(text, params)).rows,
  };
}

export async function withTransaction<T>(
  work: (sql: ReturnType<typeof sqlClient>) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work({
      query: async <R extends QueryResultRow = QueryResultRow>(
        text: string,
        params: unknown[] = []
      ): Promise<R[]> => (await client.query<R>(text, params)).rows,
    });
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
