import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints.js';
import { ApiError } from '../../api/client.js';
import { filterDefaults } from '../../lib/filters.js';
import type { FormEvent } from 'react';
type SequenceFormState = {
  titulo: string;
  descricao: string;
  responsavel: string;
  local: string;
  categoriaId: string;
  comunidadeId: string;
  dataInicio: string;
  hora: string;
  intervaloDias: string;
  dias: string;
};

const initial: SequenceFormState = {
  titulo: '',
  descricao: '',
  responsavel: '',
  local: '',
  categoriaId: '',
  comunidadeId: '',
  dataInicio: '',
  hora: '',
  intervaloDias: '1',
  dias: '9',
};

export function SequenceFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SequenceFormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { categories, communities } = filterDefaults.useQueries();

  const set = (field: keyof SequenceFormState, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.titulo.trim()) return setError('Informe o título da sequência.');
    if (!form.dataInicio) return setError('Informe a data de início.');

    const dias = Number(form.dias);
    if (!Number.isFinite(dias) || dias < 2 || dias > 60) {
      return setError('O número de encontros deve estar entre 2 e 60.');
    }

    const intervaloDias = Number(form.intervaloDias);
    if (!Number.isFinite(intervaloDias) || intervaloDias < 1 || intervaloDias > 31) {
      return setError('O intervalo entre encontros deve estar entre 1 e 31 dias.');
    }

    setError(null);
    setSaving(true);
    try {
      const result = await api.createSequence({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        responsavel: form.responsavel.trim() || null,
        local: form.local.trim() || null,
        categoriaId: form.categoriaId || null,
        comunidadeId: form.comunidadeId || null,
        dataInicio: form.dataInicio,
        hora: form.hora || null,
        intervaloDias,
        dias,
        visibilidade: 'publico',
      });
      void queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      void queryClient.invalidateQueries({ queryKey: ['public-events'] });
      navigate(`/admin/eventos/${result.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível criar a sequência.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Nova sequência</h2>
      <p className="page-subtitle">
        Crie uma novena, tríduo ou série de encontros de uma só vez. Cada dia vira um evento vinculado à sequência.
      </p>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={(e) => void submit(e)} className="card">
        <div className="field">
          <label htmlFor="titulo">Título da sequência *</label>
          <input id="titulo" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex.: Novena de Natal" />
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="dataInicio">Primeiro encontro *</label>
            <input id="dataInicio" type="date" value={form.dataInicio} onChange={(e) => set('dataInicio', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="hora">Horário</label>
            <input id="hora" type="time" value={form.hora} onChange={(e) => set('hora', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="intervaloDias">Intervalo entre encontros (dias)</label>
            <input id="intervaloDias" type="number" min={1} max={31} value={form.intervaloDias} onChange={(e) => set('intervaloDias', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dias">Número de encontros</label>
            <input id="dias" type="number" min={2} max={60} value={form.dias} onChange={(e) => set('dias', e.target.value)} placeholder="Ex.: 9 (novena)" />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="categoriaId">Categoria</label>
            <select id="categoriaId" value={form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="comunidadeId">Comunidade</label>
            <select id="comunidadeId" value={form.comunidadeId} onChange={(e) => set('comunidadeId', e.target.value)}>
              <option value="">Paróquia (todas)</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="responsavel">Responsável</label>
            <input id="responsavel" value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="local">Local</label>
            <input id="local" value={form.local} onChange={(e) => set('local', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="descricao">Descrição (vale para todos os encontros)</label>
          <textarea id="descricao" rows={3} value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Criando…' : 'Criar sequência'}
          </button>
          <button type="button" className="btn" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}