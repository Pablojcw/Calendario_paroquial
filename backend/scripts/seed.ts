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

async function ensureCommunities(): Promise<void> {
  for (const c of COMUNIDADES_BASE) {
    const { rows } = await pool.query('SELECT id FROM communities WHERE nome = $1', [c.nome]);
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO communities (nome, endereco, bairro, ordem) VALUES ($1, $2, $3, $4)`,
        [c.nome, c.endereco, c.bairro, c.ordem],
      );
      console.log(`Comunidade criada: ${c.nome}`);
    } else {
      await pool.query(
        `UPDATE communities SET endereco = $2, bairro = $3, ordem = $4 WHERE nome = $1`,
        [c.nome, c.endereco, c.bairro, c.ordem],
      );
    }
  }
}

async function ensureParishInfo(): Promise<void> {
  const mensagemPadre = `Queridos irmãos e irmãs em Cristo, povo amado da paróquia Nossa Senhora de Fátima: Paróquia de gente feliz. Ao nos aproximarmos do ano de 2026, nossos corações se enchem de gratidão e alegria. Este será um tempo especial para nós: celebraremos 95 anos de história, fé, missão, lágrimas, conquistas, lutas e sonhos que se entrelaçam na vida desta comunidade. Noventa e cinco anos de um povo que caminha, que crê, que serve, que se levanta, que ama.

Desde os primeiros passos desta paróquia, a graça de Deus tem sido nossa força. Aqui aprendemos, dia após dia, o sentido profundo das palavras de Jesus: "Nisto todos saberão que sois meus discípulos: se vos amardes uns aos outros." (Jo 13,35). Este é o coração de toda pastoral. Este é o fundamento de todo ministério. Este é o novo mandamento, que não envelhece com o tempo: o amor.

Somos chamados a servir. Mas não a servir por obrigação. Servimos porque fomos amados primeiro (cf. 1 Jo 4,19). Servimos porque encontramos, em Cristo, o sentido de nossas mãos, vozes, passos e intenções. Na parábola do lava-pés (Jo 13,1-15), Jesus nos mostra que a autoridade na Igreja não é privilégio, é entrega. Que ser grande é ajoelhar-se diante do irmão. Que o poder do Evangelho é o poder do amor que se faz serviço.

Por isso, ao abrirmos esta "Agenda Pastoral de 2026", eu quero lhe fazer um convite muito sincero: Não seja apenas alguém que assiste a comunidade. Seja alguém que constrói a comunidade. Deixe-se tocar pelo chamado de Cristo: "Apascenta as minhas ovelhas." (Jo 21,15-17).

Que Nossa Senhora de Fátima nos cubra com seu manto; e São Francisco de Paula nos ajude a sermos caridosos. E que cada fiel batizado seja sinal vivo da ternura de Deus no mundo.`;

  await pool.query(
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
       conteudo = EXCLUDED.conteudo,
       updated_at = now()`,
    [
      'Paróquia Nossa Senhora de Fátima e São Francisco de Paula',
      'Av. João Pessoa, nº 488, Centro - CEP: 19400-065 - Presidente Venceslau (SP)',
      '(18) 3271-3785',
      '(18) 99713-3785',
      'pvparoquiansfatima@hotmail.com',
      'Segunda a sexta-feira: 7h30 às 17h | Sábado: 8h às 12h',
      'paroquia_fatima',
      1931,
      'Pe. Rafael Moreira Campos',
      mensagemPadre,
    ],
  );
  console.log('Informações paroquiais atualizadas.');
}

async function main(): Promise<void> {
  await ensureAdmin();
  await ensureCommunities();
  await ensureParishInfo();
  console.log('Seed concluído.');
  await pool.end();
}

main().catch(async (err: unknown) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});