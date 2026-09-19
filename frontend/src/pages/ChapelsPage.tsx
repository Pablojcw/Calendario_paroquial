import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface ChapelInfo {
  id: string;
  nome: string;
  tituloCurto: string;
  endereco: string;
  bairro: string;
  imagem: string;
  destaque?: string;
  missas: string;
  atividades: string;
}

const CAPELAS_DATA: ChapelInfo[] = [
  {
    id: 'matriz',
    nome: 'Igreja Matriz Nossa Senhora de Fátima e São Francisco de Paula',
    tituloCurto: 'Igreja Matriz',
    endereco: 'Rua Carlos Gomes, nº 436',
    bairro: 'Centro',
    imagem: '/images/capelas/igreja_matriz.png',
    destaque: 'Igreja Matriz e Centro Pastoral',
    missas: 'Qua a Sex às 7h · Sáb às 19h30 · Dom às 10h e 19h',
    atividades: 'Cenáculo da Misericórdia (Seg 20h), Terço dos Homens (Ter 19h30), Mães Orantes (Sex 18h)',
  },
  {
    id: 'sao_francisco',
    nome: 'Capela São Francisco de Assis',
    tituloCurto: 'Capela São Francisco de Assis',
    endereco: 'Rua Milton Esposto, nº 425',
    bairro: 'Faive',
    imagem: '/images/capelas/sao_francisco.png',
    missas: 'Móvel às Quintas-feiras às 19h30 (conforme escala)',
    atividades: 'Mães Orantes (Seg 18h15), Terço dos Homens (Ter 19h30), Adoração Silenciosa (Qui 20h)',
  },
  {
    id: 'divino_espirito_santo',
    nome: 'Capela Divino Espírito Santo',
    tituloCurto: 'Capela Divino Espírito Santo',
    endereco: 'Rua Joviano de Medeiros, nº 45',
    bairro: 'Residencial Maximino',
    imagem: '/images/capelas/divino_espirito_santo.png',
    missas: 'Móvel às Quintas-feiras às 19h30 · Celebração Palavra (Sex 19h30)',
    atividades: 'Cenáculo (Seg 20h), Terço dos Homens (Ter 19h30), Mães Orantes (Qua 18h30)',
  },
  {
    id: 'santo_expedito',
    nome: 'Capela Santo Expedito',
    tituloCurto: 'Capela Santo Expedito',
    endereco: 'Rua Francisco Gomes Moreira, nº 65',
    bairro: 'Vila Nova',
    imagem: '/images/capelas/santo_expedito.png',
    missas: 'Móvel às Sextas-feiras às 19h30 · Celebração com Seminarista (3ª Sex e 4º Dom)',
    atividades: 'Novena das Mãos Ensanguentadas (Seg 19h30), Terço dos Homens (Ter 19h30)',
  },
  {
    id: 'santa_luzia',
    nome: 'Capela Santa Luzia',
    tituloCurto: 'Capela Santa Luzia',
    endereco: 'Rua José Alves Ferreira, nº 559',
    bairro: 'Vila Luiza',
    imagem: '/images/capelas/santa_luzia.png',
    missas: 'Móvel às Quintas-feiras às 19h30 · Celebração com Seminarista (4ª Sex 19h30 e 1º Dom 8h)',
    atividades: 'Terço dos Homens (Ter 19h30)',
  },
  {
    id: 'divina_misericordia',
    nome: 'Capela Jesus da Divina Misericórdia',
    tituloCurto: 'Capela Jesus da Divina Misericórdia',
    endereco: 'Rua Carmela Isoldi da Cunha, nº 205',
    bairro: 'Vencesville',
    imagem: '/images/capelas/divina_misericordia.png',
    missas: 'Móvel às Sextas-feiras às 19h30 · Celebração com Seminarista (1ª Sex 19h30 e 2º Dom 8h)',
    atividades: 'Terço dos Homens (Ter 19h30)',
  },
  {
    id: 'nossa_senhora_carmo',
    nome: 'Capela Nossa Senhora do Carmo',
    tituloCurto: 'Capela Nossa Senhora do Carmo',
    endereco: 'Rua Jean Carlos Campos Scalon, nº 32',
    bairro: 'Residencial Azenha',
    imagem: '/images/capelas/nossa_senhora_carmo.png',
    destaque: 'Sede da Catequese Batismal',
    missas: 'Móvel às Sextas-feiras às 19h30 · Celebração da Palavra com MECE’s (Sex 19h30)',
    atividades: 'Terço dos Homens (Ter 19h30), Terço N. S. do Apocalipse (Qua 19h)',
  },
  {
    id: 'senhor_bomfim',
    nome: 'Capela Nosso Senhor do Bonfim',
    tituloCurto: 'Capela Nosso Senhor do Bonfim',
    endereco: 'Rua Monte Castelo, nº 77',
    bairro: 'Vila Bonfim',
    imagem: '/images/capelas/senhor_bomfim.png',
    missas: 'Missa Fixa aos Domingos às 08h30',
    atividades: 'Terço das Mulheres (Seg 20h), Terço dos Homens (Ter 19h30), Infância Missionária (Sáb 16h)',
  },
  {
    id: 'nossa_senhora_aparecida',
    nome: 'Capela Nossa Senhora Aparecida',
    tituloCurto: 'Capela Nossa Senhora Aparecida',
    endereco: 'Rua Castro Alves, nº 444',
    bairro: 'Ernane Murad',
    imagem: '/images/capelas/nossa_senhora_aparecida.png',
    missas: 'Missa Fixa aos Sábados às 18h00',
    atividades: 'Terço dos Homens (Ter 19h30), Círculo de Leitores (Qui 19h30), Mães Orantes (Sex 18h30)',
  },
  {
    id: 'desatadora_nos',
    nome: 'Capela Nossa Senhora Desatadora dos Nós',
    tituloCurto: 'Capela N. Sra. Desatadora dos Nós',
    endereco: 'Centro de Formação',
    bairro: 'Aymoré',
    imagem: '/images/capelas/desatadora_nos.png',
    destaque: 'Centro de Formação e Retiros',
    missas: 'Móvel às Quintas-feiras às 19h30 (conforme escala)',
    atividades: 'Espaço de acampamentos paroquiais e formações pastorais',
  },
  {
    id: 'sao_judas',
    nome: 'Capela Santa Rita de Cássia e São Judas Tadeu',
    tituloCurto: 'Capela São Judas Tadeu',
    endereco: 'Rua Piracicaba, nº 233',
    bairro: 'Coroados',
    imagem: '/images/capelas/sao_judas.png',
    missas: 'Missa Fixa aos Domingos às 07h00',
    atividades: 'Grupo de Oração (Ter 20h), Mães Orantes (Qui 18h30)',
  },
  {
    id: 'santa_edwiges',
    nome: 'Capela São Sebastião e Santa Edwiges',
    tituloCurto: 'Capela Santa Edwiges',
    endereco: 'Rua Carlos Bueno da Fonseca, praça',
    bairro: 'Augusto Pereira',
    imagem: '/images/capelas/santa_edwiges.png',
    missas: 'Missa Fixa aos Domingos às 17h00',
    atividades: 'Terço das Mulheres (Seg 19h30), Terço dos Homens (Ter 19h30)',
  },
];

