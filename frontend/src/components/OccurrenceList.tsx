import type { CSSProperties } from 'react';
import type { PublicOccurrence } from '../api/types.js';
import { formatHorario } from '../lib/date.js';

export function OccurrenceItem({ occ }: { occ: PublicOccurrence }) {
  const cor = occ.categoria?.cor ?? '#2d4796';

  // Elimina redundâncias de locais
  const localDisplay = (occ.local || occ.comunidade?.nome || '').trim();
  const horario = formatHorario(occ.hora);

  return (
    <li className="occ-item" style={{ '--brand': cor } as CSSProperties}>
      <div className="occ-item__header">
        <h4 className="occ-item__title">{occ.titulo}</h4>
        {occ.categoria && (
          <div className="occ-item__category-wrap">
            <span className="categoria-tag" style={{ backgroundColor: cor }}>
              <span className="categoria-tag__dot" />
              {occ.categoria.nome}
            </span>
          </div>
        )}
      </div>

      <div className="occ-item__info">
        {horario && (
          <div className="occ-item__row">
            <span className="occ-item__label">Horário:</span>{' '}
            <span className="occ-item__val occ-item__val--time">{horario}</span>
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

      {occ.descricao && <p className="occ-item__desc">{occ.descricao}</p>}
    </li>
  );
}

export function OccurrenceList({ occurrences }: { occurrences: PublicOccurrence[] }) {
  if (occurrences.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)', background: '#fff' }}>
        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.4rem' }}>🕊️</span>
        Nenhuma atividade cadastrada para este dia.
      </div>
    );
  }
  return (
    <ul className="occ-list">
      {occurrences.map((occ) => (
        <OccurrenceItem key={occ.ocorrenciaId} occ={occ} />
      ))}
    </ul>
  );
}