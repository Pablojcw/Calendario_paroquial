import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../db/pool.js';
import type { ParishInfoRow } from '../../db/types.js';

const institutionSchema = z.object({
  nome: z.string().trim().min(2).max(200).optional(),
  endereco: z.string().trim().max(300).nullable().optional(),
  telefone: z.string().trim().max(60).nullable().optional(),
  whatsapp: z.string().trim().max(60).nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  expediente: z.string().trim().max(300).nullable().optional(),
  instagram: z.string().trim().max(120).nullable().optional(),
  ano_fundacao: z.number().int().min(1000).max(2100).nullable().optional(),
  administrador_paroquial: z.string().trim().max(200).nullable().optional(),
  conteudo: z.string().trim().max(10000).nullable().optional(),
});

function serialize(row: ParishInfoRow) {
  return {
    nome: row.nome,
    endereco: row.endereco,
    telefone: row.telefone,
    whatsapp: row.whatsapp,
    email: row.email,
    expediente: row.expediente,
    instagram: row.instagram,
    ano_fundacao: row.ano_fundacao,
    administrador_paroquial: row.administrador_paroquial,
    conteudo: row.conteudo,
  };
}

export function registerInstitutionRoutes(app: FastifyInstance): void {
  app.get('/api/institution', async () => {
    const { rows } = await query<ParishInfoRow>('SELECT * FROM parish_info WHERE id = 1');
    const row = rows[0];
    if (!row) throw new Error('Página institucional não configurada. Rode o schema.');
    return serialize(row);
  });

  app.put('/api/institution', { preHandler: [app.authenticate] }, async (request, reply) => {
    const input = institutionSchema.parse(request.body);
    const { rows } = await query<ParishInfoRow>(
      `UPDATE parish_info SET
         nome = COALESCE($1, nome),
         endereco = CASE WHEN $2::boolean THEN $3 ELSE endereco END,
         telefone = CASE WHEN $4::boolean THEN $5 ELSE telefone END,
         whatsapp = CASE WHEN $6::boolean THEN $7 ELSE whatsapp END,
         email = CASE WHEN $8::boolean THEN $9 ELSE email END,
         expediente = CASE WHEN $10::boolean THEN $11 ELSE expediente END,
         instagram = CASE WHEN $12::boolean THEN $13 ELSE instagram END,
         ano_fundacao = CASE WHEN $14::boolean THEN $15 ELSE ano_fundacao END,
         administrador_paroquial = CASE WHEN $16::boolean THEN $17 ELSE administrador_paroquial END,
         conteudo = CASE WHEN $18::boolean THEN $19 ELSE conteudo END,
         updated_at = now()
       WHERE id = 1 RETURNING *`,
      [
        input.nome ?? null,
        'endereco' in input,
        input.endereco ?? null,
        'telefone' in input,
        input.telefone ?? null,
        'whatsapp' in input,
        input.whatsapp ?? null,
        'email' in input,
        input.email ?? null,
        'expediente' in input,
        input.expediente ?? null,
        'instagram' in input,
        input.instagram ?? null,
        'ano_fundacao' in input,
        input.ano_fundacao ?? null,
        'administrador_paroquial' in input,
        input.administrador_paroquial ?? null,
        'conteudo' in input,
        input.conteudo ?? null,
      ],
    );
    const row = rows[0];
    if (!row) throw new Error('Página institucional não encontrada.');
    return reply.send(serialize(row));
  });
}