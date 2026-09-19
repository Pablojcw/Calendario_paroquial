import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

pg.types.setTypeParser(1082, (value: string) => value);

const isSsl = env.DATABASE_URL.includes('neon.tech') || env.DATABASE_URL.includes('sslmode=require');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
});

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}