import type { EventViewRow } from '../../db/types.js';
import { occurrencesBetween } from '../../lib/recurrence.js';
import { getEventsByIds, listCancellations } from './repo.js';
import { queryEventsPublic } from './repo-public.js';

export type CategoriaDto = { id: string; nome: string; cor: string } | null;
export type ComunidadeDto = { id: string; nome: string; bairro: string | null } | null;

export type SerieInfo = {
  id: string;
  titulo: string;
  dia: number;
  total: number;
};

export type PublicOccurrence = {
  ocorrenciaId: string;
  eventoId: string;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  local: string | null;
  categoria: CategoriaDto;
  comunidade: ComunidadeDto;
  data: string;
  hora: string | null;
  recorrencia: 'nenhuma' | 'semanal' | 'mensal';
  isRecorrente: boolean;
  status: 'confirmado' | 'cancelado';
  serie: SerieInfo | null;
};

export type EventDTO = {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  local: string | null;
  categoria: CategoriaDto;
  comunidade: ComunidadeDto;
  dataInicio: string;
  hora: string | null;
  dataFim: string | null;
  recorrencia: 'nenhuma' | 'semanal' | 'mensal';
  diaSemana: number | null;
  diaMes: number | null;
  semanaMes: number | null;
  status: 'confirmado' | 'cancelado';
  visibilidade: 'publico' | 'interno';
  eventoPaiId: string | null;
  paiTitulo: string | null;
  criadoPor: { id: string; nome: string } | null;
  atualizadoPor: { id: string; nome: string } | null;
  criadoEm: string;
  atualizadoEm: string;
};

export function categoriaOf(row: EventViewRow): CategoriaDto {
  return row.categoria_id ? { id: row.categoria_id, nome: row.categoria_nome ?? '', cor: row.categoria_cor ?? '#4f46e5' } : null;
}

export function comunidadeOf(row: EventViewRow): ComunidadeDto {
  return row.comunidade_id
    ? { id: row.comunidade_id, nome: row.comunidade_nome ?? '', bairro: row.comunidade_bairro }
    : null;
}

export function toEventDTO(row: EventViewRow): EventDTO {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    responsavel: row.responsavel,
    local: row.local,
    categoria: categoriaOf(row),
    comunidade: comunidadeOf(row),
    dataInicio: row.data_inicio,
    hora: normalizeHora(row.hora),
    dataFim: row.data_fim,
    recorrencia: row.recorrencia,
    diaSemana: row.dia_semana,
    diaMes: row.dia_mes,
    semanaMes: row.semana_mes,
    status: row.status,
    visibilidade: row.visibilidade,
    eventoPaiId: row.evento_pai_id,
    paiTitulo: row.pai_titulo,
    criadoPor: row.criado_por ? { id: row.criado_por, nome: row.criado_por_nome ?? '' } : null,
    atualizadoPor: row.atualizado_por ? { id: row.atualizado_por, nome: row.atualizado_por_nome ?? '' } : null,
    criadoEm: row.created_at.toISOString(),
    atualizadoEm: row.updated_at.toISOString(),
  };
}

function normalizeHora(hora: string | null): string | null {
  if (!hora) return null;
  return hora.length > 5 ? hora.slice(0, 5) : hora;
}

export type PublicRangeInput = {
  from: string;
  to: string;
  comunidadeId?: string;
  categoriaId?: string;
};

