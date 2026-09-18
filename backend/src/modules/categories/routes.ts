import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../db/pool.js';
import type { CategoryRow } from '../../db/types.js';
import { HttpError } from '../../lib/http-error.js';

const categorySchema = z.object({
  nome: z.string().trim().min(2).max(200),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser hex, ex.: #4f46e5'),
  ordem: z.number().int().min(0).max(9999).optional(),
});

function serialize(row: CategoryRow) {
  return { id: row.id, nome: row.nome, cor: row.cor, ordem: row.ordem };
}

export function registerCategoryRoutes(app: FastifyInstance): void {
  app.get('/api/categories', async () => {
    const { rows } = await query<CategoryRow>('SELECT * FROM categories ORDER BY ordem, nome');
    return rows.map(serialize);
  });

  app.post('/api/categories', { preHandler: [app.authenticate] }, async (request, reply) => {
    const input = categorySchema.parse(request.body);
    try {
      const { rows } = await query<CategoryRow>(
        `INSERT INTO categories (nome, cor, ordem) VALUES ($1, $2, $3) RETURNING *`,
        [input.nome, input.cor, input.ordem ?? 0],
      );
      const row = rows[0];
      if (!row) throw new HttpError(500, 'Categoria não foi criada.');
      return await reply.code(201).send(serialize(row));
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new HttpError(409, 'Já existe uma categoria com este nome.');
      }
      throw err;
    }
  });

  app.put('/api/categories/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = categorySchema.partial().parse(request.body);
    const { rows } = await query<CategoryRow>(
      `UPDATE categories SET
         nome = COALESCE($1, nome),
         cor = COALESCE($2, cor),
         ordem = COALESCE($3, ordem)
       WHERE id = $4 RETURNING *`,
      [input.nome ?? null, input.cor ?? null, input.ordem ?? null, id],
    );
    const row = rows[0];
    if (!row) throw new HttpError(404, 'Categoria não encontrada.');
    return reply.send(serialize(row));
  });

  app.delete('/api/categories/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { rowCount } = await query('DELETE FROM categories WHERE id = $1', [id]);
    if (!rowCount || rowCount === 0) throw new HttpError(404, 'Categoria não encontrada.');
    return reply.code(204).send();
  });
}