import { apiFetch } from './client.js';
import type {
  AuthUser,
  Categoria,
  ChangelogEntry,
  Comunidade,
  EventDetail,
  EventDTO,
  EventInput,
  EventListParams,
  EventPatch,
  HistoryEntry,
  Institution,
  InstitutionInput,
  LoginResponse,
  PublicOccurrence,
  PublicRangeParams,
  SequenceInput,
  SequenceResult,
} from './types.js';

function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const out = search.toString();
  return out ? `?${out}` : '';
}

export const api = {
  // ---------------------------------------------------------------- público
  listCategories: () => apiFetch<Categoria[]>('/api/categories'),

  listCommunities: () => apiFetch<Comunidade[]>('/api/communities'),

  getInstitution: () => apiFetch<Institution>('/api/institution'),

  publicEvents: (params: PublicRangeParams) =>
    apiFetch<PublicOccurrence[]>(`/api/events/public${qs(params)}`),

  upcomingEvents: (params: { limit?: number; comunidadeId?: string; categoriaId?: string } = {}) =>
    apiFetch<PublicOccurrence[]>(`/api/events/public/proximos${qs(params)}`),

  // ---------------------------------------------------------------- auth
  login: (email: string, senha: string) =>
    apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
      skipAuth: true,
    }),

  register: (nome: string, email: string, senha: string) =>
    apiFetch<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
      skipAuth: true,
    }),

  me: () => apiFetch<AuthUser>('/api/auth/me'),

  // ---------------------------------------------------------------- admin / events
  listEvents: (params: EventListParams = {}) =>
    apiFetch<EventDTO[]>(`/api/events${qs({ ...params, limit: params.limit ?? 200 })}`),

  getEvent: (id: string) => apiFetch<EventDetail>(`/api/events/${id}`),

  createEvent: (input: EventInput) =>
    apiFetch<EventDTO>('/api/events', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateEvent: (id: string, patch: EventPatch) =>
    apiFetch<EventDTO>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  deleteEvent: (id: string) => apiFetch<undefined>(`/api/events/${id}`, { method: 'DELETE' }),

  setEventStatus: (id: string, status: 'cancelado' | 'confirmado') =>
    apiFetch<EventDTO>(`/api/events/${id}/${status === 'cancelado' ? 'cancel' : 'reinstate'}`, {
      method: 'POST',
    }),

  cancelOccurrence: (id: string, data: string, motivo?: string) =>
    apiFetch<{ ok: boolean; data: string }>(`/api/events/${id}/occurrences/${data}/cancel`, {
      method: 'POST',
      body: JSON.stringify(motivo ? { motivo } : {}),
    }),

  reinstateOccurrence: (id: string, data: string) =>
    apiFetch<{ ok: boolean; data: string }>(`/api/events/${id}/occurrences/${data}/reinstate`, {
      method: 'POST',
    }),

  eventHistory: (id: string) => apiFetch<HistoryEntry[]>(`/api/events/${id}/history`),

  createSequence: (input: SequenceInput) =>
    apiFetch<SequenceResult>('/api/sequences', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  changelog: (params: { limit?: number; offset?: number; eventoId?: string } = {}) =>
    apiFetch<ChangelogEntry[]>(`/api/changelog${qs(params)}`),

  // ---------------------------------------------------------------- admin / categorias
  createCategory: (input: Pick<Categoria, 'nome' | 'cor'> & { ordem?: number }) =>
    apiFetch<Categoria>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateCategory: (id: string, patch: Partial<Pick<Categoria, 'nome' | 'cor' | 'ordem'>>) =>
    apiFetch<Categoria>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  deleteCategory: (id: string) => apiFetch<undefined>(`/api/categories/${id}`, { method: 'DELETE' }),

  // ---------------------------------------------------------------- admin / comunidades
  createCommunity: (input: Pick<Comunidade, 'nome'> & { endereco?: string | null; bairro?: string | null; ordem?: number }) =>
    apiFetch<Comunidade>('/api/communities', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateCommunity: (id: string, patch: Partial<Pick<Comunidade, 'nome' | 'endereco' | 'bairro' | 'ordem'>>) =>
    apiFetch<Comunidade>(`/api/communities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  deleteCommunity: (id: string) => apiFetch<undefined>(`/api/communities/${id}`, { method: 'DELETE' }),

  // ---------------------------------------------------------------- admin / institucional
  updateInstitution: (patch: InstitutionInput) =>
    apiFetch<Institution>('/api/institution', {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),
};