import { describe, expect, it } from 'vitest';
import { occurrencesBetween } from '../src/lib/recurrence.js';
import { addDays, endOfMonth, nthWeekdayDate, startOfMonth, weekdayOf } from '../src/lib/dates.js';

describe('dates', () => {
  it('endOfMonth respeita meses curtos', () => {
    expect(endOfMonth('2026-02-10')).toBe('2026-02-28');
    expect(endOfMonth('2028-02-10')).toBe('2028-02-29');
    expect(endOfMonth('2026-11-01')).toBe('2026-11-30');
  });

  it('startOfMonth', () => {
    expect(startOfMonth('2026-02-10')).toBe('2026-02-01');
  });

  it('addDays aceita valores negativos', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('weekdayOf segue 0=domingo', () => {
    // 2026-01-01 é quinta-feira
    expect(weekdayOf('2026-01-01')).toBe(4);
    expect(weekdayOf('2026-01-04')).toBe(0); // domingo
  });

  it('nthWeekdayDate: 2º domingo de fevereiro/2026', () => {
    expect(nthWeekdayDate(2026, 1, 0, 2)).toBe('2026-02-08');
  });

  it('nthWeekdayDate: último domingo quando o 5º não existe', () => {
    expect(nthWeekdayDate(2026, 1, 0, 5)).toBe('2026-02-22'); // fev/2026 tem 4 domingos
  });
});

describe('occurrencesBetween', () => {
  const base = {
    recorrencia: 'nenhuma' as const,
    dataFim: null,
    diaSemana: null,
    diaMes: null,
    semanaMes: null,
  };

  it('evento único (nenhuma)', () => {
    const result = occurrencesBetween(
      { ...base, dataInicio: '2026-01-15' },
      '2026-01-01',
      '2026-01-31',
    );
    expect(result).toEqual(['2026-01-15']);
  });

  it('evento único fora do intervalo não aparece', () => {
    const result = occurrencesBetween({ ...base, dataInicio: '2026-02-15' }, '2026-01-01', '2026-01-31');
    expect(result).toEqual([]);
  });

  it('evento multidiário expande todos os dias cobertos', () => {
    const result = occurrencesBetween(
      { ...base, dataInicio: '2026-01-20', dataFim: '2026-01-23' },
      '2026-01-01',
      '2026-01-31',
    );
    expect(result).toEqual(['2026-01-20', '2026-01-21', '2026-01-22', '2026-01-23']);
  });

  it('semanal: terças de janeiro/2026', () => {
    const result = occurrencesBetween(
      { ...base, recorrencia: 'semanal', dataInicio: '2026-01-01', diaSemana: 2 }, // terça
      '2026-01-01',
      '2026-01-31',
    );
    expect(result).toEqual(['2026-01-06', '2026-01-13', '2026-01-20', '2026-01-27']);
  });

  it('semanal respeita dataFim', () => {
    const result = occurrencesBetween(
      { ...base, recorrencia: 'semanal', dataInicio: '2026-01-01', dataFim: '2026-01-20', diaSemana: 2 },
      '2026-01-01',
      '2026-01-31',
    );
    expect(result).toEqual(['2026-01-06', '2026-01-13', '2026-01-20']);
  });

  it('semanal com início no meio da semana alinha ao dia correto', () => {
    const result = occurrencesBetween(
      { ...base, recorrencia: 'semanal', dataInicio: '2026-01-04', diaSemana: 2 },
      '2026-01-01',
      '2026-01-31',
    );
    expect(result).toEqual(['2026-01-06', '2026-01-13', '2026-01-20', '2026-01-27']);
  });

  it('mensal por dia fixo (dia 15)', () => {
    const result = occurrencesBetween(
      { ...base, recorrencia: 'mensal', dataInicio: '2026-01-01', diaMes: 15 },
      '2026-01-01',
      '2026-03-31',
    );
    expect(result).toEqual(['2026-01-15', '2026-02-15', '2026-03-15']);
  });

  it('mensal por dia fixo ajusta para o último dia em meses curtos (dia 31)', () => {
    const result = occurrencesBetween(
      { ...base, recorrencia: 'mensal', dataInicio: '2026-01-01', diaMes: 31 },
      '2026-01-01',
      '2026-04-30',
    );
    expect(result).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });

  it('mensal por semana do mês (2º domingo)', () => {
    const result = occurrencesBetween(
      { ...base, recorrencia: 'mensal', dataInicio: '2026-01-01', semanaMes: 2, diaSemana: 0 },
      '2026-01-01',
      '2026-03-31',
    );
    expect(result).toEqual(['2026-01-11', '2026-02-08', '2026-03-08']);
  });

  it('série iniciada no mês anterior aparece dentro do intervalo', () => {
    const result = occurrencesBetween(
      { ...base, recorrencia: 'semanal', dataInicio: '2025-12-01', diaSemana: 2 },
      '2026-01-01',
      '2026-01-31',
    );
    expect(result).toEqual(['2026-01-06', '2026-01-13', '2026-01-20', '2026-01-27']);
  });
});