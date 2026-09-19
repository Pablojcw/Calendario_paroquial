import { useQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints.js';
import { Spinner } from '../components/Spinner.js';

export function InstitutionalPage() {
  const query = useQuery({ queryKey: ['institution'], queryFn: api.getInstitution });

  if (query.isLoading) return <Spinner />;

  const info = query.data ?? {
    nome: 'Paróquia Nossa Senhora de Fátima e São Francisco de Paula',
    endereco: 'Av. João Pessoa, nº 488, Centro, Presidente Venceslau - SP',
    telefone: '(18) 3271-3785',
    whatsapp: '(18) 99713-3785',
    email: 'pvparoquiansfatima@hotmail.com',
    expediente: 'Segunda a sexta-feira: 7h30 às 17h | Sábado: 8h às 12h',
    instagram: 'paroquia_fatima',
    ano_fundacao: 1931,
    administrador_paroquial: 'Pe. Rafael Moreira Campos',
    conteudo: '',
  };

  return (
    <div className="institution-page">
      {/* HERO INSTITUCIONAL COM BRASÃO */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
          color: '#fff',
          padding: '2rem 1.8rem',
          borderRadius: '16px',
          borderLeft: '8px solid var(--accent)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.8rem',
          flexWrap: 'wrap',
        }}
      >
        <img
          src="/images/brasao.png"
          alt="Brasão Oficial da Paróquia"
          style={{
            width: '90px',
            height: 'auto',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
            background: '#fff',
            borderRadius: '12px',
            padding: '0.4rem',
          }}
        />
        <div style={{ flex: 1, minWidth: '260px' }}>
          <span
            style={{
              background: 'var(--accent)',
              color: 'var(--primary-dark)',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Quase um Século de Fé · Desde {info.ano_fundacao ?? 1931}
          </span>
          <h2 style={{ color: '#fff', margin: '0.5rem 0 0.3rem', fontSize: '1.6rem' }}>
            {info.nome}
          </h2>
          <p style={{ margin: 0, color: '#e0f2fe', fontSize: '1.05rem', fontStyle: 'italic' }}>
            "Paróquia de gente feliz — Presidente Venceslau / SP"
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* AGENDA DO PADRE */}
        <div className="card" style={{ borderTop: '5px solid var(--primary)' }}>
          <h3 style={{ margin: '0 0 0.8rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>✝️</span> Agenda do Padre
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            <strong>Administrador Paroquial:</strong> {info.administrador_paroquial || 'Pe. Rafael Moreira Campos'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
              <strong style={{ color: 'var(--primary-dark)', display: 'block' }}>
                Direção Espiritual e Confissão:
              </strong>
              <span style={{ fontSize: '0.92rem', color: '#334155' }}>
                Quarta e Quinta-feira, a partir das 08h00
              </span>
              <small style={{ display: 'block', color: 'var(--muted)', marginTop: '0.2rem' }}>
                * Atendimento por ordem de chegada na Secretaria Paroquial.
              </small>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-dark)' }}>
              <strong style={{ color: 'var(--primary-dark)', display: 'block' }}>
                Visitas aos Enfermos e Bênçãos:
              </strong>
              <span style={{ fontSize: '0.92rem', color: '#334155' }}>
                Sexta-feira na parte da manhã
              </span>
              <small style={{ display: 'block', color: 'var(--muted)', marginTop: '0.2rem' }}>
                * Agendamento prévio necessário na Secretaria.
              </small>
            </div>
          </div>
        </div>

        {/* SECRETARIA E ATENDIMENTO */}
        <div className="card" style={{ borderTop: '5px solid var(--secondary)' }}>
          <h3 style={{ margin: '0 0 0.8rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🏢</span> Secretaria Paroquial
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.92rem' }}>
            <div>
              <strong>Endereço:</strong>
              <div style={{ color: '#475569' }}>{info.endereco}</div>
            </div>

            <div>
              <strong>Horário de Expediente:</strong>
              <div style={{ color: '#475569' }}>{info.expediente}</div>
            </div>

            <div>
              <strong>Telefone Fixo:</strong>
              <div style={{ color: '#475569' }}>{info.telefone}</div>
            </div>

            <div>
              <strong>WhatsApp da Paróquia:</strong>
              <div>
                <a
                  href={`https://wa.me/55${(info.whatsapp || '18997133785').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <span>💬</span> {info.whatsapp} (Conversar agora)
                </a>
              </div>
            </div>

            <div>
              <strong>E-mail:</strong>
              <div style={{ color: '#475569' }}>{info.email}</div>
            </div>

            <div>
              <strong>Instagram Oficial:</strong>
              <div>
                <a
                  href={`https://instagram.com/${info.instagram?.replace('@', '') || 'paroquia_fatima'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 600 }}
                >
                  @{info.instagram?.replace('@', '') || 'paroquia_fatima'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PALAVRA DO PADRE */}
      <section className="card" style={{ padding: '2rem', borderTop: '6px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', borderBottom: '2px solid var(--secondary)', paddingBottom: '0.6rem' }}>
          <span style={{ fontSize: '1.8rem' }}>📜</span>
          <div>
            <h3 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '1.45rem' }}>
              Palavra do Padre — Mensagem Pastoral 2026
            </h3>
            <small style={{ color: 'var(--muted)' }}>Pe. Rafael Moreira Campos · Administrador Paroquial</small>
          </div>
        </div>

        <div style={{ color: '#334155', fontSize: '1.02rem', lineHeight: '1.75', whiteSpace: 'pre-line' }}>
          {info.conteudo || `Queridos irmãos e irmãs em Cristo, povo amado da paróquia Nossa Senhora de Fátima: Paróquia de gente feliz. Ao nos aproximarmos do ano de 2026, nossos corações se enchem de gratidão e alegria. Este será um tempo especial para nós: celebraremos 95 anos de história, fé, missão, lágrimas, conquistas, lutas e sonhos que se entrelaçam na vida desta comunidade. Noventa e cinco anos de um povo que caminha, que crê, que serve, que se levanta, que ama.

Desde os primeiros passos desta paróquia, a graça de Deus tem sido nossa força. Aqui aprendemos, dia após dia, o sentido profundo das palavras de Jesus: "Nisto todos saberão que sois meus discípulos: se vos amardes uns aos outros." (Jo 13,35). Este é o coração de toda pastoral. Este é o fundamento de todo ministério. Este é o novo mandamento, que não envelhece com o tempo: o amor.

Somos chamados a servir. Mas não a servir por obrigação. Servimos porque fomos amados primeiro (cf. 1 Jo 4,19). Servimos porque encontramos, em Cristo, o sentido de nossas mãos, vozes, passos e intenções. Na parábola do lava-pés (Jo 13,1-15), Jesus nos mostra que a autoridade na Igreja não é privilégio, é entrega. Que ser grande é ajoelhar-se diante do irmão. Que o poder do Evangelho é o poder do amor que se faz serviço.

Por isso, ao abrirmos esta "Agenda Pastoral de 2026", eu quero lhe fazer um convite muito sincero: Não seja apenas alguém que assiste a comunidade. Seja alguém que constrói a comunidade. Deixe-se tocar pelo chamado de Cristo: "Apascenta as minhas ovelhas." (Jo 21,15-17).

Que Nossa Senhora de Fátima nos cubra com seu manto; e São Francisco de Paula nos ajude a sermos caridosos. E que cada fiel batizado seja sinal vivo da ternura de Deus no mundo.`}
        </div>

        <div style={{ marginTop: '1.8rem', textAlign: 'right', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
          <strong style={{ display: 'block', color: 'var(--primary-dark)', fontSize: '1.05rem' }}>
            Pe. Rafael Moreira Campos
          </strong>
          <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Administrador Paroquial</span>
        </div>
      </section>
    </div>
  );
}