# Calendário Paroquial Digital

Sistema para publicação do calendário de atividades da **Paróquia Nossa Senhora de Fátima e São Francisco de Paula**.

- **Público:** a comunidade acompanha as celebrações, reuniões e eventos da paróquia em um calendário online.
- **Administrativo:** a secretaria paroquial cadastra e gerencia eventos, com recorrências (diária, semanal, mensal), séries, categorias, comunidades e avisos.

O projeto é um monorepo com dois pacotes — **API** (Fastify + PostgreSQL) e **Web** (React + Vite) — gerenciados com npm workspaces.

---

## Estrutura do projeto

```
paroquia-web/
├── backend/                # API REST (Fastify + TypeScript)
│   ├── src/
│   │   ├── modules/        # auth, events, categories, communities, institution, sequences, changelog
│   │   ├── config/         # env, banco de dados, plugins
│   │   └── server.ts       # entrada da aplicação
│   ├── scripts/            # setup-db, seed, import-csv (importa agenda em CSV)
│   ├── sql/schema.sql      # schema completo do banco
│   ├── tests/              # testes da API
│   ├── .env.example        # modelo de configuração
│   └── package.json
├── frontend/               # SPA (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # MonthCalendar, OccurrenceList, etc.
│   │   ├── pages/          # CalendarPage, LogarPage, Dashboard, Administracao, etc.
│   │   ├── lib/            # api client, datas
│   │   ├── styles/         # global.css
│   │   └── main.tsx
│   └── package.json
├── docker-compose.yml      # sobe o PostgreSQL (opcional)
├── package.json            # workspaces + scripts raiz
└── README.md
```

---

## Requisitos

- **Node.js** ≥ 20
- **PostgreSQL** ≥ 14 (local, ou via `docker-compose.yml`)
- npm (vem com o Node)

---

## Como rodar localmente

### 1. Configure o banco de dados

**Opção A — PostgreSQL via Docker (recomendado):**

```bash
docker compose up -d
```

Cria o banco `paroquia`, usuário `postgres`, senha `postgres`, na porta `5432`.

**Opção B — PostgreSQL já instalado:**

Crie um banco chamado `paroquia` e um usuário com acesso a ele. Ajuste a `DATABASE_URL` no `backend/.env` de acordo.

### 2. Configure o ambiente

```bash
cp backend/.env.example backend/.env
```

Edite o `backend/.env`:

- `DATABASE_URL` — conexão com o PostgreSQL (senha padrão do Docker: `postgres`).
- `JWT_SECRET` — gere um secret longo: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- `CORS_ORIGIN` — URL do frontend (`http://localhost:5173` no desenvolvimento).
- `PORT` — porta da API (ex.: `3002`).

### 3. Instale as dependências e prepare o banco

```bash
npm install          # instala workspaces (backend + frontend)
npm run db:setup     # aplica backend/sql/schema.sql (cria o banco se precisar)
npm run db:seed      # cria categoria/administrador padrão + dados iniciais
```

> `npm run db:seed` usa as variáveis `BOOTSTRAP_ADMIN_*` do `.env` para criar o primeiro administrador.

### 4. Importe a agenda do ano (opcional)

Os dados já vêm da importação inicial, mas para (re)importar completo:

```bash
npm run db:import -- backend/scripts/agenda-2026.csv
```

O importador também aceita um CSV próprio: veja `backend/scripts/import-exemplo.csv`.

### 5. Suba a aplicação

```bash
npm run dev
```

- **Web:** http://localhost:5173
- **API:** http://localhost:3002

### Login administrativo

Use o e-mail e a senha do administrador criado no seed (veja `BOOTSTRAP_ADMIN_*` no `.env`).

Em **produção**, desligue o registro aberto: `AUTH_REGISTER_OPEN=false`.

---

## Scripts principais

| Comando                    | Descrição                                        |
| -------------------------- | ------------------------------------------------ |
| `npm run dev`              | Sobe backend e frontend juntos (dev com reload)  |
| `npm run dev:backend`      | Sobe apenas a API                                |
| `npm run dev:frontend`     | Sobe apenas o frontend                           |
| `npm run build`            | Compila backend e frontend para produção         |
| `npm run typecheck`        | Checagem de tipos (backend + frontend)           |
| `npm run lint`             | ESLint nos dois pacotes                          |
| `npm run test`             | Testes (backend)                                 |
| `npm run db:setup`         | Aplica o schema no banco                         |
| `npm run db:seed`          | Dados iniciais + primeiro administrador          |
| `npm run db:import -- <csv>` | Importa eventos a partir de um CSV             |
| `npm run format`           | Formata o código com Prettier                    |

---

## API — visão geral

A API fica em `/api` e usa JWT (Bearer token) nas rotas administrativas. As rotas públicas de eventos não exigem login.

### Rotas públicas