export async function buildPublicOccurrences(input: PublicRangeInput): Promise<PublicOccurrence[]> {
  const { rows } = await queryEventsPublic(input);

  const cancellations = await listCancellations(
    rows.map((r) => r.id),
    input.from,
    input.to,
  );
  const cancelledByEvent = new Map<string, Set<string>>();
  for (const c of cancellations) {
    const set = cancelledByEvent.get(c.evento_id) ?? new Set<string>();
    set.add(c.data);
    cancelledByEvent.set(c.evento_id, set);
  }

  const parentIds = [...new Set(rows.map((r) => r.evento_pai_id).filter((id): id is string => id !== null))];
  const parents = parentIds.length > 0 ? await getEventsByIds(parentIds) : [];
  const parentById = new Map(parents.map((p) => [p.id, p]));

  const serieByChild = parentIds.length > 0 ? await buildSerieMap(parentIds) : new Map<string, SerieInfo>();

  const result: PublicOccurrence[] = [];
  for (const row of rows) {
    let dates: string[];
    if (row.recorrencia === 'nenhuma') {
      dates = (row.data_inicio >= input.from && row.data_inicio <= input.to) ? [row.data_inicio] : [];
    } else {
      dates = occurrencesBetween(
        {
          recorrencia: row.recorrencia,
          dataInicio: row.data_inicio,
          dataFim: row.data_fim,
          diaSemana: row.dia_semana,
          diaMes: row.dia_mes,
          semanaMes: row.semana_mes,
        },
        input.from,
        input.to,
      );
    }

    const cancelled = cancelledByEvent.get(row.id);
    for (const data of dates) {
      if (cancelled?.has(data)) continue;

      const serie = row.evento_pai_id ? serieByChild.get(row.id) ?? null : null;
      const parent = row.evento_pai_id ? parentById.get(row.evento_pai_id) : undefined;

      result.push({
        ocorrenciaId: `${row.id}:${data}`,
        eventoId: row.id,
        titulo: row.titulo,
        descricao: row.descricao,
        responsavel: row.responsavel,
        local: row.local,
        categoria: categoriaOf(row),
        comunidade: comunidadeOf(row),
        data,
        hora: normalizeHora(row.hora),
        recorrencia: row.recorrencia,
        isRecorrente: row.recorrencia !== 'nenhuma',
        status: 'confirmado',
        serie: parent ? (serie ?? { id: parent.id, titulo: parent.titulo, dia: 0, total: 0 }) : null,
      });
    }
  }

  result.sort((a, b) => (a.data === b.data ? (a.hora ?? '99:99').localeCompare(b.hora ?? '99:99') : a.data.localeCompare(b.data)));
  return result;
}

async function buildSerieMap(parentIds: string[]): Promise<Map<string, SerieInfo>> {
  const map = new Map<string, SerieInfo>();
  if (parentIds.length === 0) return map;

  const { rows } = await queryChildrenOf(parentIds);
  const grouped = new Map<string, EventViewRow[]>();
  for (const child of rows) {
    if (!child.evento_pai_id) continue;
    grouped.set(child.evento_pai_id, [...(grouped.get(child.evento_pai_id) ?? []), child]);
  }
  for (const [parentId, children] of grouped) {
    children.sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));
    const total = children.length;
    children.forEach((child, idx) => {
      map.set(child.id, { id: parentId, titulo: child.pai_titulo ?? child.titulo, dia: idx + 1, total });
    });
  }
  return map;
}

async function queryChildrenOf(parentIds: string[]): Promise<{ rows: EventViewRow[] }> {
  const { query } = await import('../../db/pool.js');
  const { rows } = await query<EventViewRow>(
    `SELECT
       e.*,
       c.nome AS categoria_nome, c.cor AS categoria_cor,
       cm.nome AS comunidade_nome, cm.bairro AS comunidade_bairro,
       p.titulo AS pai_titulo,
       uc.nome AS criado_por_nome, ua.nome AS atualizado_por_nome
     FROM events e
     LEFT JOIN categories c ON c.id = e.categoria_id
     LEFT JOIN communities cm ON cm.id = e.comunidade_id
     LEFT JOIN events p ON p.id = e.evento_pai_id
     LEFT JOIN users uc ON uc.id = e.criado_por
     LEFT JOIN users ua ON ua.id = e.atualizado_por
     WHERE e.evento_pai_id = ANY($1)`,
    [parentIds],
  );
  return { rows };
}