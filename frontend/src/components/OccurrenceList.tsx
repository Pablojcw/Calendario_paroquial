import type { CSSProperties } from 'react';
import type { PublicOccurrence } from '../api/types.js';
import { humanTime, weekdayLabel } from '../lib/date.js';

export function OccurrenceItem({ occ }: { occ: PublicOccurrence }) {
  const cor = occ.categoria?.cor ?? '#7f1d1d';

  return (
    <li className="occ-item" style={{ '--brand': cor } as CSSProperties}>
      <h4>
        <time>{humanTime(occ.hora)}</time> {occ.titulo}
      </h4>
      {occ.serie && (
        <span className="serie-badge">
          {occ.serie.titulo} · dia {occ.serie.dia} de {occ.serie.total}
        </span>
      )}
      <div className="meta">
        {occ.local && <span>{occ.local}</span>}
        {occ.responsavel && <span>{occ.responsavel}</span>}
        {occ.comunidade && <span>{occ.comunidade.nome}</span>}
        <span>{weekdayLabel(occ.data)}</span>
      </div>
      {occ.categoria && (
        <span className="categoria-tag" style={{ background: cor }}>
          {occ.categoria.nome}
        </span>
      )}
      {occ.descricao && <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem' }}>{occ.descricao}</p>}
    </li>
  );
}

export function OccurrenceList({ occurrences }: { occurrences: PublicOccurrence[] }) {
  if (occurrences.length === 0) {
    return <p className="empty">Nenhum evento neste período.</p>;
  }
  return (
    <ul className="occ-list">
      {occurrences.map((occ) => (
        <OccurrenceItem key={occ.ocorrenciaId} occ={occ} />
      ))}
    </ul>
  );
}