export function ChapelsPage() {
  const [busca, setBusca] = useState('');

  const capelasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return CAPELAS_DATA;
    return CAPELAS_DATA.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.bairro.toLowerCase().includes(termo) ||
        c.endereco.toLowerCase().includes(termo),
    );
  }, [busca]);

  return (
    <div className="chapels-page">
      <h2 className="page-title">Conheça Nossas Capelas</h2>
      <p className="page-subtitle">
        Nossa paróquia é formada pela comunhão viva de 12 comunidades de fé, espalhadas por toda a cidade de Presidente Venceslau.
      </p>

      {/* BARRA DE PESQUISA */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0.9rem 1.2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="🔍 Buscar capela por nome, bairro ou endereço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid var(--line-strong)',
              }}
            />
          </div>
          {busca && (
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => setBusca('')}
            >
              Limpar busca
            </button>
          )}
          <span style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 600 }}>
            {capelasFiltradas.length} comunidades encontradas
          </span>
        </div>
      </div>

      {/* GRID DAS CAPELAS */}
      <div className="chapels-grid">
        {capelasFiltradas.map((c) => {
          const mapsQuery = encodeURIComponent(`${c.nome}, ${c.endereco}, Presidente Venceslau - SP`);
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

          return (
            <div key={c.id} className="chapel-card">
              <div className="chapel-card__image-wrap">
                <img
                  src={c.imagem}
                  alt={c.nome}
                  className="chapel-card__image"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback se imagem demorar
                    (e.target as HTMLImageElement).src = '/images/banner_topo.png';
                  }}
                />
                <span className="chapel-card__badge-tag">{c.bairro}</span>
              </div>

              <div className="chapel-card__body">
                <h3 className="chapel-card__name">{c.nome}</h3>

                <div className="chapel-card__address">
                  <span>📍</span>
                  <div>
                    <strong>{c.endereco}</strong>
                    <div className="chapel-card__bairro">Bairro {c.bairro}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.15rem' }}>
                    🔔 Missas e Celebrações:
                  </div>
                  <div style={{ color: '#334155' }}>{c.missas}</div>
                </div>

                <div style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>
                  <div style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: '0.15rem' }}>
                    🙏 Atividades Regulares:
                  </div>
                  <div style={{ color: '#64748b' }}>{c.atividades}</div>
                </div>

                <div className="chapel-card__actions">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--sm btn--primary"
                    style={{ gap: '0.35rem' }}
                  >
                    <span>🗺️</span> Abrir no Google Maps
                  </a>
                  <Link
                    to={`/?filtro=${encodeURIComponent(c.tituloCurto)}`}
                    className="btn btn--sm btn--ghost"
                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Ver na agenda →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MURAL COMPLETO DA AGENDA */}
      <div className="card" style={{ marginTop: '2.5rem', textAlign: 'center', background: '#f8fafc' }}>
        <h3 style={{ color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>
          Mural das Capelas da Agenda Pastoral 2026
        </h3>
        <p style={{ color: 'var(--muted)', maxWidth: '700px', margin: '0 auto 1.2rem', fontSize: '0.92rem' }}>
          Foto oficial das fachadas das capelas publicada na página 12 da Agenda Paroquial 2026.
        </p>
        <div style={{ maxWidth: '900px', margin: '0 auto', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <img
            src="/images/documentos/capelas_mural.png"
            alt="Mural oficial das capelas da Paróquia de Fátima"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
}
