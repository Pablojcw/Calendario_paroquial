import { query } from '../../db/pool.js';
import type { CancellationRow, EventViewRow } from '../../db/types.js';
import { HttpError } from '../../lib/http-error.js';
import type { EventInput } from './schemas.js';

const VIEW_SELECT = `
  SELECT
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
`;

type ParamsBuilder = { params: unknown[]; conditions: string[] };

function push(container: ParamsBuilder, value: unknown): string {
  container.params.push(value);
  return `$${container.params.length}`;
}

type EventFilters = {
  from?: string;
  to?: string;
  comunidadeId?: string;
  categoriaId?: string;
  status?: 'confirmado' | 'cancelado';
  visibilidade?: 'publico' | 'interno';
  q?: string;
};

/**
 * Monta WHERE considerando sobreposição no intervalo [from, to]:
 * um evento (ou série) aparece se data_inicio <= to E
 * (data_fim IS NULL OU data_fim >= from).
 */
function buildWhere(filters: EventFilters): { clause: string; params: unknown[] } {
  const b: ParamsBuilder = { params: [], conditions: [] };
  const { params, conditions } = b;

  if (filters.from) {
    conditions.push(`(e.data_fim IS NULL OR e.data_fim >= ${push(b, filters.from)})`);
  }
  if (filters.to) {
    conditions.push(`e.data_inicio <= ${push(b, filters.to)}`);
  }
  if (filters.comunidadeId) {
    conditions.push(`e.comunidade_id = ${push(b, filters.comunidadeId)}`);
  }
  if (filters.categoriaId) {
    conditions.push(`e.categoria_id = ${push(b, filters.categoriaId)}`);
  }
  if (filters.status) {
    conditions.push(`e.status = ${push(b, filters.status)}`);
  }
  if (filters.visibilidade) {
    conditions.push(`e.visibilidade = ${push(b, filters.visibilidade)}`);
  }
  if (filters.q) {
    const likeParam = push(b, `%${filters.q}%`);
    conditions.push(
      `(e.titulo ILIKE ${likeParam} OR e.responsavel ILIKE ${likeParam} OR COALESCE(e.local, '') ILIKE ${likeParam})`,
    );
  }
  return { clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

export async function listEvents(
  filters: EventFilters & { limit?: number; offset?: number },
): Promise<EventViewRow[]> {
  const { clause, params } = buildWhere(filters);
  const limit = filters.limit ?? 200;
  const offset = filters.offset ?? 0;
  const { rows } = await query<EventViewRow>(
    `${VIEW_SELECT} ${clause}
     ORDER BY e.data_inicio DESC, e.hora NULLS LAST, e.created_at DESC
     LIMIT ${push({ params, conditions: [] }, limit)} OFFSET ${push({ params, conditions: [] }, offset)}`,
    params,
  );
  return rows;
}

export async function getEvent(id: string): Promise<EventViewRow | null> {
  const { rows } = await query<EventViewRow>(`${VIEW_SELECT} WHERE e.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getEventsByIds(ids: string[]): Promise<EventViewRow[]> {
  if (ids.length === 0) return [];
  const { rows } = await query<EventViewRow>(`${VIEW_SELECT} WHERE e.id = ANY($1)`, [ids]);
  return rows;
}

export async function listChildren(parentId: string): Promise<EventViewRow[]> {
  const { rows } = await query<EventViewRow>(
    `${VIEW_SELECT} WHERE e.evento_pai_id = $1 ORDER BY e.data_inicio, e.created_at`,
    [parentId],
  );
  return rows;
}

async function ensureReferences(input: {
  categoriaId?: string | null;
  comunidadeId?: string | null;
  eventoPaiId?: string | null;
}): Promise<void> {
  if (input.categoriaId) {
    const ok = await query('SELECT 1 FROM categories WHERE id = $1', [input.categoriaId]);
    if (ok.rowCount === 0) throw new HttpError(400, 'Categoria não encontrada.');
  }
  if (input.comunidadeId) {
    const ok = await query('SELECT 1 FROM communities WHERE id = $1', [input.comunidadeId]);
    if (ok.rowCount === 0) throw new HttpError(400, 'Comunidade não encontrada.');
  }
  if (input.eventoPaiId) {
    const ok = await query('SELECT 1 FROM events WHERE id = $1', [input.eventoPaiId]);
    if (ok.rowCount === 0) throw new HttpError(400, 'Evento pai não encontrado.');
  }
}

export async function createEvent(input: EventInput, usuarioId: string): Promise<EventViewRow> {
  await ensureReferences(input);

  const { rows } = await query<EventViewRow>(
    `INSERT INTO events
       (titulo, descricao, responsavel, local, categoria_id, comunidade_id,
        data_inicio, hora, data_fim, recorrencia, dia_semana, dia_mes, semana_mes,
        status, visibilidade, evento_pai_id, criado_por, atualizado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
    [
      input.titulo,
      input.descricao ?? null,
      input.responsavel ?? null,
      input.local ?? null,
      input.categoriaId ?? null,
      input.comunidadeId ?? null,
      input.dataInicio,
      input.hora ?? null,
      input.dataFim ?? null,
      input.recorrencia,
      input.diaSemana ?? null,
      input.diaMes ?? null,
      input.semanaMes ?? null,
      input.status,
      input.visibilidade,
      input.eventoPaiId ?? null,
      usuarioId,
      usuarioId,
    ],
  );

  const row = rows[0];
  if (!row) throw new Error('Falha ao criar evento.');
  return row;
}

export async function updateEvent(
  id: string,
  patch: Partial<EventInput>,
  usuarioId: string,
): Promise<{ before: EventViewRow; after: EventViewRow }> {
  const current = await getEvent(id);
  if (!current) throw new HttpError(404, 'Evento não encontrado.');
  await ensureReferences(patch);

  const merged: EventInput = {
    titulo: patch.titulo ?? current.titulo,
    descricao: 'descricao' in patch ? (patch.descricao ?? null) : current.descricao,
    responsavel: 'responsavel' in patch ? (patch.responsavel ?? null) : current.responsavel,
    local: 'local' in patch ? (patch.local ?? null) : current.local,
    categoriaId: 'categoriaId' in patch ? (patch.categoriaId ?? null) : current.categoria_id,
    comunidadeId: 'comunidadeId' in patch ? (patch.comunidadeId ?? null) : current.comunidade_id,
    dataInicio: patch.dataInicio ?? current.data_inicio,
    hora: 'hora' in patch ? (patch.hora ?? null) : current.hora,
    dataFim: 'dataFim' in patch ? (patch.dataFim ?? null) : current.data_fim,
    recorrencia: patch.recorrencia ?? current.recorrencia,
    diaSemana: 'diaSemana' in patch ? (patch.diaSemana ?? null) : current.dia_semana,
    diaMes: 'diaMes' in patch ? (patch.diaMes ?? null) : current.dia_mes,
    semanaMes: 'semanaMes' in patch ? (patch.semanaMes ?? null) : current.semana_mes,
    status: patch.status ?? current.status,
    visibilidade: patch.visibilidade ?? current.visibilidade,
    eventoPaiId: 'eventoPaiId' in patch ? (patch.eventoPaiId ?? null) : current.evento_pai_id,
  };

  const { rows } = await query<EventViewRow>(
    `UPDATE events SET
       titulo=$1, descricao=$2, responsavel=$3, local=$4, categoria_id=$5, comunidade_id=$6,
       data_inicio=$7, hora=$8, data_fim=$9, recorrencia=$10, dia_semana=$11, dia_mes=$12, semana_mes=$13,
       status=$14, visibilidade=$15, evento_pai_id=$16, atualizado_por=$17, updated_at=now()
     WHERE id = $18
     RETURNING *`,
    [
      merged.titulo,
      merged.descricao,
      merged.responsavel,
      merged.local,
      merged.categoriaId,
      merged.comunidadeId,
      merged.dataInicio,
      merged.hora,
      merged.dataFim,
      merged.recorrencia,
      merged.diaSemana,
      merged.diaMes,
      merged.semanaMes,
      merged.status,
      merged.visibilidade,
      merged.eventoPaiId,
      usuarioId,
      id,
    ],
  );
  const after = rows[0];
  if (!after) throw new HttpError(404, 'Evento não encontrado.');
  return { before: current, after };
}

export async function setStatus(
  id: string,
  status: 'confirmado' | 'cancelado',
  usuarioId: string,
): Promise<EventViewRow> {
  const { rows } = await query<EventViewRow>(
    `UPDATE events SET status = $1, atualizado_por = $2, updated_at = now() WHERE id = $3 RETURNING *`,
    [status, usuarioId, id],
  );
  const row = rows[0];
  if (!row) throw new HttpError(404, 'Evento não encontrado.');
  return row;
}

export async function deleteEvent(id: string): Promise<void> {
  const { rowCount } = await query('DELETE FROM events WHERE id = $1 OR evento_pai_id = $1', [id]);
  if (!rowCount || rowCount === 0) throw new HttpError(404, 'Evento não encontrado.');
}

// ------------------------------------------------------------------
// Cancelamento de ocorrências específicas
// ------------------------------------------------------------------
export async function listCancellations(
  eventoIds: string[],
  from?: string,
  to?: string,
): Promise<CancellationRow[]> {
  if (eventoIds.length === 0) return [];
  const b: ParamsBuilder = { params: [eventoIds], conditions: [] };
  const { params, conditions } = b;
  conditions.push(`evento_id = ANY($1)`);
  if (from) conditions.push(`data >= ${push(b, from)}`);
  if (to) conditions.push(`data <= ${push(b, to)}`);
  const { rows } = await query<CancellationRow>(
    `SELECT * FROM event_occurrence_cancellations WHERE ${conditions.join(' AND ')}`,
    params,
  );
  return rows;
}

export async function insertCancellation(
  eventoId: string,
  data: string,
  motivo: string | null,
  usuarioId: string,
): Promise<void> {
  await query(
    `INSERT INTO event_occurrence_cancellations (evento_id, data, motivo, criado_por)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (evento_id, data) DO UPDATE SET motivo = EXCLUDED.motivo`,
    [eventoId, data, motivo, usuarioId],
  );
}

export async function deleteCancellation(eventoId: string, data: string): Promise<boolean> {
  const { rowCount } = await query(
    `DELETE FROM event_occurrence_cancellations WHERE evento_id = $1 AND data = $2`,
    [eventoId, data],
  );
  return (rowCount ?? 0) > 0;
}