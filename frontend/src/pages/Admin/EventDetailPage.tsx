import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints.js';
import { ApiError } from '../../api/client.js';
import { Spinner } from '../../components/Spinner.js';
import { formatBR, recorrenciaLabel, todayISO } from '../../lib/date.js';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelDate, setCancelDate] = useState(todayISO());
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const detailQuery = useQuery({
    queryKey: ['admin-event', id],
    queryFn: () => api.getEvent(id!),
    enabled: Boolean(id),
  });
  const historyQuery = useQuery({
    queryKey: ['admin-event-history', id],
    queryFn: () => api.eventHistory(id!),
    enabled: Boolean(id),
  });

  const event = detailQuery.data;

  const toggleStatus = async () => {
    if (!event) return;
    const next = event.status === 'confirmado' ? 'cancelado' : 'confirmado';
    await api.setEventStatus(event.id, next);
    void queryClient.invalidateQueries({ queryKey: ['admin-event', event.id] });
    void queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    void queryClient.invalidateQueries({ queryKey: ['public-events'] });
  };

  const confirmDelete = async () => {
    if (!event) return;
    const ok = window.confirm(`Excluir "${event.titulo}"? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    await api.deleteEvent(event.id);
    void queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    void queryClient.invalidateQueries({ queryKey: ['public-events'] });
    navigate('/admin/eventos');
  };

  const occurrenceAction = async (action: 'cancel' | 'reinstate') => {
    if (!event || !cancelDate) return;
    setError(null);
    setBusy(true);
    try {
      if (action === 'cancel') {
        await api.cancelOccurrence(event.id, cancelDate, motivo.trim() || undefined);
        setMotivo('');
      } else {
        await api.reinstateOccurrence(event.id, cancelDate);
      }
      void queryClient.invalidateQueries({ queryKey: ['public-events'] });
      window.alert(action === 'cancel' ? 'Ocorrência cancelada.' : 'Ocorrência reativada.');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível alterar a ocorrência.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (detailQuery.isLoading) return <Spinner />;
  if (!event) {
    return (
      <div>
        <p className="empty">Evento não encontrado.</p>
        <p style={{ textAlign: 'center' }}>
          <Link to="/admin/eventos">Voltar para a lista</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/admin/eventos">← Voltar</Link>
      </p>

      <h2 className="page-title">{event.titulo}</h2>
      <p className="page-subtitle">
        {formatBR(event.dataInicio)}
        {event.dataFim && <> até {formatBR(event.dataFim)}</>} · {recorrenciaLabel(event)}
      </p>

      {event.eventoPaiId && event.paiTitulo && (
        <p>
          Este evento é o primeiro de uma sequência:{' '}
          <Link to={`/admin/eventos/${event.eventoPaiId}`}>{event.paiTitulo}</Link>. Para alterar este evento, edite a sequência.
        </p>
      )}

      {error && <div className="form-error">{error}</div>}

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        <Link className="btn" to={`/admin/eventos/${event.id}/editar`} aria-disabled={Boolean(event.eventoPaiId)}>
          Editar
        </Link>
        <Link className="btn" to={`/admin/eventos/novo?clone=${event.id}`}>
          Clonar
        </Link>
        <button type="button" className="btn" onClick={() => void toggleStatus()}>
          {event.status === 'confirmado' ? 'Cancelar evento inteiro' : 'Reativar evento'}
        </button>
        <button type="button" className="btn btn--danger" onClick={() => void confirmDelete()}>
          Excluir
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Detalhes</h3>
          <table className="table">
            <tbody>
              <tr>
                <th>Status</th>
                <td>
                  <span className={`badge ${event.status === 'confirmado' ? 'badge--ok' : 'badge--danger'}`}>
                    {event.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Categoria</th>
                <td>
                  {event.categoria ? (
                    <span className="badge" style={{ background: event.categoria.cor, color: '#fff' }}>
                      {event.categoria.nome}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
              <tr>
                <th>Comunidade</th>
                <td>{event.comunidade?.nome ?? '—'}</td>
              </tr>
              <tr>
                <th>Horário</th>
                <td>{event.hora ?? '—'}</td>
              </tr>
              <tr>
                <th>Local</th>
                <td>{event.local ?? '—'}</td>
              </tr>
              <tr>
                <th>Responsável</th>
                <td>{event.responsavel ?? '—'}</td>
              </tr>
              <tr>
                <th>Criado por</th>
                <td>
                  {event.criadoPor?.nome ?? '—'} em {formatBR(event.criadoEm.slice(0, 10))}
                </td>
              </tr>
            </tbody>
          </table>
          {event.descricao && <p style={{ whiteSpace: 'pre-line' }}>{event.descricao}</p>}
        </div>

        {event.recorrencia === 'nenhuma' ? null : (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Ocorrências deste evento recorrente</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Para cancelar apenas um dia específico (ex.: um domingo), informe a data e o motivo.
            </p>
            <div className="field">
              <label htmlFor="cancel-date">Data</label>
              <input id="cancel-date" type="date" value={cancelDate} onChange={(e) => setCancelDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="cancel-motivo">Motivo do cancelamento</label>
              <textarea id="cancel-motivo" rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="button" className="btn btn--danger" disabled={busy || !cancelDate} onClick={() => void occurrenceAction('cancel')}>
                Cancelar ocorrência
              </button>
              <button type="button" className="btn" disabled={busy || !cancelDate} onClick={() => void occurrenceAction('reinstate')}>
                Reativar ocorrência
              </button>
            </div>
          </div>
        )}
      </div>

      {event.filhos.length > 0 && (
        <div className="card" style={{ marginBottom: '1.2rem' }}>
          <h3 style={{ marginTop: 0 }}>Sequência</h3>
          <p style={{ fontSize: '0.9rem' }}>Este evento é o primeiro de uma sequência de {event.filhos.length + 1} encontros. Acesse cada dia para editar.</p>
          <table className="table">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Data</th>
                <th>Título</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[event, ...event.filhos].map((child, index) => (
                <tr key={child.id}>
                  <td>{index + 1}º</td>
                  <td>{formatBR(child.dataInicio)}</td>
                  <td>
                    <Link to={`/admin/eventos/${child.id}`}>{child.titulo}</Link>
                  </td>
                  <td>
                    <span className={`badge ${child.status === 'confirmado' ? 'badge--ok' : 'badge--danger'}`}>
                      {child.status === 'confirmado' ? 'Confirmado' : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Histórico de alterações</h3>
        {historyQuery.isLoading ? (
          <Spinner />
        ) : (historyQuery.data ?? []).length === 0 ? (
          <p className="empty">Sem alterações registradas.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Ação</th>
                <th>Usuário</th>
                <th>Observação / campos</th>
              </tr>
            </thead>
            <tbody>
              {(historyQuery.data ?? []).map((entry) => (
                <tr key={entry.id}>
                  <td>{formatBR(entry.criadoEm.slice(0, 10))} {entry.criadoEm.slice(11, 16)}</td>
                  <td>{entry.acao}</td>
                  <td>{entry.usuario?.nome ?? '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {entry.observacao ?? ((entry.camposAlterados ? Object.keys(entry.camposAlterados).join(', ') : '') || '—')}
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