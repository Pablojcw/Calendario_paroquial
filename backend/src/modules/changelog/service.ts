import { query } from '../../db/pool.js';

export type LogAction =
  | 'create'
  | 'update'
  | 'cancel'
  | 'reinstate'
  | 'delete'
  | 'occurrence_cancel'
  | 'occurrence_reinstate'
  | 'sequence_create';

export async function logChange(input: {
  eventoId?: string;
  serieId?: string;
  usuarioId?: string | null;
  acao: LogAction;
  camposAlterados?: Record<string, unknown>;
  observacao?: string;
}): Promise<void> {
  await query(
    `INSERT INTO change_log (evento_id, serie_id, usuario_id, acao, campos_alterados, observacao)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.eventoId ?? null,
      input.serieId ?? null,
      input.usuarioId ?? null,
      input.acao,
      input.camposAlterados ? JSON.stringify(input.camposAlterados) : null,
      input.observacao ?? null,
    ],
  );
}