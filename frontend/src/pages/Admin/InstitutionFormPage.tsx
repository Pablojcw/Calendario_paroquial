import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints.js';
import { ApiError } from '../../api/client.js';
import { Spinner } from '../../components/Spinner.js';
import type { FormEvent } from 'react';

type InstitutionForm = {
  nome: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  email: string;
  expediente: string;
  instagram: string;
  ano_fundacao: string;
  administrador_paroquial: string;
  conteudo: string;
};

const empty: InstitutionForm = {
  nome: '',
  endereco: '',
  telefone: '',
  whatsapp: '',
  email: '',
  expediente: '',
  instagram: '',
  ano_fundacao: '',
  administrador_paroquial: '',
  conteudo: '',
};

function toForm(info: {
  nome: string;
  endereco: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  expediente: string | null;
  instagram: string | null;
  ano_fundacao: number | null;
  administrador_paroquial: string | null;
  conteudo: string | null;
}): InstitutionForm {
  return {
    nome: info.nome,
    endereco: info.endereco ?? '',
    telefone: info.telefone ?? '',
    whatsapp: info.whatsapp ?? '',
    email: info.email ?? '',
    expediente: info.expediente ?? '',
    instagram: info.instagram ?? '',
    ano_fundacao: info.ano_fundacao ? String(info.ano_fundacao) : '',
    administrador_paroquial: info.administrador_paroquial ?? '',
    conteudo: info.conteudo ?? '',
  };
}

export function InstitutionFormPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['institution'], queryFn: api.getInstitution });
  const [form, setForm] = useState<InstitutionForm>(empty);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (query.data) setForm(toForm(query.data));
  }, [query.data]);

  const set = (field: keyof InstitutionForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.nome.trim()) return setError('Informe o nome da paróquia.');
    setError(null);
    setSaving(true);
    try {
      const ano = Number(form.ano_fundacao);
      const updated = await api.updateInstitution({
        nome: form.nome.trim(),
        endereco: form.endereco.trim() || null,
        telefone: form.telefone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        expediente: form.expediente.trim() || null,
        instagram: form.instagram.trim() || null,
        ano_fundacao: Number.isFinite(ano) && ano > 0 ? ano : null,
        administrador_paroquial: form.administrador_paroquial.trim() || null,
        conteudo: form.conteudo,
      });
      void queryClient.setQueryData(['institution'], updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (query.isLoading) return <Spinner />;

  return (
    <div>
      <h2 className="page-title">Institucional</h2>
      <p className="page-subtitle">
        Informações exibidas na página{' '}
        <Link to="/institucional" target="_blank" rel="noreferrer">
          Visitar página institucional
        </Link>
        .
      </p>

      {error && <div className="form-error">{error}</div>}
      {success && (
        <div className="form-error" style={{ background: '#e7f6ec', borderColor: '#b6e2c4', color: 'var(--ok)' }}>
          Alterações salvas.
        </div>
      )}

      <form onSubmit={(e) => void submit(e)} className="card">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="inst-nome">Nome da paróquia *</label>
            <input id="inst-nome" value={form.nome} onChange={(e) => set('nome', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="inst-endereco">Endereço</label>
            <input id="inst-endereco" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} placeholder="Ex.: Rua X, 123, Centro" />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="inst-telefone">Telefone</label>
            <input id="inst-telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} placeholder="(18) 3271-0000" />
          </div>
          <div className="field">
            <label htmlFor="inst-whatsapp">WhatsApp</label>
            <input id="inst-whatsapp" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="(18) 90000-0000" />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="inst-email">E-mail</label>
            <input id="inst-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="inst-instagram">Instagram (sem @)</label>
            <input id="inst-instagram" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="inst-expediente">Expediente da secretaria</label>
            <input id="inst-expediente" value={form.expediente} onChange={(e) => set('expediente', e.target.value)} placeholder="Seg. a sex., das 8h às 17h" />
          </div>
          <div className="field">
            <label htmlFor="inst-ano">Ano de fundação</label>
            <input id="inst-ano" type="number" min={1500} max={2100} value={form.ano_fundacao} onChange={(e) => set('ano_fundacao', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="inst-adm">Administrador paroquial</label>
            <input id="inst-adm" value={form.administrador_paroquial} onChange={(e) => set('administrador_paroquial', e.target.value)} placeholder="Ex.: Pe. João da Silva" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="inst-conteudo">Conteúdo (história da paróquia)</label>
          <textarea id="inst-conteudo" rows={10} value={form.conteudo} onChange={(e) => set('conteudo', e.target.value)} placeholder="Escreva um pouco sobre a história e a pastoral da paróquia…" />
          <span className="hint">Parágrafos separados por linha em branco.</span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button type="button" className="btn" onClick={() => query.data && setForm(toForm(query.data))}>
            Descartar alterações
          </button>
        </div>
      </form>
    </div>
  );
}