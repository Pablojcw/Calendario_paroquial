-- ============================================================
-- Calendário Paroquial Digital — Schema PostgreSQL
-- Paróquia Nossa Senhora de Fátima e São Francisco de Paula
-- Executar via: npm run db:setup  (scripts/setup-db.ts)
-- Idempotente: pode rodar mais de uma vez.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- ------------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE event_status AS ENUM ('confirmado', 'cancelado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE event_visibility AS ENUM ('publico', 'interno');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE event_recurrence AS ENUM ('nenhuma', 'semanal', 'mensal');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'editor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------
-- Comunidades (Matriz + capelas)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL UNIQUE,
  endereco   text,
  bairro     text,
  ordem      integer NOT NULL DEFAULT 0,
  ativa      boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Categorias (Missa, Novena, Catequese, ...) — administráveis, com cor
-- para o calendário.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome  text NOT NULL UNIQUE,
  cor   text NOT NULL DEFAULT '#4f46e5',
  ordem integer NOT NULL DEFAULT 0
);

INSERT INTO categories (nome, cor, ordem)
VALUES
  ('Missa', '#4f46e5', 10),
  ('Atividade Pastoral / Grupo de Oração', '#0d9488', 20),
  ('Catequese', '#db2777', 30),
  ('Batismo', '#7c3aed', 40),
  ('Matrimônio / Casamento', '#c2410c', 50),
  ('Novena', '#e11d48', 60),
  ('Tríduo', '#be123c', 70),
  ('Festa / Celebração Especial', '#ca8a04', 80),
  ('Acampamento / Retiro', '#059669', 90),
  ('Reunião Administrativa', '#64748b', 100),
  ('Ação Social', '#16a34a', 110)
ON CONFLICT (nome) DO NOTHING;

-- ------------------------------------------------------------------
-- Usuários (administração da paróquia)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL,
  email      text NOT NULL UNIQUE,
  senha_hash text NOT NULL,
  papel      user_role NOT NULL DEFAULT 'admin',
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Eventos
--
-- Dois usos possíveis para a MESMA tabela:
--   1. Evento único: recorrencia='nenhuma', data_inicio = data do evento.
--      data_fim opcional marca eventos multidiários (ex.: retiro).
--   2. Série recorrente: recorrencia='semanal' (dia_semana) ou
--      'mensal' (dia_mes — dia fixo do mês, OU semana_mes+dia_semana —
--      ex.: 2º domingo). Ocorrências são computadas na consulta;
--      data_fim (inclusive) limita a série.
--
-- Novenas/Tríduos: um evento "pai" (guarda-chuva) + N eventos filhos
-- com evento_pai_id preenchido (cada filho tem sua própria data).
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          text NOT NULL,
  descricao       text,
  responsavel     text,
  local           text,               -- livre (ex.: "Salão paroquial", "Praça central")
  categoria_id    uuid REFERENCES categories(id) ON DELETE SET NULL,
  comunidade_id   uuid REFERENCES communities(id) ON DELETE SET NULL,
  data_inicio     date NOT NULL,
  hora            time,
  data_fim        date,               -- série: limite (inclusive); evento único multidiário
  recorrencia     event_recurrence NOT NULL DEFAULT 'nenhuma',
  dia_semana      smallint CHECK (dia_semana IS NULL OR dia_semana BETWEEN 0 AND 6), -- 0=domingo
  dia_mes         smallint CHECK (dia_mes IS NULL OR dia_mes BETWEEN 1 AND 31),
  semana_mes      smallint CHECK (semana_mes IS NULL OR semana_mes BETWEEN 1 AND 5), -- 5 = última
  status          event_status NOT NULL DEFAULT 'confirmado',
  visibilidade    event_visibility NOT NULL DEFAULT 'publico',
  evento_pai_id   uuid REFERENCES events(id) ON DELETE SET NULL,
  criado_por      uuid REFERENCES users(id) ON DELETE SET NULL,
  atualizado_por  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_recurrencia_semanal CHECK (
    recorrencia <> 'semanal' OR (dia_semana IS NOT NULL AND dia_mes IS NULL AND semana_mes IS NULL)
  ),
  CONSTRAINT chk_recurrencia_mensal CHECK (
    recorrencia <> 'mensal'
    OR (dia_mes IS NOT NULL AND semana_mes IS NULL)
    OR (dia_mes IS NULL AND semana_mes IS NOT NULL AND dia_semana IS NOT NULL)
  ),
  CONSTRAINT chk_data_fim CHECK (data_fim IS NULL OR data_fim >= data_inicio),
  CONSTRAINT chk_unico_sem_recorrencia CHECK (
    recorrencia = 'nenhuma'
    OR dia_semana IS NOT NULL
    OR dia_mes IS NOT NULL
    OR semana_mes IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_events_data        ON events (data_inicio);
CREATE INDEX IF NOT EXISTS idx_events_comunidade  ON events (comunidade_id);
CREATE INDEX IF NOT EXISTS idx_events_categoria   ON events (categoria_id);
CREATE INDEX IF NOT EXISTS idx_events_pai         ON events (evento_pai_id);
CREATE INDEX IF NOT EXISTS idx_events_visibilidade ON events (visibilidade, status);

-- ------------------------------------------------------------------
-- Cancelamento de UMA ocorrência específica de uma série
-- (ex.: o Terço dos Homens não acontece na terça de carnaval,
--  mas continua nas demais). Também serve para eventos únicos.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_occurrence_cancellations (
  evento_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  data      date NOT NULL,
  motivo    text,
  criado_por uuid REFERENCES users(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (evento_id, data)
);

-- ------------------------------------------------------------------
-- Log de alterações (histórico)
-- acao: create | update | cancel | reinstate | delete |
--       occurrence_cancel | occurrence_reinstate | sequence_create
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS change_log (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  evento_id       uuid REFERENCES events(id) ON DELETE SET NULL,
  serie_id        uuid REFERENCES events(id) ON DELETE SET NULL, -- pai quando ação envolve sequência
  usuario_id      uuid REFERENCES users(id) ON DELETE SET NULL,
  acao            text NOT NULL,
  campos_alterados jsonb,
  observacao      text,
  criado_em       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_changelog_evento  ON change_log (evento_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_serie   ON change_log (serie_id, criado_em DESC);

-- ------------------------------------------------------------------
-- Página institucional (linha única)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parish_info (
  id                   smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nome                 text NOT NULL DEFAULT 'Paróquia Nossa Senhora de Fátima e São Francisco de Paula',
  endereco             text,
  telefone             text,
  whatsapp             text,
  email                text,
  expediente           text,
  instagram            text,
  ano_fundacao         integer,
  administrador_paroquial text,
  conteudo             text,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

INSERT INTO parish_info (id) VALUES (1) ON CONFLICT (id) DO NOTHING;