import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { HttpError } from '../../lib/http-error.js';
import { logChange } from '../changelog/service.js';
import type { ChangeLogRow, EventViewRow } from '../../db/types.js';
import { query } from '../../db/pool.js';
import {
  createEvent,
  deleteCancellation,
  deleteEvent,
  getEvent,
  insertCancellation,
  listCancellations,
  listChildren,
  listEvents,
  setStatus,
  updateEvent,
} from './repo.js';
import { buildPublicOccurrences, toEventDTO } from './dto.js';
import { eventInputSchema, eventPatchSchema, eventQuerySchema, publicQuerySchema, defaultRange, upcomingRange } from './schemas.js';
import { occurrencesBetween } from '../../lib/recurrence.js';

const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function diffRows(before: EventViewRow, after: EventViewRow): Record<string, unknown> {
  const fields: [keyof EventViewRow, keyof EventViewRow, string][] = [
    ['titulo', 'titulo', 'Título'],
    ['descricao', 'descricao', 'Descrição'],
    ['responsavel', 'responsavel', 'Responsável'],
    ['local', 'local', 'Local'],
    ['categoria_id', 'categoria_id', 'Categoria'],
    ['comunidade_id', 'comunidade_id', 'Comunidade'],
    ['data_inicio', 'data_inicio', 'Data'],
    ['hora', 'hora', 'Hora'],
    ['data_fim', 'data_fim', 'Data final'],
    ['recorrencia', 'recorrencia', 'Recorrência'],
    ['dia_semana', 'dia_semana', 'Dia da semana'],
    ['dia_mes', 'dia_mes', 'Dia do mês'],
    ['semana_mes', 'semana_mes', 'Semana do mês'],
    ['status', 'status', 'Status'],
    ['visibilidade', 'visibilidade', 'Visibilidade'],
  ];
  const diff: Record<string, unknown> = {};
  for (const [bKey, aKey, label] of fields) {
    const b = before[bKey];
    const a = after[aKey];
    if (String(b ?? '') !== String(a ?? '')) {
      diff[label] = { de: b ?? null, para: a ?? null };
    }
  }
  return diff;
}

