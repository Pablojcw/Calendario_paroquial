import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints.js';
import { ApiError } from '../../api/client.js';
import { Spinner } from '../../components/Spinner.js';
import type { Categoria } from '../../api/types.js';
import type { FormEvent } from 'react';

const DEFAULT_COLORS = ['#7f1d1d', '#b45309', '#1d6f46', '#1e3a8a', '#6d28d9', '#0e7490'];

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['categories'], queryFn: api.listCategories });
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(DEFAULT_COLORS[0] ?? '#7f1d1d');
  const [ordem, setOrdem] = useState('0');
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['categories'] });
    void queryClient.invalidateQueries({ queryKey: ['public-events'] });
  };

  const reset = () => {
    setNome('');
    setCor(DEFAULT_COLORS[0] ?? '#7f1d1d');
    setOrdem('0');
    setEditing(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!nome.trim()) return setError('Informe o nome da categoria.');
    setError(null);
    setBusy(true);
    try {
      if (editing) {
        await api.updateCategory(editing.id, { nome: nome.trim(), cor, ordem: Number(ordem) || 0 });
      } else {
        await api.createCategory({ nome: nome.trim(), cor, ordem: Number(ordem) || 0 });
      }
      invalidate();
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a categoria.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (category: Categoria) => {
    setEditing(category);
    setNome(category.nome);
    setCor(category.cor);
    setOrdem(String(category.ordem));
    setError(null);
  };

  const remove = async (category: Categoria) => {
    const ok = window.confirm(`Excluir a categoria "${category.nome}"? Eventos sem outra categoria ficarão sem categoria.`);
    if (!ok) return;
    try {
      await api.deleteCategory(category.id);
      invalidate();
      if (editing?.id === category.id) reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível excluir.');
    }
  };

  return (
    <div>
      <h2 className="page-title">Categorias</h2>
      <p className="page-subtitle">As categorias colorem o calendário (Missa, Adoração, Catequese, Pastoral…).</p>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={(e) => void submit(e)} className="card" style={{ marginBottom: '1.2rem' }}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="cat-nome">{editing ? 'Editar categoria' : 'Nova categoria'} *</label>
            <input id="cat-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Missa" />
          </div>
          <div className="field">
            <label htmlFor="cat-cor">Cor</label>
            <input id="cat-cor" type="color" value={cor} onChange={(e) => setCor(e.target.value)} style={{ height: '2.6rem', padding: '0.2rem' }} />
          </div>
          <div className="field">
            <label htmlFor="cat-ordem">Ordem de exibição</label>
            <input id="cat-ordem" type="number" value={ordem} onChange={(e) => setOrdem(e.target.value)} />
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
                <th>Cor</th>
                <th>Nome</th>
                <th>Ordem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {[...(query.data ?? [])]
                .sort((a, b) => a.ordem - b.ordem)
                .map((category) => (
                  <tr key={category.id}>
                    <td>
                      <span className="dot" style={{ background: category.cor }} />
                      {category.cor}
                    </td>
                    <td>
                      <strong>{category.nome}</strong>
                    </td>
                    <td>{category.ordem}</td>
                    <td>
                      <button type="button" className="btn btn--sm" onClick={() => startEdit(category)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn--sm btn--danger" onClick={() => void remove(category)}>
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