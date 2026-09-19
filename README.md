# Paróquia Nossa Senhora de Fátima e São Francisco de Paula
### Sistema do Calendário Paroquial Digital & Portal Institucional
> **Presidente Venceslau - SP | Diocese de Presidente Prudente | Fundada em 1931**

---

## 📖 Sobre o Projeto

O **Calendário Paroquial Digital** é o portal oficial da **Paróquia Nossa Senhora de Fátima e São Francisco de Paula**. Desenvolvido com foco em modernidade, experiência de uso intuitiva em dispositivos móveis e fidelidade estrita à **Agenda Pastoral 2026**, o sistema permite que toda a comunidade católica acompanhe com clareza as missas, celebrações sacramentais, encontros pastorais e solenidades diocesanas.

O projeto foi estruturado como um monorepo modular e robusto, projetado para suportar futuras agendas anuais (como o calendário de **2027**) de forma ágil e automatizada.

---

## 🎨 Identidade Visual & UX

A interface pública e administrativa reflete as cores oficiais da paróquia e sua história:
- **Azul Escuro Real (`#2d4796`)**: Cor primária litúrgica e institucional.
- **Azul Claro Céu (`#4ab5ef`)**: Cor secundária mariana para destaques suaves e interações.
- **Amarelo Ouro Solar (`#fdf70b`)**: Destaque vibrante para datas ativas e elementos nobres.
- **Brasão Oficial de 1931**: Integrado ao cabeçalho da aplicação web.
- **Design 100% Responsivo**: Grade proporcional de calendário para smartphones com células proporcionais e badges arredondados com indicador pontilhado.

---

## ⛪ Estrutura de Páginas Públicas

