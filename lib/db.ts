import { Pool, QueryResult } from 'pg';

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'national_crime_records',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 10, // Max number of clients in the pool
  idleTimeoutMillis: 30000,
});

export function getPool(): Pool {
  return pool;
}

// Execute query with error handling
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T> {
  // Convert standard '?' placeholders to Postgres '$1, $2' format if needed
  // But standardizing on using $1, $2 in query strings is better in Postgres.
  // For compatibility with previous MySQL code which used '?', we might need a converter
  // OR we assume I will fix queries.
  // Actually, 'mysql2' uses '?' and 'pg' uses '$1', '$2'.
  // To avoid breaking ALL existing queries, I can try to replace '?' with '$n'.

  let pgQuery = query;
  let paramIndex = 1;
  while (pgQuery.includes('?')) {
    pgQuery = pgQuery.replace('?', `$${paramIndex}`);
    paramIndex++;
  }

  // Handle specific MySQL-syntax replacements if any (e.g. LAST_INSERT_ID() -> RETURNING id)
  // This is a basic adapter. Ideally, we should update queries in route files.

  try {
    const client = await pool.connect();
    try {
      const result: QueryResult = await client.query(query.includes('?') ? pgQuery : query, params);

      // Attempt to normalize result to look like MySQL (array of rows)
      // For INSERTs, 'pg' returns result.rows which might be empty unless RETURNING is used.
      // MySQL 'execute' returns [rows, fields] or [ResultSetHeader] for inserts.

      // If result.command is INSERT/UPDATE/DELETE, we might want to return something consistent.
      if (result.command === 'INSERT' && result.rows.length > 0) {
        // If we used RETURNING id, map it to insertId-like structure if code expects it
        return result.rows as any;
      }

      return result.rows as any; // Cast to T
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get a single row
export async function queryOne<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await executeQuery<any[]>(query, params);
  return rows && rows.length > 0 ? (rows[0] as T) : null;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connected successfully (PostgreSQL)');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Close pool (for cleanup)
export async function closePool(): Promise<void> {
  await pool.end();
}
