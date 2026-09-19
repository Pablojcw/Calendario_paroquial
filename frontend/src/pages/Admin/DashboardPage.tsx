import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/endpoints.js';
import { Spinner } from '../../components/Spinner.js';
import { formatBR } from '../../lib/date.js';

export function DashboardPage() {
  const recent = useQuery({
    queryKey: ['admin-events-recent'],
    queryFn: () => api.listEvents({ limit: 8, offset: 0 }),
  });
  const upcoming = useQuery({
    queryKey: ['admin-upcoming'],
    queryFn: () => api.upcomingEvents({ limit: 6 }),
  });
  const changelog = useQuery({
    queryKey: ['changelog-dash'],
    queryFn: () => api.changelog({ limit: 6 }),
  });

  return (
    <div>
      <h2 className="page-title">Painel Administrativo</h2>
      <p className="page-subtitle">Visão geral da agenda e atalhos rápidos de gerenciamento.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* AÇÕES RÁPIDAS */}
        <div className="card">
          <h3 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>⚡ Ações Rápidas</h3>
          <div className="admin-actions">
            <Link to="/admin/eventos/novo" className="btn btn--primary btn--block">
              + Criar Novo Evento
            </Link>
            <Link to="/admin/sequencia-nova" className="btn btn--secondary btn--block">
              + Nova Sequência (Novena/Tríduo)
            </Link>
            <Link to="/admin/categorias" className="btn btn--block">
              🎨 Gerenciar Categorias
            </Link>
            <Link to="/admin/comunidades" className="btn btn--block">
              ⛪ Gerenciar Comunidades
            </Link>
            <Link to="/admin/institucional" className="btn btn--block">
              📖 Editar Página Institucional
            </Link>
          </div>
        </div>

        {/* PRÓXIMOS 60 DIAS */}
        <div className="card">
          <h3 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>📅 Próximos Eventos</h3>
          {upcoming.isLoading ? (
            <Spinner />
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {(upcoming.data ?? []).slice(0, 6).map((occ) => (
                <li key={occ.ocorrenciaId} style={{ fontSize: '0.88rem' }}>
                  <strong style={{ color: 'var(--primary)' }}>{formatBR(occ.data)}</strong> — {occ.titulo}
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: '0.8rem', borderTop: '1px solid var(--line)', paddingTop: '0.5rem' }}>
            <Link to="/admin/eventos" style={{ fontSize: '0.86rem', fontWeight: 600 }}>
              Ver todos os eventos →
            </Link>
          </div>
        </div>

        {/* ÚLTIMAS ALTERAÇÕES */}
        <div className="card">
          <h3 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>📝 Histórico Recente</h3>
          {changelog.isLoading ? (
            <Spinner />
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {(changelog.data ?? []).slice(0, 6).map((entry) => (
                <li key={entry.id} style={{ fontSize: '0.88rem' }}>
                  <strong>{entry.acaoLabel}</strong> — {entry.eventoTitulo ?? entry.observacao ?? '—'}
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: '0.8rem', borderTop: '1px solid var(--line)', paddingTop: '0.5rem' }}>
            <Link to="/admin/historico" style={{ fontSize: '0.86rem', fontWeight: 600 }}>
              Ver histórico completo de alterações →
            </Link>
          </div>
        </div>
      </div>

      {/* ÚLTIMOS EVENTOS CADASTRADOS */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Últimos Eventos Cadastrados</h3>
          <Link to="/admin/eventos" className="btn btn--sm">
            Gerenciar todos
          </Link>
        </div>

        {recent.isLoading ? (
          <Spinner />
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
                      <strong>
                        <Link to={`/admin/eventos/${event.id}`}>{event.titulo}</Link>
                      </strong>
                    </td>
                    <td>{formatBR(event.dataInicio)}</td>
                    <td>
                      {event.categoria ? (
                        <span
                          className="badge"
                          style={{
                            background: event.categoria.cor || 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.72rem',
                          }}
                        >
                          {event.categoria.nome}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className={`badge ${event.status === 'confirmado' ? 'badge--ok' : 'badge--danger'}`}>
                        {event.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}