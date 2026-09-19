import { Link } from 'react-router-dom';

interface ActivityItem {
  dia: string;
  atividade: string;
  horario: string;
}

interface CommunityActivities {
  comunidade: string;
  itens: ActivityItem[];
}

const ATIVIDADES_LISTA: CommunityActivities[] = [
  {
    comunidade: 'Matriz',
    itens: [
      { dia: 'Segunda-feira', atividade: 'Cenáculo da Divina Misericórdia', horario: '20h00' },
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: 'Terça-feira', atividade: 'Reunião Pastoral Sobriedade (salão paroquial)', horario: '20h00' },
      { dia: 'Quarta-feira', atividade: 'Catequese com Pe. Rafael', horario: '20h00' },
      { dia: 'Quinta-feira', atividade: 'Hora da Misericórdia', horario: '15h00' },
      { dia: 'Quinta-feira', atividade: 'Adoração "Morada"', horario: '20h30' },
      { dia: 'Sexta-feira', atividade: 'Mães Orantes', horario: '18h00' },
      { dia: 'Sábado', atividade: 'Infância Missionária', horario: '16h00' },
      { dia: 'Sábado', atividade: 'Pastoral do Adolescente', horario: '17h30' },
      { dia: 'Sábado', atividade: 'Grupo de Jovens Bento XVI', horario: '19h30' },
    ],
  },
  {
    comunidade: 'Capela Divina Misericórdia',
    itens: [
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: '1ª Sexta do mês', atividade: 'Celebração com Seminarista', horario: '19h30' },
      { dia: '2º Domingo do mês', atividade: 'Celebração com Seminarista', horario: '08h00' },
    ],
  },
  {
    comunidade: 'Capela Divino Espírito Santo',
    itens: [
      { dia: 'Segunda-feira', atividade: 'Cenáculo da Divina Misericórdia', horario: '20h00' },
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: 'Quarta-feira', atividade: 'Mães Orantes', horario: '18h30' },
      { dia: 'Sexta-feira', atividade: 'Celebração da Palavra com MECE’s', horario: '19h30' },
      { dia: '3° Sábado do mês', atividade: 'Ofício da Imaculada Conceição', horario: '06h00' },
      { dia: '3º Domingo do mês', atividade: 'Celebração com Seminarista', horario: '09h30' },
    ],
  },
  {
    comunidade: 'Capela Nossa Senhora Aparecida',
    itens: [
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: 'Quinta-feira', atividade: 'Círculo de Leitores Católicos', horario: '19h30' },
      { dia: 'Sexta-feira', atividade: 'Mães Orantes', horario: '18h30' },
      { dia: 'Sábado', atividade: 'Ofício de Nossa Senhora', horario: '06h30' },
      { dia: 'Sábado', atividade: 'Infância Missionária', horario: '10h00' },
      { dia: 'Sábado', atividade: 'Santa Missa', horario: '18h00' },
    ],
  },
  {
    comunidade: 'Capela Nosso Senhor do Bonfim',
    itens: [
      { dia: 'Segunda-feira', atividade: 'Terço das Mulheres', horario: '20h00' },
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: 'Sábado', atividade: 'Infância Missionária', horario: '16h00' },
      { dia: 'Domingo', atividade: 'Santa Missa Fixa', horario: '08h30' },
    ],
  },
  {
    comunidade: 'Capela Nossa Senhora do Carmo',
    itens: [
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: 'Quarta-feira', atividade: 'Terço de N. S. do Apocalipse', horario: '19h00' },
      { dia: 'Sexta-feira', atividade: 'Celebração da Palavra com MECE’s', horario: '19h30' },
      { dia: '1º Domingo do mês', atividade: 'Celebração com Seminarista', horario: '09h30' },
      { dia: '1º Sábado do mês', atividade: 'Catequese para o Batismo', horario: '18h00 às 21h00' },
    ],
  },
  {
    comunidade: 'Capela São Francisco de Assis',
    itens: [
      { dia: 'Segunda-feira', atividade: 'Mães Orantes', horario: '18h15' },
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: 'Quinta-feira', atividade: 'Adoração Silenciosa', horario: '20h00' },
      { dia: '2ª Sexta do mês', atividade: 'Celebração com Seminarista', horario: '19h30' },
      { dia: '3º Domingo do mês', atividade: 'Celebração com Seminarista', horario: '08h00' },
    ],
  },
  {
    comunidade: 'Capela São Judas Tadeu',
    itens: [
      { dia: 'Terça-feira', atividade: 'Grupo de Oração', horario: '20h00' },
      { dia: 'Quinta-feira', atividade: 'Mães Orantes', horario: '18h30' },
      { dia: 'Domingo', atividade: 'Santa Missa Fixa', horario: '07h00' },
    ],
  },
  {
    comunidade: 'Capela Santa Edwiges',
    itens: [
      { dia: 'Segunda-feira', atividade: 'Terço das Mulheres', horario: '19h30' },
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: 'Domingo', atividade: 'Santa Missa Fixa', horario: '17h00' },
    ],
  },
  {
    comunidade: 'Capela Santa Luzia',
    itens: [
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: '4ª Sexta do mês', atividade: 'Celebração com Seminarista', horario: '19h30' },
      { dia: '1º Domingo do mês', atividade: 'Celebração com Seminarista', horario: '08h00' },
    ],
  },
  {
    comunidade: 'Capela Santo Expedito',
    itens: [
      { dia: 'Segunda-feira', atividade: 'Novena das Mãos Ensanguentadas de Jesus', horario: '19h30' },
      { dia: 'Terça-feira', atividade: 'Terço dos Homens', horario: '19h30' },
      { dia: '3ª Sexta do mês', atividade: 'Celebração com Seminarista', horario: '19h30' },
      { dia: '4º Domingo do mês', atividade: 'Celebração com Seminarista', horario: '08h00' },
    ],
  },
];

