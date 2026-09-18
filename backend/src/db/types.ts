export type EventsRow = {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  local: string | null;
  categoria_id: string | null;
  comunidade_id: string | null;
  data_inicio: string;
  hora: string | null;
  data_fim: string | null;
  recorrencia: 'nenhuma' | 'semanal' | 'mensal';
  dia_semana: number | null;
  dia_mes: number | null;
  semana_mes: number | null;
  status: 'confirmado' | 'cancelado';
  visibilidade: 'publico' | 'interno';
  evento_pai_id: string | null;
  criado_por: string | null;
  atualizado_por: string | null;
  created_at: Date;
  updated_at: Date;
};

export type EventViewRow = EventsRow & {
  categoria_nome: string | null;
  categoria_cor: string | null;
  comunidade_nome: string | null;
  comunidade_bairro: string | null;
  pai_titulo: string | null;
  criado_por_nome: string | null;
  atualizado_por_nome: string | null;
};

export type CommunityRow = {
  id: string;
  nome: string;
  endereco: string | null;
  bairro: string | null;
  ordem: number;
  ativa: boolean;
  created_at: Date;
};

export type CategoryRow = {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
};

export type UserRow = {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  papel: 'admin' | 'editor';
  ativo: boolean;
  created_at: Date;
};

export type ChangeLogRow = {
  id: string;
  evento_id: string | null;
  serie_id: string | null;
  usuario_id: string | null;
  acao: string;
  campos_alterados: Record<string, unknown> | null;
  observacao: string | null;
  criado_em: Date;
};

export type ParishInfoRow = {
  id: number;
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
  updated_at: Date;
};

export type CancellationRow = {
  evento_id: string;
  data: string;
  motivo: string | null;
  criado_por: string | null;
  criado_em: Date;
};