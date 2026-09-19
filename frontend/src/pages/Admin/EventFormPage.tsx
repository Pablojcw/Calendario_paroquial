import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints.js';
import { ApiError } from '../../api/client.js';
import { Spinner } from '../../components/Spinner.js';
import { filterDefaults } from '../../lib/filters.js';
import { WEEKDAY_LONG } from '../../lib/date.js';
import type { FormEvent } from 'react';
import type { EventDTO, EventInput, Recorrencia, Status } from '../../api/types.js';

type FormState = {
  titulo: string;
  descricao: string;
  responsavel: string;
  local: string;
  categoriaId: string;
  comunidadeId: string;
  dataInicio: string;
  hora: string;
  dataFim: string;
  recorrencia: Recorrencia;
  diaSemana: string;
  diaMes: string;
  semanaMes: string;
  status: Status;
};

const emptyForm: FormState = {
  titulo: '',
  descricao: '',
  responsavel: '',
  local: '',
  categoriaId: '',
  comunidadeId: '',
  dataInicio: '',
  hora: '',
  dataFim: '',
  recorrencia: 'nenhuma',
  diaSemana: '0',
  diaMes: '1',
  semanaMes: '',
  status: 'confirmado',
};

function fromDto(event: EventDTO): FormState {
  return {
    titulo: event.titulo,
    descricao: event.descricao ?? '',
    responsavel: event.responsavel ?? '',
    local: event.local ?? '',
    categoriaId: event.categoria?.id ?? '',
    comunidadeId: event.comunidade?.id ?? '',
    dataInicio: event.dataInicio,
    hora: event.hora ?? '',
    dataFim: event.dataFim ?? '',
    recorrencia: event.recorrencia,
    diaSemana: event.diaSemana !== null ? String(event.diaSemana) : '0',
    diaMes: event.diaMes !== null ? String(event.diaMes) : '1',
    semanaMes: event.semanaMes !== null ? String(event.semanaMes) : '',
    status: event.status,
  };
}

function toInput(form: FormState): EventInput {
  const num = (value: string): number | null => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  return {
    titulo: form.titulo.trim(),
    descricao: form.descricao.trim() || null,
    responsavel: form.responsavel.trim() || null,
    local: form.local.trim() || null,
    categoriaId: form.categoriaId || null,
    comunidadeId: form.comunidadeId || null,
    dataInicio: form.dataInicio,
    hora: form.hora || null,
    dataFim: form.dataFim || null,
    recorrencia: form.recorrencia,
    diaSemana: form.recorrencia === 'nenhuma' ? null : num(form.diaSemana),
    diaMes: form.recorrencia === 'mensal' && !form.semanaMes ? num(form.diaMes) : null,
    semanaMes: form.recorrencia === 'mensal' && form.semanaMes ? num(form.semanaMes) : null,
    status: form.status,
    visibilidade: 'publico',
  };
}

function validate(form: FormState): string | null {
  if (!form.titulo.trim()) return 'Informe o título do evento.';
  if (!form.dataInicio) return 'Informe a data de início.';
  if (form.recorrencia === 'semanal' && !form.diaSemana) return 'Informe o dia da semana da recorrência.';
  if (form.recorrencia === 'mensal' && !form.semanaMes && !form.diaMes) {
    return 'Informe o dia do mês ou a semana do mês.';
  }
  if (form.dataFim && form.dataFim < form.dataInicio) return 'A data final não pode ser anterior à data de início.';
  return null;
}