| Método | Rota                          | Descrição                               |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/api/events/public`          | Ocorrências num intervalo: `from`/`to` (YYYY-MM-DD). Filtros opcionais: `categoria`/`comunidade` (id ou nome) |
| GET    | `/api/events/public/proximos` | Próximas ocorrências: `limit` (padrão 5) |
| GET    | `/api/events/public/:id`      | Detalhe de uma ocorrência pública        |
| GET    | `/api/categories`             | Lista de categorias                      |
| GET    | `/api/communities`            | Lista de comunidades                     |
| GET    | `/api/institution`            | Informações institucionais               |

### Rotas administrativas (autenticadas)

| Método | Rota                              | Descrição                  |
| ------ | --------------------------------- | -------------------------- |
| POST   | `/api/auth/register`              | Criar usuário (bootstrap — ligue/desligue via `AUTH_REGISTER_OPEN`) |
| POST   | `/api/auth/login`                 | Autenticar e obter token   |
| GET    | `/api/auth/me`                    | Dados do usuário logado    |
| GET    | `/api/events`                     | Lista todos os eventos (com recorrências) |
| GET    | `/api/events/:id`                 | Evento + ocorrências       |
| POST   | `/api/events`                     | Criar evento               |
| PUT    | `/api/events/:id`                 | Atualizar evento           |
| DELETE | `/api/events/:id`                 | Excluir evento             |
| POST   | `/api/events/:id/cancel`          | Cancelar evento            |
| POST   | `/api/events/:id/reinstate`       | Reativar evento cancelado  |
| POST   | `/api/events/:id/duplicate`       | Duplicar evento            |
| POST   | `/api/events/:id/import`          | Importar dados de um dia   |
| GET    | `/api/events/:id/history`         | Histórico de alterações    |
| POST/PUT/DELETE | `/api/categories[/:id]`   | CRUD de categorias         |
| POST/PUT/DELETE | `/api/communities[/:id]` | CRUD de comunidades        |
| PUT    | `/api/institution`                | Atualizar informações institucionais |
| POST   | `/api/sequences`                  | Criar sequência de eventos |
| GET    | `/api/changelog`                  | Registro de alterações     |

---

## Importação de agenda (formato CSV)

Primeira linha = cabeçalho. Colunas:

```
titulo,categoria,comunidade,data,hora,responsavel,descricao,visibilidade,
recorrencia,dia_semana,dia_mes,semana_mes,data_fim,local,serie
```

- `data` — `YYYY-MM-DD` (usada como data-base de recorrências).
- `recorrencia` — `unica | diaria | semanal | mensal`.
- `dia_semana` — `0` (domingo) a `6` (sábado), ou nome (ex.: `terça-feira`, `sábado`).
- `dia_mes`/`semana_mes` — usados na recorrência mensal.
- `data_fim` — fim da recorrência (vazio se não se repete/fim indeterminado).
- `visibilidade` — `publica | interna`.
- `serie` — nomenclatura da sequência cronológica (agrupa eventos que se repetem ao longo do ano mantendo a ordem); vazio se o evento é independente.

A importação é **atômica** (ou tudo entra, ou nada) e cria categorias/comunidades automaticamente quando ainda não existem.

Veja `backend/scripts/import-exemplo.csv` e `backend/scripts/agenda-2026.csv` (agenda real do ano).

---

## Configuração (variáveis de ambiente)

| Variável               | Padrão                        | Descrição                                      |
| ---------------------- | ----------------------------- | ---------------------------------------------- |
| `DATABASE_URL`         | `postgres://postgres:postgres@localhost:5432/paroquia` | Conexão com o PostgreSQL |
| `JWT_SECRET`           | —                             | Segredo para assinar os tokens (obrigatório)   |
| `NODE_ENV`             | `development`                 | Ambiente (`development`/`test`/`production`)   |
| `PORT`                 | `3000`                        | Porta da API                                   |
| `CORS_ORIGIN`          | `http://localhost:5173`       | Origens permitidas no CORS (separadas por vírgula) |
| `AUTH_REGISTER_OPEN`   | `false`                       | Permite criar administrador via `/register` (bootstrap) |
| `BOOTSTRAP_ADMIN_NOME` | `Administrador`               | Nome do admin padrão (seed)                    |
| `BOOTSTRAP_ADMIN_EMAIL`| `admin@paroquia.local`        | E-mail do admin padrão (seed)                  |
| `BOOTSTRAP_ADMIN_SENHA`| `trocar-senha-123`            | Senha do admin padrão (seed) — **troque em produção** |

> Nunca versione o `.env` real. Use `.env.example` como modelo.

---

## Tecnologias

| Camada    | Stack                                                        |
| --------- | ------------------------------------------------------------ |
| Backend   | Fastify 5, TypeScript, PostgreSQL (pg), JWT, Zod             |
| Frontend  | React 18, Vite 6, TypeScript, React Router, React Query, TanStack Query |
| Ferramentas | ESLint, Prettier, Vitest (backend), npm workspaces        |

---

## Produção

1. `NODE_ENV=production`, `AUTH_REGISTER_OPEN=false`, `JWT_SECRET` forte e `DATABASE_URL` apontando para o banco de produção.
2. Compile: `npm run build`.
3. Suba a API: `npm start` (dentro de `backend/`) ou sirva o build do frontend em qualquer host estático apontando o proxy `/api` para a API.