export const WEEKDAY_LONG = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MONTHS_LONG = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/** Converte 'YYYY-MM-DD' em Date local (meia-noite, sem fuso). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Serializa Date local como 'YYYY-MM-DD'. */
export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** '2026-09-17' -> '17/09/2026' */
export function formatBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Primeiro dia (semana começando no domingo) do grid que contém a data. */
export function gridStart(iso: string): string {
  const dow = parseISO(iso).getDay();
  const date = parseISO(iso);
  date.setDate(date.getDate() - dow);
  return toISO(date);
}

/** 42 dias cobrindo o grid do mês de `iso`. */
export function monthGrid(iso: string): string[] {
  const first = parseISO(iso);
  const start = gridStart(toISO(first));
  const cells: string[] = [];
  const cursor = parseISO(start);
  for (let i = 0; i < 42; i++) {
    cells.push(toISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

export function shiftMonth(iso: string, delta: number): string {
  const date = parseISO(iso);
  date.setDate(1);
  date.setMonth(date.getMonth() + delta);
  return toISO(date);
}

export function monthLabel(iso: string): string {
  const date = parseISO(iso);
  return `${MONTHS_LONG[date.getMonth()]} de ${date.getFullYear()}`;
}

export function weekdayLabel(iso: string): string {
  return WEEKDAY_LONG[parseISO(iso).getDay()];
}

export function humanTime(hora: string | null): string {
  if (!hora) return '';
  return hora.slice(0, 5);
}

export type RecorrenciaLabelOptions = {
  recorrencia: 'nenhuma' | 'semanal' | 'mensal';
  diaSemana: number | null;
  diaMes: number | null;
  semanaMes: number | null;
};

const SEMANA_ORDINAL = ['', '1ª', '2ª', '3ª', '4ª', '5ª'];

export function recorrenciaLabel(opts: RecorrenciaLabelOptions): string {
  if (opts.recorrencia === 'nenhuma') return 'Evento único';
  if (opts.recorrencia === 'semanal') {
    return `Semanal — toda ${WEEKDAY_LONG[opts.diaSemana ?? 0]}`;
  }
  if (opts.semanaMes !== null && opts.semanaMes !== undefined) {
    const ord = SEMANA_ORDINAL[opts.semanaMes] ?? `${opts.semanaMes}ª`;
    return `Mensal — ${ord} ${WEEKDAY_LONG[opts.diaSemana ?? 0]} do mês`;
  }
  return `Mensal — dia ${opts.diaMes ?? 1} de cada mês`;
}