import type { CSSProperties } from 'react';
import type { PublicOccurrence } from '../api/types.js';
import { formatHorario } from '../lib/date.js';

export function OccurrenceItem({ occ }: { occ: PublicOccurrence }) {
  const cor = occ.categoria?.cor ?? '#1d4ed8';

  // Elimina redundâncias: se local já diz "Igreja Matriz", não repete
  const localDisplay = (occ.local || occ.comunidade?.nome || '').trim();
  const horario = formatHorario(occ.hora);

  return (
    <li className="occ-item" style={{ '--brand': cor } as CSSProperties}>
      <h4 className="occ-item__title">{occ.titulo}</h4>

      <div className="occ-item__info">
        {horario && (
          <div className="occ-item__row">
            <span className="occ-item__label">Horário:</span>{' '}
            <span className="occ-item__val">{horario}</span>
          </div>
        )}

        {localDisplay && (
          <div className="occ-item__row">
            <span className="occ-item__label">Local:</span>{' '}
            <span className="occ-item__val">{localDisplay}</span>
          </div>
        )}

        {occ.responsavel && (
          <div className="occ-item__row">
            <span className="occ-item__label">Responsável:</span>{' '}
            <span className="occ-item__val">{occ.responsavel}</span>
          </div>
        )}
      </div>

      {occ.categoria && (
        <div className="occ-item__tag-wrap">
          <span className="categoria-tag" style={{ background: cor }}>
            {occ.categoria.nome}
          </span>
        </div>
      )}

      {occ.descricao && <p className="occ-item__desc">{occ.descricao}</p>}
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