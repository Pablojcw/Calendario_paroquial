/**
 * Seed inicial: cria o usuário administrador e as comunidades-base.
 * Uso: npm run db:seed
 *
 * As comunidades e a agenda real (2026) entram via importação CSV:
 *   npm run db:import -- caminho/para/agenda.csv
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { pool } from '../src/db/pool.js';

async function ensureAdmin(): Promise<void> {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [env.BOOTSTRAP_ADMIN_EMAIL]);
  if (rows.length > 0) {
    console.log(`Admin já existe: ${env.BOOTSTRAP_ADMIN_EMAIL}`);
    return;
  }
  const senhaHash = await bcrypt.hash(env.BOOTSTRAP_ADMIN_SENHA, 12);
  await pool.query(
    `INSERT INTO users (nome, email, senha_hash, papel)
     VALUES ($1, $2, $3, 'admin')`,
    [env.BOOTSTRAP_ADMIN_NOME, env.BOOTSTRAP_ADMIN_EMAIL, senhaHash],
  );
  console.log(`Admin criado: ${env.BOOTSTRAP_ADMIN_EMAIL}`);
}

const COMUNIDADES_BASE = [
  { nome: 'Igreja Matriz', bairro: 'Centro', ordem: 1 },
  { nome: 'Capela São Judas Tadeu', bairro: '—', ordem: 10 },
  { nome: 'Capela Nossa Senhora Aparecida', bairro: '—', ordem: 11 },
];

async function ensureCommunities(): Promise<void> {
  for (const c of COMUNIDADES_BASE) {
    const { rowCount } = await pool.query('SELECT 1 FROM communities WHERE nome = $1', [c.nome]);
    if (rowCount === 0) {
      await pool.query(
        `INSERT INTO communities (nome, bairro, ordem) VALUES ($1, $2, $3)`,
        [c.nome, c.bairro, c.ordem],
      );
      console.log(`Comunidade criada: ${c.nome}`);
    }
  }
}

async function main(): Promise<void> {
  await ensureAdmin();
  await ensureCommunities();
  console.log('Seed concluído.');
  await pool.end();
}

main().catch(async (err: unknown) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});