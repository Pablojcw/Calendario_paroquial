import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints.js';
import { MonthCalendar } from '../components/MonthCalendar.js';
import { OccurrenceList } from '../components/OccurrenceList.js';
import { Spinner } from '../components/Spinner.js';
import { filterDefaults, useGlobalFilters } from '../lib/filters.js';
import { formatBR, monthGrid, monthLabel, shiftMonth, todayISO, weekdayLabel } from '../lib/date.js';

export function CalendarPage() {
  const initialMonth = useMemo(() => todayISO(), []);
  const [monthISO, setMonthISO] = useState(initialMonth);
  const [selectedISO, setSelectedISO] = useState(initialMonth);

  const range = useMemo(() => {
    const grid = monthGrid(monthISO);
    return { from: grid[0] ?? todayISO(), to: grid[41] ?? todayISO() };
  }, [monthISO]);

  const { filters, setFilter } = useGlobalFilters();
  const { categories, communities } = filterDefaults.useQueries();

  const eventsQuery = useQuery({
    queryKey: ['public-events', range.from, range.to, filters.comunidadeId, filters.categoriaId],
    queryFn: () =>
      api.publicEvents({
        from: range.from,
        to: range.to,
        comunidadeId: filters.comunidadeId || undefined,
        categoriaId: filters.categoriaId || undefined,
      }),
  });

  const selectedOccurrences = useMemo(() => {
    if (!eventsQuery.data) return [];
    return eventsQuery.data.filter((o) => o.data === selectedISO);
  }, [eventsQuery.data, selectedISO]);

  const todaySelected = selectedISO === todayISO();

  return (
    <div>
      <h2 className="page-title">Calendário Paroquial</h2>
      <p className="page-subtitle">
        Agenda oficial de missas, celebrações e atividades da paróquia. Clique em um dia para ver os eventos.
      </p>

      <div className="filters no-print">
        <div className="field">
          <label htmlFor="filtro-comunidade">Comunidade</label>
          <select
            id="filtro-comunidade"
            value={filters.comunidadeId ?? ''}
            onChange={(e) => setFilter('comunidadeId', e.target.value || undefined)}
          >
            <option value="">Todas</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filtro-categoria">Categoria</label>
          <select
            id="filtro-categoria"
            value={filters.categoriaId ?? ''}
            onChange={(e) => setFilter('categoriaId', e.target.value || undefined)}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn no-print" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>

      <div className="card">
        <div className="calendar-toolbar">
          <div>
            <button type="button" className="btn" aria-label="Mês anterior" onClick={() => setMonthISO((m) => shiftMonth(m, -1))}>
              ←
            </button>
            <button
              type="button"
              className="btn"
              aria-label="Mês seguinte"
              onClick={() => setMonthISO((m) => shiftMonth(m, 1))}
            >
              →
            </button>
          </div>
          <h3 style={{ margin: 0 }}>{monthLabel(monthISO)}</h3>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              const today = todayISO();
              setMonthISO(today);
              setSelectedISO(today);
            }}
          >
            Hoje
          </button>
        </div>

        {eventsQuery.isLoading ? (
          <Spinner />
        ) : (
          <MonthCalendar
            monthISO={monthISO}
            occurrences={eventsQuery.data ?? []}
            selectedISO={selectedISO}
            onSelectDay={setSelectedISO}
          />
        )}
      </div>

      <section className="day-panel" aria-live="polite">
        <h3>
          {formatBR(selectedISO)} — {weekdayLabel(selectedISO)}
          {todaySelected && ' · hoje'}
        </h3>
        {eventsQuery.isLoading ? <Spinner /> : <OccurrenceList occurrences={selectedOccurrences} />}
      </section>
    </div>
  );
}