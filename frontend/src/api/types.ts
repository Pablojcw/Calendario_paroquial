export type Recorrencia = 'nenhuma' | 'semanal' | 'mensal';
export type Status = 'confirmado' | 'cancelado';
export type Visibilidade = 'publico' | 'interno';
export type Papel = 'admin' | 'editor';

export type Categoria = {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
};

export type Comunidade = {
  id: string;
  nome: string;
  endereco: string | null;
  bairro: string | null;
  ordem: number;
  ativa: boolean;
};

export type CategoriaDto = { id: string; nome: string; cor: string } | null;
export type ComunidadeDto = { id: string; nome: string; bairro: string | null } | null;

export type SerieInfo = {
  id: string;
  titulo: string;
  dia: number;
  total: number;
};

export type PublicOccurrence = {
  ocorrenciaId: string;
  eventoId: string;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  local: string | null;
  categoria: CategoriaDto;
  comunidade: ComunidadeDto;
  data: string;
  hora: string | null;
  recorrencia: Recorrencia;
  isRecorrente: boolean;
  status: Status;
  serie: SerieInfo | null;
};

export type EventDTO = {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  local: string | null;
  categoria: CategoriaDto;
  comunidade: ComunidadeDto;
  dataInicio: string;
  hora: string | null;
  dataFim: string | null;
  recorrencia: Recorrencia;
  diaSemana: number | null;
  diaMes: number | null;
  semanaMes: number | null;
  status: Status;
  visibilidade: Visibilidade;
  eventoPaiId: string | null;
  paiTitulo: string | null;
  criadoPor: { id: string; nome: string } | null;
  atualizadoPor: { id: string; nome: string } | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type EventDetail = EventDTO & {
  filhos: EventDTO[];
  pai: EventDTO | null;
};

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type EventInput = {
  titulo: string;
  descricao?: string | null;
  responsavel?: string | null;
  local?: string | null;
  categoriaId?: string | null;
  comunidadeId?: string | null;
  dataInicio: string;
  hora?: string | null;
  dataFim?: string | null;
  recorrencia?: Recorrencia;
  diaSemana?: number | null;
  diaMes?: number | null;
  semanaMes?: number | null;
  status?: Status;
  visibilidade?: Visibilidade;
  eventoPaiId?: string | null;
};

export type EventPatch = Partial<EventInput>;

export type SequenceInput = {
  titulo: string;
  descricao?: string | null;
  responsavel?: string | null;
  local?: string | null;
  categoriaId?: string | null;
  comunidadeId?: string | null;
  dataInicio: string;
  hora?: string | null;
  intervaloDias?: number;
  dias: number;
  visibilidade?: Visibilidade;
};

export type SequenceResult = EventDTO & { filhos: EventDTO[] };

export type PublicRangeParams = {
  from: string;
  to: string;
  comunidadeId?: string;
  categoriaId?: string;
};

export type EventListParams = {
  from?: string;
  to?: string;
  comunidadeId?: string;
  categoriaId?: string;
  status?: Status;
  visibilidade?: Visibilidade;
  q?: string;
  limit?: number;
  offset?: number;
};

export type HistoryEntry = {
  id: string;
  acao: string;
  observacao: string | null;
  camposAlterados: Record<string, unknown> | null;
  usuario: { id: string; nome: string } | null;
  criadoEm: string;
};

export type ChangelogEntry = {
  id: string;
  eventoId: string | null;
  serieId: string | null;
  eventoTitulo: string | null;
  acao: string;
  acaoLabel: string;
  observacao: string | null;
  camposAlterados: Record<string, unknown> | null;
  usuario: { id: string; nome: string } | null;
  criadoEm: string;
};

export type Institution = {
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
};

export type InstitutionInput = Partial<Institution>;