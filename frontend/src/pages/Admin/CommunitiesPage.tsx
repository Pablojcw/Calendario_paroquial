import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints.js';
import { ApiError } from '../../api/client.js';
import { Spinner } from '../../components/Spinner.js';
import type { Comunidade } from '../../api/types.js';
import type { FormEvent } from 'react';

type CommForm = {
  nome: string;
  endereco: string;
  bairro: string;
  ordem: string;
};

const empty: CommForm = { nome: '', endereco: '', bairro: '', ordem: '0' };

export function CommunitiesPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['communities'], queryFn: api.listCommunities });
  const [form, setForm] = useState<CommForm>(empty);
  const [editing, setEditing] = useState<Comunidade | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['communities'] });
    void queryClient.invalidateQueries({ queryKey: ['public-events'] });
  };

  const reset = () => {
    setForm(empty);
    setEditing(null);
  };

  const set = (field: keyof CommForm, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.nome.trim()) return setError('Informe o nome da comunidade.');
    setError(null);
    setBusy(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        endereco: form.endereco.trim() || null,
        bairro: form.bairro.trim() || null,
        ordem: Number(form.ordem) || 0,
      };
      if (editing) {
        await api.updateCommunity(editing.id, payload);
      } else {
        await api.createCommunity(payload);
      }
      invalidate();
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a comunidade.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (community: Comunidade) => {
    setEditing(community);
    setForm({
      nome: community.nome,
      endereco: community.endereco ?? '',
      bairro: community.bairro ?? '',
      ordem: String(community.ordem),
    });
    setError(null);
  };

  const remove = async (community: Comunidade) => {
    const ok = window.confirm(`Excluir a comunidade "${community.nome}"? Eventos dela ficarão sem comunidade.`);
    if (!ok) return;
    try {
      await api.deleteCommunity(community.id);
      invalidate();
      if (editing?.id === community.id) reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível excluir.');
    }
  };

  return (
    <div>
      <h2 className="page-title">Comunidades</h2>
      <p className="page-subtitle">Comunidades da paróquia (inclui a matriz e as comunidades rurais/urbanas).</p>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={(e) => void submit(e)} className="card" style={{ marginBottom: '1.2rem' }}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="comm-nome">{editing ? 'Editar comunidade' : 'Nova comunidade'} *</label>
            <input id="comm-nome" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: Comunidade São Sebastião" />
          </div>
          <div className="field">
            <label htmlFor="comm-endereco">Endereço</label>
            <input id="comm-endereco" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="comm-bairro">Bairro/Zona</label>
            <input id="comm-bairro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} placeholder="Ex.: Zona Rural" />
          </div>
          <div className="field">
            <label htmlFor="comm-ordem">Ordem de exibição</label>
            <input id="comm-ordem" type="number" value={form.ordem} onChange={(e) => set('ordem', e.target.value)} />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <button type="submit" className="btn btn--primary" disabled={busy}>
                {editing ? 'Salvar alterações' : 'Adicionar'}
              </button>
              {editing && (
                <button type="button" className="btn" onClick={reset}>
                  Cancelar edição
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {query.isLoading ? (
        <Spinner />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Endereço</th>
                <th>Bairro/Zona</th>
                <th>Ativa</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {[...(query.data ?? [])]
                .sort((a, b) => a.ordem - b.ordem)
                .map((community) => (
                  <tr key={community.id}>
                    <td>
                      <strong>{community.nome}</strong>
                    </td>
                    <td>{community.endereco ?? '—'}</td>
                    <td>{community.bairro ?? '—'}</td>
                    <td>
                      <span className={`badge ${community.ativa ? 'badge--ok' : 'badge--muted'}`}>
                        {community.ativa ? 'Sim' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn--sm" onClick={() => startEdit(community)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn--sm btn--danger" onClick={() => void remove(community)}>
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