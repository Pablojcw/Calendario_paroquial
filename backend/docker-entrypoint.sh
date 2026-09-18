#!/bin/sh
set -e

echo "==> Aguardando o PostgreSQL..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  for (let i = 0; i < 30; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('PostgreSQL disponível.');
      process.exit(0);
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error('PostgreSQL não respondeu a tempo.');
  process.exit(1);
})();
"

echo "==> Aplicando schema..."
npm run db:setup

echo "==> Seed (admin e comunidades)..."
npm run db:seed

EVENTS=$(node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  try {
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM events');
    process.stdout.write(String(rows[0].n));
  } catch {
    process.stdout.write('0');
  }
  process.exit(0);
})();
")

if [ "$EVENTS" = "0" ]; then
  echo "==> Banco vazio: importando agenda 2026..."
  npm run db:import -- scripts/agenda-2026.csv
else
  echo "==> Agenda já importada ($EVENTS eventos)."
fi

echo "==> Iniciando a API..."
exec node dist/server.js