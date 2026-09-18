/**
 * Aplica o schema.sql ao banco de dados.
 * Uso: npm run db:setup
 * Cria o banco "paroquia" se ele ainda não existir (via conexão template postgres).
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';
import { env } from '../src/config/env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../sql/schema.sql');

async function ensureDatabase(): Promise<void> {
  const url = new URL(env.DATABASE_URL);
  const dbName = url.pathname.replace(/^\//, '');
  if (!dbName) throw new Error('DATABASE_URL sem nome de banco');

  const adminUrl = new URL(url);
  adminUrl.pathname = '/postgres';

  const client = new pg.Client({ connectionString: adminUrl.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Banco "${dbName}" criado.`);
    } else {
      console.log(`Banco "${dbName}" já existe.`);
    }
  } finally {
    await client.end();
  }
}

async function run(): Promise<void> {
  await ensureDatabase();

  const sql = await readFile(schemaPath, 'utf8');
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
    console.log('Schema aplicado com sucesso.');
  } finally {
    await client.end();
  }
}

run().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});