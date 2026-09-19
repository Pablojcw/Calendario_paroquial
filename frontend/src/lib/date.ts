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

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function monthGrid(iso: string): string[] {
  const date = parseISO(iso);
  const year = date.getFullYear();
  const month = date.getMonth();

  // 1º dia do mês
  const first = new Date(year, month, 1);
  const firstDow = first.getDay(); // 0 = Domingo, 1 = Segunda, etc.

  // Começar no Domingo da semana do dia 1
  const cursor = new Date(year, month, 1 - firstDow);

  // Último dia do mês
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();

  // Total de células necessárias para cobrir todas as semanas do mês (múltiplo de 7)
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  const cells: string[] = [];
  for (let i = 0; i < totalCells; i++) {
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

export function formatHorario(hora: string | null | undefined): string {
  if (!hora) return '';
  const clean = hora.trim().slice(0, 5);
  const [h, m] = clean.split(':');
  if (!h) return clean;
  const hourNum = parseInt(h, 10);
  if (m === '00' || !m) return `${hourNum}h`;
  return `${hourNum}h${m}`;
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