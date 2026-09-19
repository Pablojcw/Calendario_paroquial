import { Link } from 'react-router-dom';

export function MassSchedulePage() {
  return (
    <div className="mass-page">
      <h2 className="page-title">Horários de Missas</h2>
      <p className="page-subtitle">
        Confira a programação das Santas Missas na Igreja Matriz e nas Capelas de nossa comunidade paroquial.
      </p>

      {/* MISSAS FIXAS - IGREJA MATRIZ */}
      <section className="mass-section">
        <h3 className="mass-section-title">
          <span>⛪</span> Missas Fixas — Igreja Matriz
        </h3>
        <div className="mass-grid">
          <div className="mass-card">
            <div className="mass-card__header">Quarta a Sexta-feira</div>
            <div className="mass-card__time">07h00</div>
            <div className="mass-card__location">Santa Missa Matinal</div>
          </div>

          <div className="mass-card">
            <div className="mass-card__header">Sábado</div>
            <div className="mass-card__time">19h30</div>
            <div className="mass-card__location">Santa Missa Vespertina</div>
          </div>

          <div className="mass-card">
            <div className="mass-card__header">Domingo pela Manhã</div>
            <div className="mass-card__time">10h00</div>
            <div className="mass-card__location">Santa Missa com as Crianças e Catequese</div>
          </div>

          <div className="mass-card">
            <div className="mass-card__header">Domingo à Noite</div>
            <div className="mass-card__time">19h00</div>
            <div className="mass-card__location">Santa Missa Dominical da Comunidade</div>
          </div>
        </div>

        <div style={{ marginTop: '1.2rem' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: '0.6rem' }}>Celebrações Especiais e Devoções na Matriz</h4>
          <div className="mass-grid">
            <div className="mass-card mass-card--special">
              <div className="mass-card__header">Missa por Cura e Libertação</div>
              <div className="mass-card__time">Todo último domingo do mês · 19h00</div>
              <div className="mass-card__location">Igreja Matriz — Oração e imposição das mãos</div>
            </div>

            <div className="mass-card mass-card--special">
              <div className="mass-card__header">Missa Votiva de Nossa Senhora de Fátima</div>
              <div className="mass-card__time">Todo dia 13 do mês · 15h00</div>
              <div className="mass-card__location">Com bênção dos objetos de devoção, imagens e água</div>
            </div>

            <div className="mass-card mass-card--special">
              <div className="mass-card__header">Encerramento da Novena de Santa Teresinha</div>
              <div className="mass-card__time">Todo dia 9 do mês · 16h00</div>
              <div className="mass-card__location">Igreja Matriz — Bênção das rosas e relíquia</div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSAS FIXAS - CAPELAS */}
      <section className="mass-section">
        <h3 className="mass-section-title">
          <span>🔔</span> Missas Fixas — Capelas
        </h3>
        <div className="mass-grid">
          <div className="mass-card">
            <div className="mass-card__header">Capela Nossa Senhora Aparecida</div>
            <div className="mass-card__time">Sábado · 18h00</div>
            <div className="mass-card__location">Bairro Ernane Murad — Rua Castro Alves, 444</div>
          </div>

          <div className="mass-card">
            <div className="mass-card__header">Capela São Judas Tadeu</div>
            <div className="mass-card__time">Domingo · 07h00</div>
            <div className="mass-card__location">Bairro Coroados — Rua Piracicaba, 233</div>
          </div>

          <div className="mass-card">
            <div className="mass-card__header">Capela Nosso Senhor do Bonfim</div>
            <div className="mass-card__time">Domingo · 08h30</div>
            <div className="mass-card__location">Bairro Vila Bonfim — Rua Monte Castelo, 77</div>
          </div>

          <div className="mass-card">
            <div className="mass-card__header">Capela Santa Edwiges</div>
            <div className="mass-card__time">Domingo · 17h00</div>
            <div className="mass-card__location">Bairro Augusto Pereira — Rua Carlos Bueno da Fonseca</div>
          </div>
        </div>
      </section>

      {/* MISSAS MÓVEIS NAS CAPELAS */}
      <section className="mass-section">
        <h3 className="mass-section-title">
          <span>🕊️</span> Missas Móveis — Capelas
        </h3>
        <p className="page-subtitle" style={{ marginBottom: '1rem' }}>
          Celebrações que alternam semanalmente entre as capelas, sempre com alegria e comunhão fraterna.
        </p>

        <div className="mass-grid">
          <div className="mass-card">
            <div className="mass-card__header">Quintas-feiras · 19h30</div>
            <div className="mass-card__time">Escala Rotativa</div>
            <div className="mass-card__location">
              Celebrada alternadamente nas seguintes comunidades:
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', color: 'var(--ink)' }}>
                <li>Capela São Francisco de Assis (Faive)</li>
                <li>Capela Divino Espírito Santo (Res. Maximino)</li>
                <li>Capela Santa Luzia (Vila Luiza)</li>
                <li>Capela Nossa Senhora Desatadora dos Nós (Aymoré)</li>
              </ul>
            </div>
          </div>

          <div className="mass-card">
            <div className="mass-card__header">Sextas-feiras · 19h30</div>
            <div className="mass-card__time">Escala Rotativa</div>
            <div className="mass-card__location">
              Celebrada alternadamente nas seguintes comunidades:
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', color: 'var(--ink)' }}>
                <li>Capela Santo Expedito (Vila Nova)</li>
                <li>Capela Jesus da Divina Misericórdia (Vencesville)</li>
                <li>Capela Nossa Senhora do Carmo (Res. Azenha)</li>
              </ul>
            </div>
          </div>

          <div className="mass-card mass-card--special">
            <div className="mass-card__header">Abrigo Esperança</div>
            <div className="mass-card__time">Toda 4ª Quinta-feira do mês · 15h00</div>
            <div className="mass-card__location">
              Santa Missa especial e assistência pastoral aos idosos e acolhidos do Abrigo Esperança.
            </div>
          </div>
        </div>
      </section>

      {/* CHAMADA PARA O CALENDÁRIO */}
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)', border: '1px solid var(--secondary)' }}>
        <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>Deseja ver a data exata da missa em sua capela?</h3>
        <p style={{ color: '#334155', maxWidth: '600px', margin: '0 auto 1rem' }}>
          Consulte o nosso Calendário Paroquial interativo, filtre por sua capela e confira os dias em que haverá missa e celebração da palavra.
        </p>
        <Link to="/" className="btn btn--primary" style={{ fontWeight: 700 }}>
          Ir para o Calendário Paroquial →
        </Link>
      </div>
    </div>
  );
}
