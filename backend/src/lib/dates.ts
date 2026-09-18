/**
 * Helpers de data para o calendário.
 *
 * Trabalhamos com datas locais (meia-noite) e serializamos como
 * 'YYYY-MM-DD'. Comparações lexicográficas de string ISO são seguras,
 * então data_fim >= data_inicio funciona com string.
 */

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) throw new Error(`Data inválida: ${iso}`);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Dia da semana (0=domingo ... 6=sábado) — compatível com o CHECK do schema. */
export function weekdayOf(iso: string): number {
  const dow = parseISODate(iso).getDay();
  return dow;
}

/** Acrescenta n dias e retorna ISO (aceita n negativo). */
export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function lastDayOfMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

export function startOfMonth(iso: string): string {
  const [y = 0, m = 0] = iso.split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-01`;
}

export function endOfMonth(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  if (!y || !m) throw new Error(`Data inválida: ${iso}`);
  const last = lastDayOfMonth(y, m - 1);
  return `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
}

export function startOfWeek(iso: string): string {
  const dow = weekdayOf(iso);
  return addDays(iso, -dow);
}

export function endOfWeek(iso: string): string {
  const dow = weekdayOf(iso);
  return addDays(iso, 6 - dow);
}

/**
 * Enésima ocorrência de um dia da semana num mês.
 * nth=5 significa "a última" ocorrência daquele dia no mês.
 */
export function nthWeekdayDate(year: number, month0: number, weekday: number, nth: number): string {
  const first = new Date(year, month0, 1).getDay();
  let day = 1 + ((weekday - first + 7) % 7); // primeira ocorrência
  day += (nth - 1) * 7;

  if (nth >= 5) {
    const last = new Date(year, month0 + 1, 0);
    const lastDate = last.getDate();
    const lastWeekday = last.getDay();
    const lastOccurrence = lastDate - ((lastWeekday - weekday + 7) % 7);
    // Se pediu a 5ª mas só existem 4, usa a última.
    day = Math.min(day, lastOccurrence);
  }

  return `${year}-${String(month0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Data do dia `diaMes` no mês, ajustada para o último dia quando o mês
 * é mais curto (ex.: dia 31 cai para 30/28 no mês que não tem 31).
 */
export function fixedDayDate(year: number, month0: number, diaMes: number): string {
  const last = lastDayOfMonth(year, month0);
  const day = Math.min(diaMes, last);
  return `${year}-${String(month0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}