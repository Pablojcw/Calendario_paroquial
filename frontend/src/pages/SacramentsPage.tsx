import { Link } from 'react-router-dom';

const BATISMO_DATAS = [
  { catequese: '7 de fevereiro', batismo: '22 de fevereiro' },
  { catequese: '7 de março', batismo: '29 de março' },
  { catequese: '11 de abril', batismo: '22 de abril' },
  { catequese: '2 de maio', batismo: '31 de maio' },
  { catequese: '6 de junho', batismo: '28 de junho' },
  { catequese: '4 de julho', batismo: '26 de julho' },
  { catequese: '1 de agosto', batismo: '30 de agosto' },
  { catequese: '5 de setembro', batismo: '27 de setembro' },
  { catequese: '3 de outubro', batismo: '25 de outubro' },
  { catequese: '7 de novembro', batismo: '29 de novembro' },
  { catequese: '5 de dezembro', batismo: '27 de dezembro' },
];

const MATRIMONIO_ENCONTROS = [
  { data: '21 de março', tipo: 'Encontro de Preparação para o Matrimônio', local: 'Igreja Matriz' },
  { data: '20 de junho', tipo: 'Encontro de Preparação para o Matrimônio', local: 'Igreja Matriz' },
  { data: '22 de agosto · 10h', tipo: 'Casamento Comunitário Paroquial', local: 'Igreja Matriz' },
  { data: '26 de setembro', tipo: 'Encontro de Preparação para o Matrimônio', local: 'Igreja Matriz' },
];

const ACAMPAMENTOS_2026 = [
  { nome: 'Catequistas', data: '21 e 22 de fevereiro', icone: '📖' },
  { nome: 'Acampando com Rosas', data: '7 e 8 de março', icone: '🌹' },
  { nome: 'Virada Radical', data: '13 a 15 de março', icone: '🔥' },
  { nome: 'Acampas', data: '18 e 19 de abril', icone: '⛺' },
  { nome: 'Magnificat', data: '15 a 17 de maio', icone: '🕊️' },
  { nome: 'PAC', data: '23 e 24 de maio', icone: '✨' },
  { nome: 'Juvenil / Sênior', data: '3 a 7 de junho', icone: '✝️' },
  { nome: 'Vicentinos', data: '11 e 12 de julho', icone: '🤝' },
  { nome: 'Famílias', data: '25 a 27 de julho', icone: '👨‍👩‍👧‍👦' },
  { nome: 'Sobriedade', data: '28 a 30 de agosto', icone: '🌿' },
  { nome: 'Jesus é Joia', data: '19 e 20 de setembro', icone: '💎' },
  { nome: 'Casais', data: '10 a 12 de outubro', icone: '💍' },
  { nome: 'CES', data: '16 a 18 de outubro', icone: '🌟' },
  { nome: 'FAC', data: '30/10 a 2 de novembro', icone: '⚓' },
  { nome: 'Mirim', data: '20 a 22 de novembro', icone: '🧒' },
];

