import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/endpoints.js';
import { Spinner } from '../../components/Spinner.js';
import { filterDefaults } from '../../lib/filters.js';
import { formatBR, recorrenciaLabel, todayISO } from '../../lib/date.js';
import type { EventDTO, Status } from '../../api/types.js';

export function EventsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | Status>('');
  const [categoriaId, setCategoriaId] = useState('');
  const [comunidadeId, setComunidadeId] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { categories, communities } = filterDefaults.useQueries();

  const query = useQuery({
    queryKey: ['admin-events', { q, status, categoriaId, comunidadeId }],
    queryFn: () =>
      api.listEvents({
        q: q || undefined,
        status: status || undefined,
        categoriaId: categoriaId || undefined,
        comunidadeId: comunidadeId || undefined,
      }),
  });

  const toggleStatus = async (event: EventDTO) => {
    const next = event.status === 'confirmado' ? 'cancelado' : 'confirmado';
    await api.setEventStatus(event.id, next);
    void queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    void queryClient.invalidateQueries({ queryKey: ['public-events'] });
  };

  const confirmDelete = async (event: EventDTO) => {
    const ok = window.confirm(`Excluir "${event.titulo}"? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    setDeletingId(event.id);
    try {
      await api.deleteEvent(event.id);
      void queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      void queryClient.invalidateQueries({ queryKey: ['public-events'] });
    } catch {
      window.alert('Não foi possível excluir o evento.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="page-title">Eventos</h2>
      <p className="page-subtitle">Gerencie a agenda da paróquia.</p>

      <div className="filters">
        <div className="field">
          <label htmlFor="q">Buscar</label>
          <input
            id="q"
            type="search"
            placeholder="Título, local, responsável…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Status | '')}>
            <option value="">Todos</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="categoria">Categoria</label>
          <select id="categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="comunidade">Comunidade</label>
          <select id="comunidade" value={comunidadeId} onChange={(e) => setComunidadeId(e.target.value)}>
            <option value="">Todas</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <Link className="btn btn--primary" to="/admin/eventos/novo">
          Novo evento
        </Link>
      </div>

      {query.isLoading ? (
        <Spinner />
      ) : (query.data ?? []).length === 0 ? (
        <p className="empty">Nenhum evento encontrado.</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Data</th>
                <th>Recorrência</th>
                <th>Categoria</th>
                <th>Comunidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>
                      <Link to={`/admin/eventos/${event.id}`}>{event.titulo}</Link>
                    </strong>
                    {event.eventoPaiId && event.paiTitulo && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        (da sequência {event.paiTitulo})
                      </div>
                    )}
                  </td>
                  <td>
                    {formatBR(event.dataInicio)}
                    {event.dataFim && <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>até {formatBR(event.dataFim)}</div>}
                  </td>
                  <td style={{ fontSize: '0.84rem' }}>
                    {recorrenciaLabel(event)}
                    {event.recorrencia !== 'nenhuma' && (
                      <div style={{ color: 'var(--muted)' }}>
                        {event.dataInicio <= todayISO() ? 'em andamento' : 'começa em ' + formatBR(event.dataInicio)}
                      </div>
                    )}
                  </td>
                  <td>
                    {event.categoria ? (
                      <span className="badge" style={{ background: event.categoria.cor, color: '#fff' }}>
                        {event.categoria.nome}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{event.comunidade?.nome ?? '—'}</td>
                  <td>
                    <span className={`badge ${event.status === 'confirmado' ? 'badge--ok' : 'badge--danger'}`}>
                      {event.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
                    </span>
                  </td>
                  <td>
                    <Link className="btn btn--sm" to={`/admin/eventos/novo?clone=${event.id}`}>
                      Clonar
                    </Link>
                    <Link className="btn btn--sm" to={`/admin/eventos/${event.id}/editar`}>
                      Editar
                    </Link>
                    <button type="button" className="btn btn--sm" onClick={() => void toggleStatus(event)}>
                      {event.status === 'confirmado' ? 'Cancelar' : 'Reativar'}
                    </button>
                    <button type="button" className="btn btn--sm btn--danger" disabled={deletingId === event.id} onClick={() => void confirmDelete(event)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}