1. **Calendário Geral (`/`)**: Calendário mensal interativo com indicação de solenidades litúrgicas e celebrações diárias com filtros por comunidade e categoria.
2. **Próximos Eventos (`/proximos`)**: Visão em linha do tempo dos próximos 60 dias da paróquia.
3. **Grade de Missas (`/missas`)**: Horários fixos e móveis na Igreja Matriz e nas 12 capelas, incluindo Missa de Cura e Libertação (último domingo às 19h), Missa Votiva (todo dia 13 às 15h) e Novena de Santa Teresinha (todo dia 9 às 16h).
4. **Conheça Nossas Capelas (`/capelas`)**: Catálogo fotográfico com as fotos reais de cada comunidade, bairro, endereço completo e botão para traçar rota direta no Google Maps.
5. **Atividades Pastorais (`/atividades`)**: Guia de atividades semanais e mensais (Terço dos Homens, Mães Orantes, Cenáculos, MECE's, Infância Missionária) e as datas oficiais das reuniões do CPP 2026.
6. **Catequese & Sacramentos (`/sacramentos`)**: Informações e calendários anuais de Batismo (Capela do Carmo), Matrimônio (Legitimações e Casamento Comunitário) e o cronograma dos 15 Acampamentos de 2026.
7. **A Paróquia (`/institucional`)**: Palavra do Pároco, horários de direção espiritual/confissões, expediente da secretaria e contatos.
8. **Área Restrita (`/admin`)**: Painel administrativo simplificado para a equipe paroquial gerenciar avisos, sequências de novenas/tríduos e novos eventos.

---

## 📊 Dados & Categorias Oficiais

A base de dados é populada com **1.147 eventos reais** transcritos da Agenda Pastoral impressa. Todos os eventos são **públicos** e categorizados em 9 categorias oficiais:

| Categoria | Cor Oficial | Finalidade |
| :--- | :--- | :--- |
| **Missa** | `#1d4ed8` | Missas semanais, dominicais, votivas e solenes |
| **Celebração da Palavra** | `#0284c7` | Celebrações conduzidas por ministros nas capelas |
| **Devoções e Oração** | `#7c3aed` | Terços, adorações, cenáculos e grupos de oração |
| **Novenas e Tríduos** | `#be185d` | Sequências devocionais em honra aos padroeiros |
| **Catequese e Formação** | `#059669` | Encontros catequéticos e formação de lideranças |
| **Acampamentos e Retiros** | `#d97706` | Acampamentos de jovens, casais e retiros espirituais |
| **Sacramentos e Bênçãos** | `#9333ea` | Celebrações do Batismo, Crisma, Matrimônio e Bênçãos |
| **Eventos Sociais e Festas** | `#ea580c` | Quermesses, almoços comunitários e festas dos padroeiros |
| **Reuniões e Clero** | `#475569` | Reuniões do CPP, conselhos e clero diocesano |

---

## 🛠️ Arquitetura Tecnológica

O projeto é um **monorepo** com TypeScript ponta a ponta:

```
Calendario_paroquial/
├── backend/                       # API REST Fastify 5
│   ├── src/
│   │   ├── modules/events/        # DTO, repositórios públicos/admin, schemas Zod
│   │   ├── modules/auth/          # Autenticação JWT e segurança
│   │   ├── modules/categories/    # Gestão das categorias
│   │   ├── modules/communities/   # Gestão das 12 capelas e Matriz
│   │   ├── modules/institution/   # Informações institucionais
│   │   ├── modules/sequences/     # Gerador de novenas e tríduos
│   │   ├── modules/changelog/     # Histórico de auditoria de alterações
│   │   ├── db/                    # Pool PostgreSQL (suporte local e Neon SSL)
│   │   └── server.ts              # Ponto de entrada Fastify
│   ├── scripts/
│   │   ├── agenda-2026.csv        # 1.147 eventos oficiais catalogados
│   │   ├── import-csv.ts          # Ingestão modular por ano (ex: 2026, 2027)
│   │   └── sync-neon.ts           # Sincronização automatizada com Neon Cloud
│   └── sql/schema.sql             # Definição DDL relacional em PostgreSQL
├── frontend/                      # SPA React 18 + Vite 6
│   ├── src/
│   │   ├── components/            # MonthCalendar, OccurrenceList, PublicLayout, AdminLayout
│   │   ├── pages/                 # Páginas temáticas (Calendar, Chapels, Mass, etc.)
│   │   ├── lib/liturgy.ts         # Registro litúrgico modular por ano (2026, 2027...)
│   │   └── styles/global.css      # Sistema de design tokens oficial da paróquia
│   └── public/images/capelas/     # Fotos reais das 12 capelas e da Matriz
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** ≥ 20.x
- **npm** ≥ 10.x

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/wallace-pv/Calendario_paroquial.git
cd Calendario_paroquial
npm install
```

### 2. Configurar o Ambiente Backend
Copie o modelo de variáveis de ambiente:
```bash
cp backend/.env.example backend/.env
```

Edite o arquivo `backend/.env` com a sua string de conexão com o PostgreSQL (local ou Neon) e as chaves de segurança:
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/paroquia?sslmode=require
JWT_SECRET=gere_uma_chave_secreta_longa_e_aleatoria
PORT=3002
CORS_ORIGIN=http://localhost:5173
AUTH_REGISTER_OPEN=false
BOOTSTRAP_ADMIN_NOME=Administrador Paroquial
BOOTSTRAP_ADMIN_EMAIL=admin@paroquia.local
BOOTSTRAP_ADMIN_SENHA=sua_senha_segura
```

> **Aviso de Segurança**: O arquivo `.env` está estritamente protegido no `.gitignore` e **nunca** deve ser versionado no GitHub.

### 3. Sincronizar o Banco e Ingerir os 1.147 Eventos
```bash
# Executa a criação do schema e a ingestão oficial
npm run db:sync --workspace=@paroquia/backend
```

### 4. Iniciar os Servidores em Desenvolvimento
Na raiz do monorepo, execute:
```bash
# Inicia a API (porta 3002) e o Frontend (porta 5173) simultaneamente:
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:3002](http://localhost:3002)
- **API de Eventos**: [http://localhost:3002/api/events/public?from=2026-01-01&to=2026-12-31](http://localhost:3002/api/events/public?from=2026-01-01&to=2026-12-31)

---

## 🗓️ Como Adicionar o Calendário de 2027

O sistema já está totalmente preparado para receber a agenda de 2027:

1. **Ingestão dos Eventos**:
   - Adicione o arquivo `backend/scripts/agenda-2027.csv` seguindo o formato padrão.
   - Execute o comando modular informando o ano:
     ```bash
     npm run db:import 2027 --workspace=@paroquia/backend
     ```
2. **Datas Litúrgicas**:
   - No frontend, abra [`frontend/src/lib/liturgy.ts`](frontend/src/lib/liturgy.ts) e registre o dicionário de celebrações da diocese para 2027 em `LITURGICAL_CALENDARS[2027]` ou utilize `registerLiturgicalYear(2027, { ... })`.
   - Nenhuma alteração nos componentes visuais de calendário é necessária.

---

## 🔒 Segurança e Credenciais

- As senhas dos administradores são cifradas com algoritmo **bcrypt** com fator de custo 12.
- A comunicação com o banco em nuvem requer conexão segura **TLS/SSL**.
- As rotas administrativas exigem token **JWT** Bearer no cabeçalho `Authorization`.
- Todos os segredos e dados sensíveis ficam isolados em variáveis de ambiente protegidas fora do controle de versão.

---

## 📦 Scripts Disponíveis no Monorepo

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia backend e frontend em modo desenvolvimento com live-reload |
| `npm run build` | Compila o backend e gera o bundle de produção otimizado do frontend |
| `npm run typecheck` | Executa a validação estrita de tipos TypeScript nos dois pacotes |
| `npm run lint` | Analisa a conformidade do código via ESLint |
| `npm run db:import [ano]` | Executa o script de ingestão modular de eventos em CSV |
| `npm run db:sync` | Sincroniza schemas, comunidades e categorias com a nuvem |

---

## 📜 Licença

Desenvolvido para a **Paróquia Nossa Senhora de Fátima e São Francisco de Paula** de Presidente Venceslau - SP. Todos os direitos reservados.