export function SacramentsPage() {
  return (
    <div className="sacraments-page">
      <h2 className="page-title">Catequese e Sacramentos</h2>
      <p className="page-subtitle">
        Orientações, requisitos e calendário completo da preparação para o Batismo, Matrimônio e Acampamentos de 2026.
      </p>

      {/* SEÇÃO BATISMO */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="sacrament-hero">
          <h3>🕊️ Catequese para o Batismo</h3>
          <p>
            O Batismo é a porta de entrada para a vida em Cristo e na Igreja. As catequeses preparam pais e padrinhos para esse momento sublime de acolhida e bênção.
          </p>
          <div style={{ marginTop: '0.8rem', fontSize: '0.95rem' }}>
            <p>
              📍 <strong>Local da Catequese:</strong> Capela Nossa Senhora do Carmo (Residencial Azenha)
            </p>
            <p>
              ⏰ <strong>Horário:</strong> Sempre no 1º sábado do mês, das 18h às 21h
            </p>
          </div>
        </div>

        <div className="sacrament-alert">
          <span>⚠️</span>
          <div>
            <strong>Atenção:</strong> É obrigatório fazer a inscrição antecipada na Secretaria Paroquial. Compareça com certidão de nascimento da criança e documentos dos pais e padrinhos.
          </div>
        </div>

        <div className="card">
          <h4 style={{ color: 'var(--primary-dark)', margin: '0 0 1rem' }}>
            Calendário Oficial de Catequese e Celebração do Batismo (2026)
          </h4>
          <div className="activities-table-wrap">
            <table className="activities-table">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Encontro de Catequese (Capela do Carmo)</th>
                  <th style={{ width: '50%' }}>Celebração do Batismo</th>
                </tr>
              </thead>
              <tbody>
                {BATISMO_DATAS.map((b, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>📅 {b.catequese}</span>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>18h às 21h na Capela do Carmo</small>
                    </td>
                    <td>
                      <strong style={{ color: '#0369a1' }}>🕊️ {b.batismo}</strong>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>Celebração na comunidade</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SEÇÃO MATRIMÔNIO */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="sacrament-hero" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
          <h3>💍 Catequese para o Matrimônio e Casamento Comunitário</h3>
          <p>
            O Sacramento do Matrimônio consagra o amor conjugal como sinal visível do amor de Deus pelo Seu povo.
          </p>
          <div style={{ marginTop: '0.8rem', fontSize: '0.95rem' }}>
            <p>
              📍 <strong>Local:</strong> Igreja Matriz
            </p>
            <p>
              ⛪ <strong>Legitimações:</strong> Acontecem aos sábados, às 10h, na Igreja Matriz
            </p>
            <p>
              👰 <strong>Casamento Comunitário 2026:</strong> 22 de Agosto, às 10h, na Igreja Matriz
            </p>
          </div>
        </div>

        <div className="sacrament-alert">
          <span>⚠️</span>
          <div>
            <strong>Atenção:</strong> É obrigatório fazer a inscrição antecipada na Secretaria Paroquial. Procure a secretaria com antecedência para abertura do processo matrimonial.
          </div>
        </div>

        <div className="card">
          <h4 style={{ color: 'var(--primary-dark)', margin: '0 0 1rem' }}>
            Datas de Preparação e Casamentos em 2026
          </h4>
          <div className="activities-table-wrap">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Atividade</th>
                  <th>Local</th>
                </tr>
              </thead>
              <tbody>
                {MATRIMONIO_ENCONTROS.map((m, idx) => (
                  <tr key={idx}>
                    <td><strong style={{ color: 'var(--primary)' }}>{m.data}</strong></td>
                    <td>{m.tipo}</td>
                    <td>{m.local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SEÇÃO ACAMPAMENTOS */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '1.4rem' }}>
              ⛺ Acampamentos Paroquiais 2026
            </h3>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Momentos profundos de evangelização, renovação espiritual e fraternidade.
            </p>
          </div>
          <span className="badge" style={{ background: 'var(--accent)', color: 'var(--primary-dark)', fontWeight: 800 }}>
            15 Acampamentos em 2026
          </span>
        </div>

        <div className="sacrament-alert" style={{ marginBottom: '1.2rem' }}>
          <span>ℹ️</span>
          <div>
            É obrigatório fazer a inscrição antecipada na Secretaria Paroquial. Vagas limitadas por acampamento!
          </div>
        </div>

        <div className="camps-grid">
          {ACAMPAMENTOS_2026.map((acampa, idx) => (
            <div key={idx} className="camp-card">
              <div className="camp-card__icon">{acampa.icone}</div>
              <div>
                <div className="camp-card__name">{acampa.nome}</div>
                <div className="camp-card__date">📅 {acampa.data}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INFORMAÇÕES DE CONTATO PARA INSCRIÇÃO */}
      <div className="card" style={{ textAlign: 'center', background: '#f8fafc', marginTop: '2.5rem' }}>
        <h4 style={{ color: 'var(--primary-dark)', margin: '0 0 0.5rem' }}>
          Dúvidas sobre documentos ou inscrições?
        </h4>
        <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto 1.2rem' }}>
          Entre em contato direto com a Secretaria Paroquial de Presidente Venceslau pelo WhatsApp ou telefone durante o horário de expediente.
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://wa.me/5518997133785?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20inscri%C3%A7%C3%B5es%20para%20os%20sacramentos."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--accent"
          >
            💬 Falar no WhatsApp: (18) 99713-3785
          </a>
          <Link to="/institucional" className="btn btn--primary">
            Ver Horários da Secretaria →
          </Link>
        </div>
      </div>
    </div>
  );
}
