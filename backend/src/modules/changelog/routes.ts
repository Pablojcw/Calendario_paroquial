import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../../db/pool.js';
import type { ChangeLogRow } from '../../db/types.js';

const changelogQuery = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
  eventoId: z.string().uuid().optional(),
});

export function registerChangelogRoutes(app: FastifyInstance): void {
  app.get('/api/changelog', { preHandler: [app.authenticate] }, async (request) => {
    const params = changelogQuery.parse(request.query);
    const conditions: string[] = [];
    const values: unknown[] = [];

    const push = (value: unknown): string => {
      values.push(value);
      return `$${values.length}`;
    };

    if (params.eventoId) {
      conditions.push(`(cl.evento_id = ${push(params.eventoId)} OR cl.serie_id = ${push(params.eventoId)})`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(params.limit, params.offset);

    const { rows } = await query<(ChangeLogRow & { usuario_nome: string | null }) & { evento_titulo: string | null }>(
      `SELECT cl.*, u.nome AS usuario_nome, e.titulo AS evento_titulo
       FROM change_log cl
       LEFT JOIN users u  ON u.id  = cl.usuario_id
       LEFT JOIN events e ON e.id  = COALESCE(cl.evento_id, cl.serie_id)
       ${where}
       ORDER BY cl.criado_em DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );

    const actionsLabels: Record<string, string> = {
      create: 'Criação',
      update: 'Edição',
      cancel: 'Cancelamento',
      reinstate: 'Reativação',
      delete: 'Exclusão',
      occurrence_cancel: 'Cancelamento de ocorrência',
      occurrence_reinstate: 'Reativação de ocorrência',
      sequence_create: 'Criação de sequência',
    };

    return rows.map((r) => ({
      id: r.id,
      eventoId: r.evento_id,
      serieId: r.serie_id,
      eventoTitulo: r.evento_titulo,
      acao: r.acao,
      acaoLabel: actionsLabels[r.acao] ?? r.acao,
      observacao: r.observacao,
      camposAlterados: r.campos_alterados,
      usuario: r.usuario_id ? { id: r.usuario_id, nome: r.usuario_nome ?? '—' } : null,
      criadoEm: r.criado_em.toISOString(),
    }));
  });
}