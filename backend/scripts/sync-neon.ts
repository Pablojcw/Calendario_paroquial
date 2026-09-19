import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../sql/schema.sql');
const targetArg = process.argv[2];
const csvFilename = targetArg && /^\d{4}$/.test(targetArg)
  ? `agenda-${targetArg}.csv`
  : (targetArg || 'agenda-2026.csv');
const csvPath = path.isAbsolute(csvFilename) ? csvFilename : path.resolve(here, csvFilename);

const NEON_URL =
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!NEON_URL) {
  console.error('❌ Erro: DATABASE_URL ou NEON_DATABASE_URL não configurada no ambiente.');
  process.exit(1);
}

const COMUNIDADES_BASE = [
  { nome: 'Igreja Matriz', endereco: 'Rua Carlos Gomes, nº 436', bairro: 'Centro', ordem: 1 },
  { nome: 'Capela Divino Espírito Santo', endereco: 'Rua Joviano de Medeiros, n° 45', bairro: 'Residencial Maximino', ordem: 2 },
  { nome: 'Capela Jesus da Divina Misericórdia', endereco: 'Rua Carmela Isoldi da Cunha, n° 205', bairro: 'Vencesville', ordem: 3 },
  { nome: 'Capela Nossa Senhora Desatadora dos Nós', endereco: 'Centro de Formação', bairro: 'Aymoré', ordem: 4 },
  { nome: 'Capela Nossa Senhora Aparecida', endereco: 'Rua Castro Alves, n° 444', bairro: 'Ernane Murad', ordem: 5 },
  { nome: 'Capela Nossa Senhora do Carmo', endereco: 'Rua Jean Carlos Campos Scalon, n° 32', bairro: 'Residencial Azenha', ordem: 6 },
  { nome: 'Capela Nosso Senhor do Bonfim', endereco: 'Rua Monte Castelo, n° 77', bairro: 'Vila Bonfim', ordem: 7 },
  { nome: 'Capela Santa Edwiges', endereco: 'Rua Carlos Bueno da Fonseca, praça', bairro: 'Augusto Pereira', ordem: 8 },
  { nome: 'Capela Santa Luzia', endereco: 'Rua José Alves Ferreira, n° 559', bairro: 'Vila Luiza', ordem: 9 },
  { nome: 'Capela Santo Expedito', endereco: 'Rua Francisco Gomes Moreira, n° 65', bairro: 'Vila Nova', ordem: 10 },
  { nome: 'Capela São Francisco de Assis', endereco: 'Rua Milton Esposto, n° 425', bairro: 'Faive', ordem: 11 },
  { nome: 'Capela São Judas Tadeu', endereco: 'Rua Piracicaba, n° 233', bairro: 'Coroados', ordem: 12 },
];

const CATEGORIAS_BASE = [
  { nome: 'Missa', cor: '#1d4ed8', ordem: 10 },
  { nome: 'Celebração da Palavra', cor: '#0284c7', ordem: 20 },
  { nome: 'Devoções e Oração', cor: '#7c3aed', ordem: 30 },
  { nome: 'Novenas e Tríduos', cor: '#be185d', ordem: 40 },
  { nome: 'Catequese e Formação', cor: '#059669', ordem: 50 },
  { nome: 'Acampamentos e Retiros', cor: '#d97706', ordem: 60 },
  { nome: 'Sacramentos e Bênçãos', cor: '#9333ea', ordem: 70 },
  { nome: 'Eventos Sociais e Festas', cor: '#ea580c', ordem: 80 },
  { nome: 'Reuniões e Clero', cor: '#475569', ordem: 90 },
];

type Row = Record<string, string>;

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
    return `${ano}-${mes?.padStart(2, '0')}-${dia?.padStart(2, '0')}`;
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
    return `${hh?.padStart(2, '0')}:${mm}`;
  }
  throw new Error(`Hora inválida: "${value ?? ''}"`);
}

