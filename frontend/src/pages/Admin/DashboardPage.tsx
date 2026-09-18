import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/endpoints.js';
import { Spinner } from '../../components/Spinner.js';
import { formatBR } from '../../lib/date.js';

export function DashboardPage() {
  const recent = useQuery({
    queryKey: ['admin-events-recent'],
    queryFn: () => api.listEvents({ limit: 5, offset: 0 }),
  });
  const upcoming = useQuery({
    queryKey: ['admin-upcoming'],
    queryFn: () => api.upcomingEvents({ limit: 5 }),
  });
  const changelog = useQuery({
    queryKey: ['changelog-dash'],
    queryFn: () => api.changelog({ limit: 8 }),
  });

  return (
    <div>
      <h2 className="page-title">Painel</h2>
      <p className="page-subtitle">Visão geral da agenda.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Ações rápidas</h3>
          <p>
            <Link to="/admin/eventos/novo">Novo evento</Link>
            <br />
            <Link to="/admin/sequencia-nova">Nova sequência (novena/tríduo)</Link>
            <br />
            <Link to="/admin/categorias">Gerenciar categorias</Link>
            <br />
            <Link to="/admin/comunidades">Gerenciar comunidades</Link>
            <br />
            <Link to="/admin/institucional">Editar página institucional</Link>
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Próximos 60 dias</h3>
          {upcoming.isLoading ? (
            <Spinner />
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {(upcoming.data ?? []).slice(0, 5).map((occ) => (
                <li key={occ.ocorrenciaId} style={{ fontSize: '0.9rem' }}>
                  <strong>{formatBR(occ.data)}</strong> — {occ.titulo}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Últimas alterações</h3>
          {changelog.isLoading ? (
            <Spinner />
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {(changelog.data ?? []).slice(0, 5).map((entry) => (
                <li key={entry.id} style={{ fontSize: '0.9rem' }}>
                  <strong>{entry.acaoLabel}</strong> — {entry.eventoTitulo ?? entry.observacao ?? '—'}
                </li>
              ))}
            </ul>
          )}
          <p style={{ marginBottom: 0 }}>
            <Link to="/admin/historico">Ver histórico completo →</Link>
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Últimos eventos criados</h3>
        {recent.isLoading ? (
          <Spinner />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Data</th>
                <th>Categoria</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(recent.data ?? []).map((event) => (
                <tr key={event.id}>
                  <td>
                    <Link to={`/admin/eventos/${event.id}`}>{event.titulo}</Link>
                  </td>
                  <td>{formatBR(event.dataInicio)}</td>
                  <td>{event.categoria?.nome ?? '—'}</td>
                  <td>
                    <span className={`badge ${event.status === 'confirmado' ? 'badge--ok' : 'badge--danger'}`}>
                      {event.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}