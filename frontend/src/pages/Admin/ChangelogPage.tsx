import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints.js';
import { Spinner } from '../../components/Spinner.js';
import { formatBR } from '../../lib/date.js';

export function ChangelogPage() {
  const query = useQuery({
    queryKey: ['changelog'],
    queryFn: () => api.changelog({ limit: 300 }),
  });

  return (
    <div>
      <h2 className="page-title">Histórico de alterações</h2>
      <p className="page-subtitle">Todas as mudanças feitas por usuários admins e editores no calendário.</p>

      {query.isLoading ? (
        <Spinner />
      ) : (query.data ?? []).length === 0 ? (
        <p className="empty">Nenhuma alteração registrada ainda.</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Data/hora</th>
                <th>Ação</th>
                <th>Evento / sequência</th>
                <th>Usuário</th>
                <th>Observação</th>
                <th>Campos alterados</th>
              </tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((entry) => (
                <tr key={entry.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatBR(entry.criadoEm.slice(0, 10))} {entry.criadoEm.slice(11, 16)}
                  </td>
                  <td>{entry.acaoLabel}</td>
                  <td>
                    {entry.eventoTitulo ??
                      (entry.serieId ? 'Sequência #' + entry.serieId : '—')}
                  </td>
                  <td>{entry.usuario?.nome ?? '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{entry.observacao ?? '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {entry.camposAlterados ? Object.keys(entry.camposAlterados).join(', ') : '—'}
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