export function EventFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cloneId = searchParams.get('clone');

  const isEdit = Boolean(id) && !cloneId;
  const targetId = id ?? cloneId;

  const existingQuery = useQuery({
    queryKey: ['admin-event', targetId],
    queryFn: () => api.getEvent(targetId!),
    enabled: Boolean(targetId),
  });

  useEffect(() => {
    if (existingQuery.data) {
      setForm(fromDto(existingQuery.data));
    }
  }, [existingQuery.data]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { categories, communities } = filterDefaults.useQueries();

  const setField = (field: keyof FormState, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const setRec = (value: Recorrencia) => setForm((f) => ({ ...f, recorrencia: value }));

  const loading = Boolean(targetId) && existingQuery.isLoading;
  if (loading) return <Spinner />;

  const submit = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const input = toInput(form);
      if (isEdit && id) {
        const updated = await api.updateEvent(id, input);
        void queryClient.invalidateQueries({ queryKey: ['admin-events'] });
        void queryClient.invalidateQueries({ queryKey: ['public-events'] });
        navigate(`/admin/eventos/${updated.id}`);
      } else {
        const created = await api.createEvent(input);
        void queryClient.invalidateQueries({ queryKey: ['admin-events'] });
        void queryClient.invalidateQueries({ queryKey: ['public-events'] });
        navigate(`/admin/eventos/${created.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível salvar o evento.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">{isEdit ? 'Editar evento' : cloneId ? 'Clonar evento' : 'Novo evento'}</h2>
      <p className="page-subtitle">{isEdit || cloneId ? 'Preencha os campos e salve as alterações.' : 'Crie um novo evento na agenda.'}</p>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={(e) => void submit(e)} className="card">
        <div className="field">
          <label htmlFor="titulo">Título *</label>
          <input id="titulo" value={form.titulo} onChange={(e) => setField('titulo', e.target.value)} placeholder="Ex.: Missa na comunidade São Sebastião" />
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="dataInicio">Data inicial *</label>
            <input id="dataInicio" type="date" value={form.dataInicio} onChange={(e) => setField('dataInicio', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dataFim">Data final</label>
            <input id="dataFim" type="date" value={form.dataFim} onChange={(e) => setField('dataFim', e.target.value)} />
            <span className="hint">Usada pela recorrência para delimitar o período.</span>
          </div>
          <div className="field">
            <label htmlFor="hora">Horário</label>
            <input id="hora" type="time" value={form.hora} onChange={(e) => setField('hora', e.target.value)} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="categoriaId">Categoria</label>
            <select id="categoriaId" value={form.categoriaId} onChange={(e) => setField('categoriaId', e.target.value)}>
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
            <select id="comunidadeId" value={form.comunidadeId} onChange={(e) => setField('comunidadeId', e.target.value)}>
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
            <input id="responsavel" value={form.responsavel} onChange={(e) => setField('responsavel', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="local">Local</label>
            <input id="local" value={form.local} onChange={(e) => setField('local', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" rows={3} value={form.descricao} onChange={(e) => setField('descricao', e.target.value)} />
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="recorrencia">Recorrência</label>
            <select id="recorrencia" value={form.recorrencia} onChange={(e) => setRec(e.target.value as Recorrencia)}>
              <option value="nenhuma">Evento único</option>
              <option value="semanal">Toda semana</option>
              <option value="mensal">Todo mês</option>
            </select>
            <span className="hint">Preencha a data final para limitar a recorrência.</span>
          </div>

          {form.recorrencia === 'semanal' && (
            <div className="field">
              <label htmlFor="diaSemana">Dia da semana</label>
              <select id="diaSemana" value={form.diaSemana} onChange={(e) => setField('diaSemana', e.target.value)}>
                {WEEKDAY_LONG.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.recorrencia === 'mensal' && (
            <>
              <div className="field">
                <label htmlFor="diaMes">Repetir no dia</label>
                <input id="diaMes" type="number" min={1} max={31} value={form.diaMes} onChange={(e) => { setField('diaMes', e.target.value); setField('semanaMes', ''); }} />
                <span className="hint">Ex.: 15 → todo dia 15 de cada mês.</span>
              </div>
              <div className="field">
                <label htmlFor="semanaMes">Ou na semana do mês</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select id="semanaMes" value={form.semanaMes} onChange={(e) => setField('semanaMes', e.target.value)}>
                    <option value="">Fixo no dia</option>
                    <option value="1">1ª</option>
                    <option value="2">2ª</option>
                    <option value="3">3ª</option>
                    <option value="4">4ª</option>
                    <option value="5">última</option>
                  </select>
                  <select value={form.diaSemana} onChange={(e) => setField('diaSemana', e.target.value)}>
                    {WEEKDAY_LONG.map((name, i) => (
                      <option key={i} value={i}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="hint">Ex.: 3ª domingo do mês → define 3ª + domingo.</span>
              </div>
            </>
          )}
        </div>

        <div className="field" style={{ maxWidth: '280px' }}>
          <label htmlFor="status">Status</label>
          <select id="status" value={form.status} onChange={(e) => setField('status', e.target.value)}>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button type="button" className="btn" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}