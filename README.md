# Centro Universitário Internacional UNINTER
## Escola Superior Politécnica – ESP
### Atividade Extensionista II: Tecnologia Aplicada à Inclusão Digital – Projeto
**Curso:** Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (CST ADS)

---

## 👥 Equipe de Desenvolvimento

| Aluno | RU |
| :--- | :--- |
| **Wallace Fernando Guedes da Silva** | **5146520** |
| **Pablo Patrick Machado** | **5200651** |

---

## 📌 Identificação do Projeto Extensionista

- **Título do Projeto:** Desenvolvimento de Aplicação Web para Digitalização e Consulta do Calendário Paroquial
- **Setor de Aplicação:** Paróquia Nossa Senhora de Fátima e São Francisco de Paula — Presidente Venceslau / SP
- **Etapa:** Trabalho Final (100% da Nota)
- **Repositório Oficial:** [https://github.com/Pablojcw/Calendario_paroquial](https://github.com/Pablojcw/Calendario_paroquial)
- **Fork de Desenvolvimento:** [https://github.com/wallace-pv/Calendario_paroquial](https://github.com/wallace-pv/Calendario_paroquial)
- **Vídeo de Demonstração Prática (YouTube):** *[Inserir Link do Vídeo de até 5 min]*

---

## 🎯 Objetivos de Desenvolvimento Sustentável (ODS)

O projeto está formalmente alinhado às diretrizes da Agenda 2030 da ONU, atendendo a dois Objetivos de Desenvolvimento Sustentável aprovados na etapa de validação da proposta:

- 🏗️ **ODS 09 — Indústria, Inovação e Infraestrutura**: Implementação de infraestrutura tecnológica digital moderna (SPA React + API REST + Banco em Nuvem Serverless) para substituir processos manuais e publicações impressas.
- 🏙️ **ODS 11 — Cidades e Comunidades Sustentáveis**: Fortalecimento da comunidade local de Presidente Venceslau/SP por meio do acesso democrático, gratuito e inclusivo a informações sobre eventos culturais, celebrações religiosas e campanhas sociais.

---

## 📋 Objetivos do Projeto (Proposta Aprovada)

1. **Desenvolver uma página web interativa** para a digitalização do calendário paroquial físico utilizando as tecnologias React, TypeScript e CSS moderno, garantindo design responsivo para dispositivos móveis e usabilidade para todas as faixas etárias da comunidade.
2. **Disponibilizar a aplicação em nuvem** através de serviços modernos de hospedagem (Neon PostgreSQL + Vercel/Render), garantindo fácil acesso via web link para os fiéis e a secretaria paroquial.
3. **Facilitar a consulta e a navegação da programação anual de eventos** da paróquia (totalizando 1.147 eventos oficiais catalogados), promovendo a inclusão digital e o engajamento comunitário através da tecnologia.

---

## 🕊️ Contexto Social & Inclusão Digital

A **Paróquia Nossa Senhora de Fátima e São Francisco de Paula**, sediada em Presidente Venceslau/SP (fundada em 1931), coordena a Igreja Matriz e **12 capelas** distribuídas por bairros urbanos e rurais do município.

Historicamente, o calendário paroquial era distribuído exclusivamente em livretos físicos impressos em papel. Esse modelo gerava:
- **Exclusão de fiéis e moradores** que não tinham acesso ao livreto físico.
- **Dificuldade de consulta em mobilidade** (especialmente para jovens e idosos que utilizam smartphones).
- **Desperdício ecológico e custo financeiro** recorrente de impressão.

Com a aplicação desenvolvida nesta Atividade Extensionista, a comunidade agora conta com um **portal web responsivo, rápido e gratuito**, com filtros por capela, categorias temáticas, horários de missas, fotos e rotas no Google Maps para cada uma das 12 capelas.

---

## 🧱 Arquitetura Tecnológica do Software

O sistema foi estruturado como um monorepo profissional utilizando TypeScript em toda a pilha:

```
Calendario_paroquial/
├── backend/                       # API REST em Fastify 5 + TypeScript
│   ├── src/
│   │   ├── modules/events/        # Consultas otimizadas da agenda e DTOs
│   │   ├── modules/auth/          # Autenticação JWT com hash bcrypt (custo 12)
│   │   ├── modules/categories/    # Gestão das 9 categorias litúrgicas/pastorais
│   │   ├── modules/communities/   # Gestão da Matriz e das 12 capelas
│   │   ├── modules/institution/   # Informações institucionais e contatos
│   │   ├── modules/sequences/     # Gerador de novenas e tríduos
│   │   └── db/pool.ts             # Pool PostgreSQL com suporte SSL para Neon Cloud
│   ├── scripts/
│   │   ├── agenda-2026.csv        # 1.147 eventos reais da agenda 2026
│   │   ├── import-csv.ts          # Script modular de ingestão (suporta 2026, 2027)
│   │   └── sync-neon.ts           # Sincronização automatizada do banco na nuvem
│   └── sql/schema.sql             # Definição DDL relacional em PostgreSQL
├── frontend/                      # Single Page Application (React 18 + Vite 6)
│   ├── src/
│   │   ├── components/            # MonthCalendar, OccurrenceList, Layouts
│   │   ├── pages/                 # Calendário, Missas, Capelas, Atividades, Sacramentos, Admin
│   │   ├── lib/liturgy.ts         # Calendário litúrgico modular por ano (2026, 2027...)
│   │   └── styles/global.css      # Design tokens oficiais da paróquia (#2d4796, #4ab5ef, #fdf70b)
│   └── public/images/capelas/     # Fotos reais da Matriz e das 12 capelas
```

---

## 📊 Dados e Categorias Oficiais Ingeridas

A base de dados conta com **1.147 eventos reais catalogados**, distribuídos nas 9 categorias oficiais:

| Categoria | Eventos | Cor | Finalidade |
| :--- | :---: | :---: | :--- |
| **Missa** | 627 | `#1d4ed8` | Missas na Matriz e nas 12 capelas |
| **Devoções e Oração** | 195 | `#7c3aed` | Terços dos Homens, Mães Orantes, Cenáculos |
| **Celebração da Palavra** | 84 | `#0284c7` | Celebrações com ministros extraordinários |
| **Acampamentos e Retiros** | 68 | `#d97706` | Acampamentos de jovens, casais e retiros |
| **Novenas e Tríduos** | 60 | `#be185d` | Sequências devocionais aos padroeiros |
| **Catequese e Formação** | 48 | `#059669` | Encontros de catequese infantil e adultos |
| **Reuniões e Clero** | 35 | `#475569` | Reuniões do CPP e conselhos paroquiais |
| **Eventos Sociais e Festas** | 17 | `#ea580c` | Quermesses, almoços comunitários |
| **Sacramentos e Bênçãos** | 13 | `#9333ea` | Batismos comunitários e matrimônios |
| **TOTAL** | **1.147** | — | **100% de eventos públicos e catalogados** |

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js ≥ 20.x
- npm ≥ 10.x
- Conexão à Internet (para o banco Neon PostgreSQL)

### 1. Clonar e Instalar
```bash
git clone https://github.com/Pablojcw/Calendario_paroquial.git
cd Calendario_paroquial
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o modelo de configuração:
```bash
cp backend/.env.example backend/.env
```
Preencha a `DATABASE_URL` no arquivo `backend/.env` com a URL do banco Neon ou PostgreSQL local.

### 3. Executar em Desenvolvimento
```bash
# Inicia a API Fastify (porta 3002) e o Frontend Vite (porta 5173) simultaneamente:
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API Backend:** [http://localhost:3002](http://localhost:3002)
- **Endpoint da Agenda:** [http://localhost:3002/api/events/public?from=2026-01-01&to=2026-12-31](http://localhost:3002/api/events/public?from=2026-01-01&to=2026-12-31)

### 4. Compilar para Produção (Build)
```bash
npm run typecheck    # Verificação estrita de tipos TypeScript (0 erros)
npm run build        # Gera o bundle otimizado em dist/
```

---

## 🛠️ Comandos de Ingestão e Suporte ao Calendário de 2027

O sistema foi concebido com arquitetura modular para que novas edições da agenda pastoral sejam incorporadas sem retrabalho:

```bash
# Importar agenda de 2026:
npm run db:import 2026 --workspace=@paroquia/backend

# Importar agenda futura de 2027:
npm run db:import 2027 --workspace=@paroquia/backend
```

---

## 📜 Declaração de Autoria e Finalidade Acadêmica

Este software foi idealizado, projetado e desenvolvido pelos discentes **Wallace Fernando Guedes da Silva** e **Pablo Patrick Machado** como trabalho de conclusão da disciplina **Atividade Extensionista II: Tecnologia Aplicada à Inclusão Digital – Projeto**, do curso **Superior de Tecnologia em Análise e Desenvolvimento de Sistemas** do **Centro Universitário Internacional UNINTER**.

Todos os direitos cedidos à **Paróquia Nossa Senhora de Fátima e São Francisco de Paula** de Presidente Venceslau / SP para benefício de sua comunidade.