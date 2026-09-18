import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../db/pool.js';
import type { CommunityRow } from '../../db/types.js';
import { HttpError } from '../../lib/http-error.js';

const communitySchema = z.object({
  nome: z.string().trim().min(2).max(200),
  endereco: z.string().trim().max(300).nullable().optional(),
  bairro: z.string().trim().max(120).nullable().optional(),
  ordem: z.number().int().min(0).max(9999).optional(),
});

function serialize(row: CommunityRow) {
  return {
    id: row.id,
    nome: row.nome,
    endereco: row.endereco,
    bairro: row.bairro,
    ordem: row.ordem,
    ativa: row.ativa,
  };
}

export function registerCommunityRoutes(app: FastifyInstance): void {
  app.get('/api/communities', async () => {
    const { rows } = await query<CommunityRow>(
      `SELECT * FROM communities WHERE ativa = true ORDER BY ordem, nome`,
    );
    return rows.map(serialize);
  });

  app.post('/api/communities', { preHandler: [app.authenticate] }, async (request, reply) => {
    const input = communitySchema.parse(request.body);
    try {
      const { rows } = await query<CommunityRow>(
        `INSERT INTO communities (nome, endereco, bairro, ordem)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [input.nome, input.endereco ?? null, input.bairro ?? null, input.ordem ?? 0],
      );
      const row = rows[0];
      if (!row) throw new Error('Falha ao criar comunidade.');
      return reply.code(201).send(serialize(row));
    } catch (err) {
      if (isUniqueViolation(err)) throw new HttpError(409, 'Já existe uma comunidade com este nome.');
      throw err;
    }
  });

  app.put('/api/communities/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = communitySchema.partial().parse(request.body);
    const { rows } = await query<CommunityRow>(
      `UPDATE communities SET
         nome = COALESCE($1, nome),
         endereco = CASE WHEN $2::boolean THEN $3 ELSE endereco END,
         bairro = CASE WHEN $4::boolean THEN $5 ELSE bairro END,
         ordem = COALESCE($6, ordem)
       WHERE id = $7
       RETURNING *`,
      [
        input.nome ?? null,
        'endereco' in input,
        input.endereco ?? null,
        'bairro' in input,
        input.bairro ?? null,
        input.ordem ?? null,
        id,
      ],
    );
    const row = rows[0];
    if (!row) throw new HttpError(404, 'Comunidade não encontrada.');
    return reply.send(serialize(row));
  });

  app.delete('/api/communities/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { rowCount } = await query('DELETE FROM communities WHERE id = $1', [id]);
    if (!rowCount || rowCount === 0) throw new HttpError(404, 'Comunidade não encontrada.');
    return reply.code(204).send();
  });
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === '23505';
}