import { z } from 'zod';
import { addDays, toISODate } from '../../lib/dates.js';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD')
  .refine((v) => {
    const date = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(date.getTime());
  }, 'Data inválida');

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Use o formato HH:MM');

export const eventBaseFields = {
  titulo: z.string().trim().min(2, 'Título é obrigatório').max(200),
  descricao: z.string().trim().max(5000).nullable().optional(),
  responsavel: z.string().trim().max(200).nullable().optional(),
  local: z.string().trim().max(300).nullable().optional(),
  categoriaId: z.string().uuid().nullable().optional(),
  comunidadeId: z.string().uuid().nullable().optional(),
  dataInicio: dateString,
  hora: timeString.nullable().optional(),
  dataFim: dateString.nullable().optional(),
  recorrencia: z.enum(['nenhuma', 'semanal', 'mensal']).default('nenhuma'),
  diaSemana: z.number().int().min(0).max(6).nullable().optional(),
  diaMes: z.number().int().min(1).max(31).nullable().optional(),
  semanaMes: z.number().int().min(1).max(5).nullable().optional(),
  status: z.enum(['confirmado', 'cancelado']).default('confirmado'),
  visibilidade: z.enum(['publico', 'interno']).default('publico'),
  eventoPaiId: z.string().uuid().nullable().optional(),
};

export const eventInputSchema = z
  .object(eventBaseFields)
  .superRefine((val, ctx) => {
    if (val.dataFim && val.dataFim < val.dataInicio) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'dataFim deve ser >= dataInicio', path: ['dataFim'] });
    }
    if (val.recorrencia === 'nenhuma') {
      if (val.diaSemana !== undefined && val.diaSemana !== null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'diaSemana não se aplica a eventos sem recorrência', path: ['diaSemana'] });
      }
      if (val.diaMes !== undefined && val.diaMes !== null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'diaMes não se aplica a eventos sem recorrência', path: ['diaMes'] });
      }
      if (val.semanaMes !== undefined && val.semanaMes !== null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'semanaMes não se aplica a eventos sem recorrência', path: ['semanaMes'] });
      }
    }
    if (val.recorrencia === 'semanal' && (val.diaSemana === null || val.diaSemana === undefined)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Recorrência semanal exige diaSemana', path: ['diaSemana'] });
    }
    if (val.recorrencia === 'mensal') {
      const temDiaMes = val.diaMes !== null && val.diaMes !== undefined;
      const temSemanaMes = val.semanaMes !== null && val.semanaMes !== undefined;
      if (!temDiaMes && !temSemanaMes) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Recorrência mensal exige diaMes ou (semanaMes + diaSemana)', path: ['diaMes'] });
      }
      if (temDiaMes && temSemanaMes) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Forneça diaMes OU semanaMes, não ambos', path: ['diaMes'] });
      }
      if (temSemanaMes && (val.diaSemana === null || val.diaSemana === undefined)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mensal por semana exige diaSemana', path: ['diaSemana'] });
      }
    }
  });

export type EventInput = z.infer<typeof eventInputSchema>;

/**
 * Schema de edição (PUT): campos individuais, sem defaults e sem validação
 * cruzada — o merge com o estado atual acontece no repo.
 */
export const eventPatchSchema = z.object({
  titulo: z.string().trim().min(2, 'Título é obrigatório').max(200).optional(),
  descricao: z.string().trim().max(5000).nullable().optional(),
  responsavel: z.string().trim().max(200).nullable().optional(),
  local: z.string().trim().max(300).nullable().optional(),
  categoriaId: z.string().uuid().nullable().optional(),
  comunidadeId: z.string().uuid().nullable().optional(),
  dataInicio: dateString.optional(),
  hora: timeString.nullable().optional(),
  dataFim: dateString.nullable().optional(),
  recorrencia: z.enum(['nenhuma', 'semanal', 'mensal']).optional(),
  diaSemana: z.number().int().min(0).max(6).nullable().optional(),
  diaMes: z.number().int().min(1).max(31).nullable().optional(),
  semanaMes: z.number().int().min(1).max(5).nullable().optional(),
  status: z.enum(['confirmado', 'cancelado']).optional(),
  visibilidade: z.enum(['publico', 'interno']).optional(),
  eventoPaiId: z.string().uuid().nullable().optional(),
});

export type EventPatch = z.infer<typeof eventPatchSchema>;

export const eventQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
  comunidadeId: z.string().uuid().optional(),
  categoriaId: z.string().uuid().optional(),
  status: z.enum(['confirmado', 'cancelado']).optional(),
  visibilidade: z.enum(['publico', 'interno']).optional(),
  q: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export type EventQuery = z.infer<typeof eventQuerySchema>;

export const publicQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
  comunidadeId: z.string().uuid().optional(),
  categoriaId: z.string().uuid().optional(),
});

export function defaultRange(): { from: string; to: string } {
  const today = toISODate(new Date());
  return { from: today.replace(/\d{2}$/, '01'), to: today };
}

export function upcomingRange(days = 45): { from: string; to: string } {
  const today = new Date();
  const from = toISODate(today);
  const to = addDays(from, days);
  return { from, to };
}

export const sequenceCreateSchema = z.object({
  titulo: z.string().trim().min(2, 'Título é obrigatório').max(200),
  descricao: z.string().trim().max(5000).nullable().optional(),
  responsavel: z.string().trim().max(200).nullable().optional(),
  local: z.string().trim().max(300).nullable().optional(),
  categoriaId: z.string().uuid().nullable().optional(),
  comunidadeId: z.string().uuid().nullable().optional(),
  dataInicio: dateString,
  hora: timeString.nullable().optional(),
  intervaloDias: z.number().int().min(1).max(30).default(1),
  dias: z.number().int().min(1).max(60, 'No máximo 60 dias'),
  visibilidade: z.enum(['publico', 'interno']).default('publico'),
});

export type SequenceCreateInput = z.infer<typeof sequenceCreateSchema>;