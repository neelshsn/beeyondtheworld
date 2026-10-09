import pg from 'pg';

// Preserve date-only fields across server/client time zones.
pg.types.setTypeParser(1082, (value) => value);
export function createPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw Error('Database connection is not configured.');
  const url = new URL(connectionString);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const names = ['DATABASE_SSL_CA_BASE64', 'DATABASE_SSL_CERT_BASE64', 'DATABASE_SSL_KEY_BASE64'];
  const values = names.map((name) => process.env[name]);
  if (!local && values.some((value) => !value))
    throw Error('Database mutual TLS configuration is incomplete.');
  for (const name of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(name);
  const ssl = values.every(Boolean)
    ? {
        rejectUnauthorized: true,
        ca: Buffer.from(values[0], 'base64').toString(),
        cert: Buffer.from(values[1], 'base64').toString(),
        key: Buffer.from(values[2], 'base64').toString(),
      }
    : false;
  const pool = new pg.Pool({
    connectionString: url.toString(),
    ssl,
    max: 3,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    allowExitOnIdle: true,
    query_timeout: 35000,
    application_name: 'beeyondtheworld',
  });
  pool.on('error', () => console.error('An idle database connection was closed.'));
  return pool;
}
export function createSql(connectionString) {
  const pool = createPool(connectionString);
  const rows = (result) => (Array.isArray(result) ? result.flatMap((r) => r.rows) : result.rows);
  return {
    pool,
    query: async (text, params = []) => rows(await pool.query(text, params)),
    transaction: async (statements) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
        const result = [];
        for (const statement of statements)
          result.push(rows(await client.query(statement.text, statement.params || [])));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
