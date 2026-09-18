import { addDays, parseISODate, toISODate, weekdayOf, nthWeekdayDate, fixedDayDate } from './dates.js';

export const WEEKDAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;

export type RecurrencePattern = {
  recorrencia: 'nenhuma' | 'semanal' | 'mensal';
  dataInicio: string;
  dataFim: string | null;
  diaSemana: number | null; // 0=domingo
  diaMes: number | null; // 1..31
  semanaMes: number | null; // 1..5 (5 = última)
};

/**
 * Computa as datas (YYYY-MM-DD) em que um evento acontece dentro do
 * intervalo [from, to], de acordo com seu padrão de recorrência.
 */
export function occurrencesBetween(pattern: RecurrencePattern, from: string, to: string): string[] {
  const result: string[] = [];
  const start = pattern.dataInicio > from ? pattern.dataInicio : from;
  const end = pattern.dataFim && pattern.dataFim < to ? pattern.dataFim : to;

  if (start > end) return result;

  if (pattern.recorrencia === 'nenhuma') {
    // Sem data_fim: ocorrência única. Com data_fim: multidiário (retiro etc.).
    if (!pattern.dataFim) {
      if (pattern.dataInicio >= start && pattern.dataInicio <= end) {
        result.push(pattern.dataInicio);
      }
      return result;
    }
    let cursor = start;
    while (cursor <= end) {
      if (cursor >= pattern.dataInicio) result.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return result;
  }

  if (pattern.recorrencia === 'semanal') {
    const weekday = pattern.diaSemana;
    if (weekday === null) return result;
    // Alinha a primeira ocorrência ao dia da semana correto.
    let cursor = start;
    while (weekdayOf(cursor) !== weekday) {
      cursor = addDays(cursor, 1);
    }
    for (; cursor <= end; cursor = addDays(cursor, 7)) {
      result.push(cursor);
    }
    return result;
  }

  // mensal
  const startDate = parseISODate(start);
  const endDate = parseISODate(end);
  for (
    let d = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    d <= endDate;
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  ) {
    const candidate =
      pattern.diaMes !== null
        ? fixedDayDate(d.getFullYear(), d.getMonth(), pattern.diaMes)
        : nthWeekdayDate(d.getFullYear(), d.getMonth(), pattern.diaSemana ?? 0, pattern.semanaMes ?? 1);
    if (candidate >= start && candidate <= end) {
      result.push(candidate);
    }
  }
  return result;
}

export function toISODateStr(date: Date): string {
  return toISODate(date);
}