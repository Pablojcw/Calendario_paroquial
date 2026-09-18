import { query } from '../../db/pool.js';
import type { EventViewRow } from '../../db/types.js';

export type PublicRangeInput = {
  from: string;
  to: string;
  comunidadeId?: string;
  categoriaId?: string;
};

export async function queryEventsPublic(input: PublicRangeInput): Promise<{ rows: EventViewRow[] }> {
  const params: unknown[] = [];
  const conditions: string[] = [];

  const push = (value: unknown): string => {
    params.push(value);
    return `$${params.length}`;
  };

  conditions.push(`e.visibilidade = ${push('publico')}`);
  conditions.push(`e.status = ${push('confirmado')}`);
  conditions.push(`e.data_inicio <= ${push(input.to)}`);
  conditions.push(`(e.data_fim IS NULL OR e.data_fim >= ${push(input.from)})`);
  conditions.push(`NOT EXISTS (SELECT 1 FROM events filho WHERE filho.evento_pai_id = e.id)`);

  if (input.comunidadeId) {
    conditions.push(`(e.comunidade_id = ${push(input.comunidadeId)} OR e.comunidade_id IS NULL)`);
  }
  if (input.categoriaId) {
    conditions.push(`e.categoria_id = ${push(input.categoriaId)}`);
  }

  const { rows } = await query<EventViewRow>(
    `SELECT
       e.*,
       c.nome        AS categoria_nome,
       c.cor         AS categoria_cor,
       cm.nome       AS comunidade_nome,
       cm.bairro     AS comunidade_bairro,
       p.titulo      AS pai_titulo,
       uc.nome       AS criado_por_nome,
       ua.nome       AS atualizado_por_nome
     FROM events e
     LEFT JOIN categories c  ON c.id  = e.categoria_id
     LEFT JOIN communities cm ON cm.id = e.comunidade_id
     LEFT JOIN events p      ON p.id  = e.evento_pai_id
     LEFT JOIN users uc      ON uc.id = e.criado_por
     LEFT JOIN users ua      ON ua.id = e.atualizado_por
     WHERE ${conditions.join(' AND ')}
     ORDER BY e.data_inicio`,
    params,
  );
  return { rows };
}