const REUNIOES_CPP = [
  { data: '17 de fevereiro', local: 'Igreja Matriz', diaSemana: 'Terça-feira' },
  { data: '14 de abril', local: 'Igreja Matriz', diaSemana: 'Terça-feira' },
  { data: '23 de junho', local: 'Igreja Matriz', diaSemana: 'Terça-feira' },
  { data: '25 de agosto', local: 'Igreja Matriz', diaSemana: 'Terça-feira' },
  { data: '20 de outubro', local: 'Igreja Matriz', diaSemana: 'Terça-feira' },
  { data: '22 de dezembro', local: 'Igreja Matriz', diaSemana: 'Terça-feira' },
];

export function PastoralActivitiesPage() {
  return (
    <div className="pastoral-page">
      <h2 className="page-title">Atividades Pastorais por Comunidade</h2>
      <p className="page-subtitle">
        Confira a grade regular de terços, grupos de oração, adorações e celebrações em cada uma das capelas de nossa paróquia.
      </p>

      {/* REUNIÕES DO CPP */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderLeft: '6px solid var(--accent)', background: '#fffef2' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📋</span> Calendário Oficial das Reuniões do CPP 2026
          </h3>
          <p style={{ color: '#475569', margin: '0 0 1rem', fontSize: '0.92rem' }}>
            Reuniões do Conselho Pastoral Paroquial com a presença do Pároco, coordenadores de pastorais, movimentos e capelas.
          </p>
          <div className="activities-table-wrap">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Dia da Semana</th>
                  <th>Local</th>
                </tr>
              </thead>
              <tbody>
                {REUNIOES_CPP.map((r) => (
                  <tr key={r.data}>
                    <td><strong>{r.data}</strong></td>
                    <td>{r.diaSemana}</td>
                    <td>{r.local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TABELAS DE ATIVIDADES POR COMUNIDADE */}
      <section>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', marginBottom: '1rem', borderBottom: '2px solid var(--secondary)', paddingBottom: '0.4rem' }}>
          <span>🙏</span> Grade Semanal e Mensal por Comunidade
        </h3>

        {ATIVIDADES_LISTA.map((bloco) => (
          <div key={bloco.comunidade} style={{ marginBottom: '1.6rem' }}>
            <div className="activities-table-wrap">
              <table className="activities-table">
                <thead>
                  <tr>
                    <th colSpan={3} className="activities-community-header">
                      ⛪ {bloco.comunidade}
                    </th>
                  </tr>
                  <tr>
                    <th style={{ width: '25%' }}>Dia / Frequência</th>
                    <th style={{ width: '55%' }}>Atividade Pastoral</th>
                    <th style={{ width: '20%' }}>Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {bloco.itens.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.dia}</strong></td>
                      <td>{item.atividade}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.horario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ margin: '0 0 0.8rem', color: 'var(--muted)' }}>
          * As atividades acima seguem o calendário oficial da Agenda Pastoral 2026. Em caso de solenidades, feriados ou eventos especiais, consulte a programação diária no calendário.
        </p>
        <Link to="/" className="btn btn--primary">
          Consultar Calendário Paroquial
        </Link>
      </div>
    </div>
  );
}