export function registerEventRoutes(app: FastifyInstance): void {
  app.get('/api/events/public', async (request) => {
    const raw = request.query as Record<string, string>;
    const parsed = publicQuerySchema.safeParse(raw);
    const { from, to } = defaultRange();
    const { from: f, to: t } = parsed.success
      ? { from: parsed.data.from ?? from, to: parsed.data.to ?? to }
      : { from, to };
    if (parsed.success && f && t && f > t) {
      throw new HttpError(400, 'Intervalo inválido: from deve ser <= to.');
    }
    return buildPublicOccurrences({
      from: parsed.success && f ? f : from,
      to: parsed.success && t ? t : to,
      comunidadeId: parsed.success ? parsed.data.comunidadeId : undefined,
      categoriaId: parsed.success ? parsed.data.categoriaId : undefined,
    });
  });

  app.get('/api/events/public/proximos', async (request) => {
    const raw = request.query as Record<string, string>;
    const limit = Math.min(Math.max(Number(raw.limit) || 20, 1), 100);
    const { from, to } = upcomingRange(60);
    const ocorrencias = await buildPublicOccurrences({
      from,
      to,
      comunidadeId: raw.comunidadeId,
      categoriaId: raw.categoriaId,
    });
    return ocorrencias.filter((o) => o.data >= from).slice(0, limit);
  });

  app.get('/api/events/public/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = await getEvent(id);
    if (!event) throw new HttpError(404, 'Evento não encontrado.');
    if (event.visibilidade !== 'publico' || event.status !== 'confirmado') {
      throw new HttpError(404, 'Evento não encontrado.');
    }
    const raw = request.query as Record<string, string>;
    const { from, to } = defaultRange();
    const fromIso = raw.from && !Number.isNaN(Date.parse(`${raw.from}T00:00:00Z`)) ? raw.from : from;
    const toIso = raw.to && !Number.isNaN(Date.parse(`${raw.to}T00:00:00Z`)) ? raw.to : to;
    const dates = occurrencesBetween(
      {
        recorrencia: event.recorrencia,
        dataInicio: event.data_inicio,
        dataFim: event.data_fim,
        diaSemana: event.dia_semana,
        diaMes: event.dia_mes,
        semanaMes: event.semana_mes,
      },
      fromIso,
      toIso,
    );
    const cancellations = await listCancellations([event.id], fromIso, toIso);
    const cancelled = new Set(cancellations.map((c) => c.data));
    reply.send({ event: toEventDTO(event), datas: dates.filter((d) => !cancelled.has(d)) });
  });

  app.get('/api/events', { preHandler: [app.authenticate] }, async (request) => {
    const params = eventQuerySchema.parse(request.query);
    const rows = await listEvents({
      from: params.from,
      to: params.to,
      comunidadeId: params.comunidadeId,
      categoriaId: params.categoriaId,
      status: params.status,
      visibilidade: params.visibilidade,
      q: params.q,
      limit: params.limit,
      offset: params.offset,
    });
    return rows.map(toEventDTO);
  });

  app.get('/api/events/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = await getEvent(id);
    if (!event) throw new HttpError(404, 'Evento não encontrado.');

    const children = event.evento_pai_id === null ? await listChildren(id) : [];
    const pai = event.evento_pai_id ? await getEvent(event.evento_pai_id) : null;

    reply.send({
      ...toEventDTO(event),
      filhos: children.map(toEventDTO),
      pai: pai ? toEventDTO(pai) : null,
    });
  });

  app.post('/api/events', { preHandler: [app.authenticate] }, async (request, reply) => {
    const input = eventInputSchema.parse(request.body);
    const row = await createEvent(input, request.userPrincipal.sub);
    await logChange({
      eventoId: row.id,
      usuarioId: request.userPrincipal.sub,
      acao: 'create',
      observacao: `"${row.titulo}" criado`,
    });
    return reply.code(201).send(toEventDTO(row));
  });

  app.put('/api/events/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const patch = eventPatchSchema.parse(request.body);
    const { before, after } = await updateEvent(id, patch, request.userPrincipal.sub);
    const diff = diffRows(before, after);
    await logChange({
      eventoId: after.id,
      usuarioId: request.userPrincipal.sub,
      acao: 'update',
      camposAlterados: diff,
    });
    return reply.send(toEventDTO(after));
  });

  app.delete('/api/events/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = await getEvent(id);
    if (!event) throw new HttpError(404, 'Evento não encontrado.');
    await deleteEvent(id);
    await logChange({
      eventoId: id,
      serieId: event.evento_pai_id ?? undefined,
      usuarioId: request.userPrincipal.sub,
      acao: 'delete',
      observacao: `"${event.titulo}" excluído`,
    });
    return reply.code(204).send();
  });

  app.post('/api/events/:id/cancel', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = await setStatus(id, 'cancelado', request.userPrincipal.sub);
    await logChange({
      eventoId: event.id,
      usuarioId: request.userPrincipal.sub,
      acao: 'cancel',
      observacao: `"${event.titulo}" cancelado`,
    });
    return reply.send(toEventDTO(event));
  });

  app.post('/api/events/:id/reinstate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = await setStatus(id, 'confirmado', request.userPrincipal.sub);
    await logChange({
      eventoId: event.id,
      usuarioId: request.userPrincipal.sub,
      acao: 'reinstate',
      observacao: `"${event.titulo}" reativado`,
    });
    return reply.send(toEventDTO(event));
  });

  app.post(
    '/api/events/:id/occurrences/:data/cancel',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id, data } = request.params as { id: string; data: string };
      dateParamSchema.parse(data);
      const event = await getEvent(id);
      if (!event) throw new HttpError(404, 'Evento não encontrado.');
      const body = (request.body ?? {}) as { motivo?: string };
      await insertCancellation(id, data, body.motivo ?? null, request.userPrincipal.sub);
      await logChange({
        eventoId: id,
        usuarioId: request.userPrincipal.sub,
        acao: 'occurrence_cancel',
        observacao: `Ocorrência de ${data} cancelada`,
      });
      return reply.send({ ok: true, data });
    },
  );

  app.post(
    '/api/events/:id/occurrences/:data/reinstate',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id, data } = request.params as { id: string; data: string };
      dateParamSchema.parse(data);
      const event = await getEvent(id);
      if (!event) throw new HttpError(404, 'Evento não encontrado.');
      const removed = await deleteCancellation(id, data);
      await logChange({
        eventoId: id,
        usuarioId: request.userPrincipal.sub,
        acao: 'occurrence_reinstate',
        observacao: `Ocorrência de ${data} reativada`,
      });
      return reply.send({ ok: removed, data });
    },
  );

  app.get('/api/events/:id/history', { preHandler: [app.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const event = await getEvent(id);
    if (!event) throw new HttpError(404, 'Evento não encontrado.');
    const { rows } = await query<ChangeLogRow>(
      `SELECT cl.*, u.nome AS usuario_nome
       FROM change_log cl
       LEFT JOIN users u ON u.id = cl.usuario_id
       WHERE cl.evento_id = $1 OR cl.serie_id = $1
       ORDER BY cl.criado_em DESC`,
      [id],
    );
    return rows.map((r) => {
      const usuarioNome = (r as ChangeLogRow & { usuario_nome: string | null }).usuario_nome;
      return {
        id: r.id,
        acao: r.acao,
        observacao: r.observacao,
        camposAlterados: r.campos_alterados,
        usuario: r.usuario_id ? { id: r.usuario_id, nome: usuarioNome ?? '—' } : null,
        criadoEm: r.criado_em.toISOString(),
      };
    });
  });
}