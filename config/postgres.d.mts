import type { Pool, QueryResultRow } from 'pg';
export function createPool(connectionString?: string): Pool;
export function createSql(connectionString?: string): {
  pool: Pool;
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<T[]>;
  transaction(statements: { text: string; params?: unknown[] }[]): Promise<QueryResultRow[][]>;
};