async function run() {
  console.log('🚀 Conectando ao Neon PostgreSQL...');
  const client = new pg.Client({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('✅ Conexão estabelecida com Neon com sucesso!');

  try {
    // 1. Aplicar schema
    console.log('\n📄 Aplicando schema.sql...');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema e tabelas verificados/criados.');

    // 2. Limpar dados de eventos e categorias antigas
    console.log('\n🧹 Limpando dados legados (events, cancellations)...');
    await client.query('TRUNCATE events, event_occurrence_cancellations CASCADE;');
    await client.query('DELETE FROM categories;');
    console.log('✅ Tabelas limpas para receber a nova estrutura.');

    // 3. Atualizar categorias
    console.log('\n🎨 Inserindo 9 categorias oficiais...');
    for (const cat of CATEGORIAS_BASE) {
      await client.query(
        `INSERT INTO categories (nome, cor, ordem) VALUES ($1, $2, $3)
         ON CONFLICT (nome) DO UPDATE SET cor = EXCLUDED.cor, ordem = EXCLUDED.ordem`,
        [cat.nome, cat.cor, cat.ordem],
      );
    }
    console.log('✅ 9 categorias inseridas/atualizadas.');

    // 4. Atualizar comunidades
    console.log('\n⛪ Atualizando comunidades...');
    for (const c of COMUNIDADES_BASE) {
      const { rows } = await client.query('SELECT id FROM communities WHERE nome = $1', [c.nome]);
      if (rows.length === 0) {
        await client.query(
          `INSERT INTO communities (nome, endereco, bairro, ordem) VALUES ($1, $2, $3, $4)`,
          [c.nome, c.endereco, c.bairro, c.ordem],
        );
      } else {
        await client.query(
          `UPDATE communities SET endereco = $2, bairro = $3, ordem = $4 WHERE nome = $1`,
          [c.nome, c.endereco, c.bairro, c.ordem],
        );
      }
    }
    console.log('✅ 12 comunidades sincronizadas.');

    // 5. Garantir usuário Admin
    console.log('\n👤 Garantindo usuário administrador...');
    const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@paroquia.local';
    const adminNome = process.env.BOOTSTRAP_ADMIN_NOME || 'Administrador';
    const adminSenha = process.env.BOOTSTRAP_ADMIN_SENHA || 'Paroquia#Admin2026!';
    const { rows: adminRows } = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (adminRows.length === 0) {
      const senhaHash = await bcrypt.hash(adminSenha, 12);
      await client.query(
        `INSERT INTO users (nome, email, senha_hash, papel) VALUES ($1, $2, $3, 'admin')`,
        [adminNome, adminEmail, senhaHash],
      );
      console.log(`✅ Admin criado: ${adminEmail}`);
    } else {
      console.log(`✅ Admin existente: ${adminEmail}`);
    }

    // 6. Atualizar informações da paróquia
    console.log('\n📖 Atualizando mensagem e dados institucionais...');
    const mensagemPadre = `Queridos irmãos e irmãs em Cristo, povo amado da paróquia Nossa Senhora de Fátima: Paróquia de gente feliz. Ao nos aproximarmos do ano de 2026, nossos corações se enchem de gratidão e alegria. Este será um tempo especial para nós: celebraremos 95 anos de história, fé, missão, lágrimas, conquistas, lutas e sonhos que se entrelaçam na vida desta comunidade. Noventa e cinco anos de um povo que caminha, que crê, que serve, que se levanta, que ama.

Desde os primeiros passos desta paróquia, a graça de Deus tem sido nossa força. Aqui aprendemos, dia após dia, o sentido profundo das palavras de Jesus: "Nisto todos saberão que sois meus discípulos: se vos amardes uns aos outros." (Jo 13,35). Este é o coração de toda pastoral. Este é o fundamento de todo ministério. Este é o novo mandamento, que não envelhece com o tempo: o amor.

Somos chamados a servir. Mas não a servir por obrigação. Servimos porque fomos amados primeiro (cf. 1 Jo 4,19). Servimos porque encontramos, em Cristo, o sentido de nossas mãos, vozes, passos e intenções. Na parábola do lava-pés (Jo 13,1-15), Jesus nos mostra que a autoridade na Igreja não é privilégio, é entrega. Que ser grande é ajoelhar-se diante do irmão. Que o poder do Evangelho é o poder do amor que se faz serviço.

Por isso, ao abrirmos esta "Agenda Pastoral de 2026", eu quero lhe fazer um convite muito sincero: Não seja apenas alguém que assiste a comunidade. Seja alguém que constrói a comunidade. Deixe-se tocar pelo chamado de Cristo: "Apascenta as minhas ovelhas." (Jo 21,15-17).

Que Nossa Senhora de Fátima nos cubra com seu manto; e São Francisco de Paula nos ajude a sermos caridosos. E que cada fiel batizado seja sinal vivo da ternura de Deus no mundo.`;

    await client.query(
      `INSERT INTO parish_info (id, nome, endereco, telefone, whatsapp, email, expediente, instagram, ano_fundacao, administrador_paroquial, conteudo)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         nome = EXCLUDED.nome,
         endereco = EXCLUDED.endereco,
         telefone = EXCLUDED.telefone,
         whatsapp = EXCLUDED.whatsapp,
         email = EXCLUDED.email,
         expediente = EXCLUDED.expediente,
         instagram = EXCLUDED.instagram,
         ano_fundacao = EXCLUDED.ano_fundacao,
         administrador_paroquial = EXCLUDED.administrador_paroquial,
         conteudo = EXCLUDED.conteudo`,
      [
        'Paróquia Nossa Senhora de Fátima e São Francisco de Paula',
        'Rua Carlos Gomes, nº 436, Centro, Presidente Venceslau - SP',
        '(18) 3271-1188',
        '(18) 99763-1002',
        'pnsfatimavenceslau@gmail.com',
        'Segunda a sexta das 08h às 17h, sábados das 08h às 11h',
        '@pnsfatimaepaula',
        1931,
        'Pe. David Antonio da Silva',
        mensagemPadre,
      ],
    );
    console.log('✅ Dados institucionais atualizados.');

    // 7. Importar todos os 1.147 eventos do CSV oficial 2026
    console.log(`\n📅 Lendo CSV oficial em ${csvPath}...`);
    const csvContent = readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent);
    console.log(`📊 ${rows.length} linhas encontradas no CSV.`);

    // Mapeamento em memória de categorias e comunidades para rapidez
    const catMap = new Map<string, string>();
    const comMap = new Map<string, string>();

    const { rows: allCats } = await client.query<{ id: string; nome: string }>('SELECT id, nome FROM categories');
    for (const c of allCats) catMap.set(c.nome.toLowerCase().trim(), c.id);

    const { rows: allComs } = await client.query<{ id: string; nome: string }>('SELECT id, nome FROM communities');
    for (const c of allComs) comMap.set(c.nome.toLowerCase().trim(), c.id);

    console.log('💾 Inserindo eventos no Neon...');
    await client.query('BEGIN');

    let inserted = 0;
    for (const row of rows) {
      const catName = row.categoria?.toLowerCase().trim() ?? '';
      const comName = row.comunidade?.toLowerCase().trim() ?? '';

      let categoriaId = catMap.get(catName) || null;
      let comunidadeId = comMap.get(comName) || null;

      if (!categoriaId && row.categoria?.trim()) {
        const { rows: createdCat } = await client.query<{ id: string }>(
          `INSERT INTO categories (nome, cor, ordem) VALUES ($1, '#4f46e5', 100) ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome RETURNING id`,
          [row.categoria.trim()],
        );
        categoriaId = createdCat[0]?.id || null;
        if (categoriaId) catMap.set(catName, categoriaId);
      }

      if (!comunidadeId && row.comunidade?.trim()) {
        const { rows: createdCom } = await client.query<{ id: string }>(
          `INSERT INTO communities (nome, ordem) VALUES ($1, 100) ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome RETURNING id`,
          [row.comunidade.trim()],
        );
        comunidadeId = createdCom[0]?.id || null;
        if (comunidadeId) comMap.set(comName, comunidadeId);
      }

      await client.query(
        `INSERT INTO events
           (titulo, descricao, responsavel, local, categoria_id, comunidade_id,
            data_inicio, hora, data_fim, recorrencia, visibilidade)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'nenhuma', 'publico')`,
        [
          row.titulo?.trim() ?? 'Evento',
          row.descricao?.trim() || null,
          row.responsavel?.trim() || null,
          row.local?.trim() || null,
          categoriaId,
          comunidadeId,
          parseDate(row.data ?? ''),
          parseHora(row.hora),
          row.data_fim ? parseDate(row.data_fim) : null,
        ],
      );
      inserted++;
    }

    await client.query('COMMIT');
    console.log(`✅ ${inserted} eventos inseridos no Neon com sucesso!`);

    // 8. Verificação final
    console.log('\n🔎 Verificando integridade no Neon:');
    const { rows: countEvents } = await client.query('SELECT count(*)::int AS count FROM events');
    const { rows: countCategories } = await client.query('SELECT count(*)::int AS count FROM categories');
    const { rows: countCommunities } = await client.query('SELECT count(*)::int AS count FROM communities');

    console.log(`   - Total de eventos: ${countEvents[0]?.count}`);
    console.log(`   - Total de categorias: ${countCategories[0]?.count}`);
    console.log(`   - Total de comunidades: ${countCommunities[0]?.count}`);

    // Exemplo de consulta do dia 19/09/2026
    const { rows: sampleEvents } = await client.query(
      `SELECT e.data_inicio, e.hora, e.titulo, e.local, c.nome as categoria
       FROM events e
       LEFT JOIN categories c ON c.id = e.categoria_id
       WHERE e.data_inicio = '2026-09-19'
       ORDER BY e.hora NULLS LAST`,
    );
    console.log('\n📅 Eventos de amostra para 19/09/2026 no Neon:');
    console.table(sampleEvents);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Erro na sincronização:', err);
    throw err;
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Falha fatal:', err);
  process.exit(1);
});
