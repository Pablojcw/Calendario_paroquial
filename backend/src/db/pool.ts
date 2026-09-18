import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

pg.types.setTypeParser(1082, (value: string) => value);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}