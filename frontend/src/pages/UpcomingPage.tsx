import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints.js';
import { OccurrenceItem } from '../components/OccurrenceList.js';
import { Spinner } from '../components/Spinner.js';
import { filterDefaults, useGlobalFilters } from '../lib/filters.js';
import { formatBR, weekdayLabel } from '../lib/date.js';
import type { PublicOccurrence } from '../api/types.js';

const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function UpcomingPage() {
  const { filters, setFilter } = useGlobalFilters();
  const { categories, communities } = filterDefaults.useQueries();

  const query = useQuery({
    queryKey: ['upcoming-events', filters.comunidadeId, filters.categoriaId],
    queryFn: () =>
      api.upcomingEvents({
        limit: 60,
        comunidadeId: filters.comunidadeId || undefined,
        categoriaId: filters.categoriaId || undefined,
      }),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, PublicOccurrence[]>();
    for (const occ of query.data ?? []) {
      const list = map.get(occ.data) ?? [];
      list.push(occ);
      map.set(occ.data, list);
    }
    return [...map.entries()];
  }, [query.data]);

  return (
    <div>
      <h2 className="page-title">Próximos eventos</h2>
      <p className="page-subtitle">Próximos 60 dias da agenda paroquial.</p>

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
        <Link className="btn no-print" to="/">
          Ver no calendário
        </Link>
      </div>

      {query.isLoading ? (
        <Spinner />
      ) : grouped.length === 0 ? (
        <p className="empty">Nenhum evento nos próximos 60 dias.</p>
      ) : (
        <div className="upcoming-list">
          {grouped.map(([iso, occurrences]) => (
            <div key={iso} className="date-group">
              <div className="date-badge">
                <span className="day">{Number(iso.slice(8, 10))}</span>
                <span className="month">{MONTHS_SHORT[Number(iso.slice(5, 7)) - 1]}</span>
              </div>
              <div>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {weekdayLabel(iso)} · {formatBR(iso)}
                </p>
                <ul className="occ-list">
                  {occurrences.map((occ) => (
                    <OccurrenceItem key={occ.ocorrenciaId} occ={occ} />
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}