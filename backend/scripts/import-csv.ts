import 'dotenv/config';
import { readFileSync } from 'node:fs';
import type pg from 'pg';
import { pool } from '../src/db/pool.js';

type Row = Record<string, string>;

const WEEKDAY_INDEX: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  'segunda-feira': 1,
  'terça': 2,
  'terça-feira': 2,
  quarta: 3,
  'quarta-feira': 3,
  quinta: 4,
  'quinta-feira': 4,
  sexta: 5,
  'sexta-feira': 5,
  'sábado': 6,
  sabado: 6,
};

const PALETA = ['#4f46e5', '#0d9488', '#db2777', '#c2410c', '#ca8a04', '#059669', '#7c3aed', '#e11d48', '#16a34a', '#64748b'];

function parseCSV(text: string): Row[] {
  const rows: Row[] = [];
  let headers: string[] | null = null;
  let current: string[] = [];
  let field = '';
  let quoted = false;
  let i = 0;

  const pushField = (): void => {
    current.push(field);
    field = '';
  };
  const pushRow = (): void => {
    if (current.length === 0) return;
    if (headers === null) {
      headers = [...current];
      current = [];
      return;
    }
    const record: Row = {};
    current.forEach((value, idx) => {
      const header = headers?.[idx] ?? '';
      if (header) record[header] = value;
    });
    rows.push(record);
    current = [];
  };

  while (i < text.length) {
    const ch = text[i] ?? '';
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      pushField();
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      pushField();
      pushRow();
    } else {
      field += ch;
    }
    i++;
  }
  pushField();
  pushRow();

  return rows.filter((r) => Object.values(r).some((v) => v.trim() !== ''));
}

function parseDate(value: string): string {
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (m) {
    const dia = m[1];
    const mes = m[2];
    const ano = m[3];
    if (dia === undefined || mes === undefined || ano === undefined) {
      throw new Error(`Data inválida: "${value}"`);
    }
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  throw new Error(`Data inválida: "${value}"`);
}

function parseHora(value: string | undefined): string | null {
  const v = (value ?? '').trim();
  if (!v) return null;
  const normalized = v.replace('h', ':').replace('H', ':');
  const m = /^(\d{1,2}):(\d{2})(:(\d{2}))?$/.exec(normalized);
  if (m) {
    const hh = m[1];
    const mm = m[2];
    if (hh === undefined || mm === undefined) {
      throw new Error(`Hora inválida: "${value ?? ''}"`);
    }
    return `${hh.padStart(2, '0')}:${mm}`;
  }
  throw new Error(`Hora inválida: "${value ?? ''}"`);
}

function parseDiaSemana(value: string | undefined): number | null {
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return null;
  if (/^[0-6]$/.test(v)) return Number(v);
  const idx = WEEKDAY_INDEX[v];
  if (idx === undefined) throw new Error(`Dia da semana inválido: "${value ?? ''}"`);
  return idx;
}

async function resolveCategoria(client: pg.PoolClient, nome: string): Promise<string> {
  const { rows } = await client.query('SELECT id FROM categories WHERE nome = $1', [nome]);
  if (rows[0]) return (rows[0] as { id: string }).id;
  const { rows: created } = await client.query<{ id: string }>(
    `INSERT INTO categories (nome, cor, ordem)
     VALUES ($1, $2, (SELECT COALESCE(MAX(ordem), 0) + 10 FROM categories))
     RETURNING id`,
    [nome, PALETA[Math.floor(Math.random() * PALETA.length)]],
  );
  console.log(`Categoria criada automaticamente: ${nome}`);
  const createdRow = created[0];
  if (!createdRow) throw new Error(`Não foi possível criar a categoria "${nome}".`);
  return createdRow.id;
}

async function resolveComunidade(client: pg.PoolClient, nome: string): Promise<string> {
  const { rows } = await client.query('SELECT id FROM communities WHERE nome = $1', [nome]);
  if (rows[0]) return (rows[0] as { id: string }).id;
  const { rows: created } = await client.query<{ id: string }>(
    `INSERT INTO communities (nome, ordem)
     VALUES ($1, (SELECT COALESCE(MAX(ordem), 0) + 10 FROM communities))
     RETURNING id`,
    [nome],
  );
  console.log(`Comunidade criada automaticamente: ${nome}`);
  const createdRow = created[0];
  if (!createdRow) throw new Error(`Não foi possível criar a comunidade "${nome}".`);
  return createdRow.id;
}

async function insertEvent(client: pg.PoolClient, row: Row, eventoPaiId: string | null): Promise<void> {
  const cat = row.categoria?.trim();
  const com = row.comunidade?.trim();
  const categoriaId = cat ? await resolveCategoria(client, cat) : null;
  const comunidadeId = com ? await resolveComunidade(client, com) : null;
  const recorrencia = ((row.recorrencia ?? 'nenhuma').trim().toLowerCase() === 'semanal' ? 'semanal' : ((row.recorrencia ?? '').trim().toLowerCase() === 'mensal' ? 'mensal' : 'nenhuma'));

  await client.query(
    `INSERT INTO events
       (titulo, descricao, responsavel, local, categoria_id, comunidade_id,
        data_inicio, hora, data_fim, recorrencia, dia_semana, dia_mes, semana_mes,
        visibilidade, evento_pai_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [
      row.titulo?.trim() ?? 'Evento',
      row.descricao ?? null,
      row.responsavel ?? null,
      row.local ?? null,
      categoriaId,
      comunidadeId,
      parseDate(row.data ?? ''),
      parseHora(row.hora),
      row.data_fim ? parseDate(row.data_fim) : null,
      recorrencia,
      parseDiaSemana(row.dia_semana),
      row.dia_mes ? Number(row.dia_mes) : null,
      'publico',
      eventoPaiId,
    ],
  );
}

function resolveCsvPath(arg: string | undefined): string {
  if (!arg) return 'scripts/agenda-2026.csv';
  if (/^\d{4}$/.test(arg)) return `scripts/agenda-${arg}.csv`;
  return arg;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const clean = process.argv.includes('--clean');
  const caminho = resolveCsvPath(args[0]);
  console.log(`Carregando arquivo CSV: ${caminho}`);
  const text = readFileSync(caminho, 'utf8');
  const rows = parseCSV(text);
  if (rows.length === 0) {
    console.error('Nenhuma linha encontrada no CSV.');
    process.exit(1);
  }

  const cacheSerie = new Map<string, string>();
  let eventos = 0;
  let series = 0;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (clean) {
      await client.query('TRUNCATE events, event_occurrence_cancellations CASCADE');
      console.log('Tabela events truncada para importação limpa.');
    }

    for (const row of rows) {
      const serie = row.serie?.trim();
      if (serie) {
        const paiId = cacheSerie.get(serie);
        if (paiId) {
          await insertEvent(client, row, paiId);
        } else {
          const { rows: paiRows } = await client.query<{ id: string }>(
            `INSERT INTO events (titulo, data_inicio, recorrencia)
             VALUES ($1, $2, 'nenhuma') RETURNING id`,
            [serie, parseDate(row.data ?? '')],
          );
          const paiRow = paiRows[0];
          if (!paiRow) throw new Error(`Não foi possível criar o evento "guarda-chuva" da série "${serie}".`);
          cacheSerie.set(serie, paiRow.id);
          series++;
          await insertEvent(client, row, paiRow.id);
        }
      } else {
        await insertEvent(client, row, null);
      }
      eventos++;
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  console.log(`Importação concluída: ${eventos} eventos, ${series} séries.`);
  await pool.end();
}

main().catch(async (err: unknown) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});