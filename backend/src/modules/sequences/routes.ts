import type { FastifyInstance } from 'fastify';
import { pool } from '../../db/pool.js';
import type { EventViewRow } from '../../db/types.js';
import { HttpError } from '../../lib/http-error.js';
import { addDays } from '../../lib/dates.js';
import { logChange } from '../changelog/service.js';
import { toEventDTO } from '../events/dto.js';
import { sequenceCreateSchema } from '../events/schemas.js';

export function registerSequenceRoutes(app: FastifyInstance): void {
  app.post('/api/sequences', { preHandler: [app.authenticate] }, async (request, reply) => {
    const input = sequenceCreateSchema.parse(request.body);
    const usuarioId = request.userPrincipal.sub;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (input.categoriaId) {
        const ok = await client.query('SELECT 1 FROM categories WHERE id = $1', [input.categoriaId]);
        if (ok.rowCount === 0) throw new HttpError(400, 'Categoria não encontrada.');
      }
      if (input.comunidadeId) {
        const ok = await client.query('SELECT 1 FROM communities WHERE id = $1', [input.comunidadeId]);
        if (ok.rowCount === 0) throw new HttpError(400, 'Comunidade não encontrada.');
      }

      const insertEvent = async (dataInicio: string, eventoPaiId: string | null): Promise<EventViewRow> => {
        const { rows } = await client.query<EventViewRow>(
          `INSERT INTO events
             (titulo, descricao, responsavel, local, categoria_id, comunidade_id,
              data_inicio, hora, recorrencia, visibilidade, evento_pai_id, criado_por, atualizado_por)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'nenhuma',$9,$10,$11,$11)
           RETURNING *`,
          [
            input.titulo,
            input.descricao ?? null,
            input.responsavel ?? null,
            input.local ?? null,
            input.categoriaId ?? null,
            input.comunidadeId ?? null,
            dataInicio,
            input.hora ?? null,
            input.visibilidade,
            eventoPaiId,
            usuarioId,
          ],
        );
        const row = rows[0];
        if (!row) throw new Error('Falha ao criar evento da sequência.');
        return row;
      };

      const parent = await insertEvent(input.dataInicio, null);

      const filhos: EventViewRow[] = [];
      let data = input.dataInicio;
      for (let i = 1; i < input.dias; i++) {
        if (input.intervaloDias > 1) {
          data = addDays(data, input.intervaloDias);
        } else {
          data = addDays(input.dataInicio, i);
        }
        filhos.push(await insertEvent(data, parent.id));
      }

      await client.query('COMMIT');

      await logChange({
        serieId: parent.id,
        usuarioId,
        acao: 'sequence_create',
        observacao: `${input.titulo}: sequência de ${input.dias} dia(s) criada`,
      });

      return reply.code(201).send({
        ...toEventDTO(parent),
        filhos: filhos.map(toEventDTO),
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });
}