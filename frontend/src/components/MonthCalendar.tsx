import { useMemo } from 'react';
import type { PublicOccurrence } from '../api/types.js';
import { WEEKDAY_SHORT, humanTime, monthGrid, parseISO, todayISO } from '../lib/date.js';

type Props = {
  monthISO: string;
  occurrences: PublicOccurrence[];
  selectedISO: string | null;
  onSelectDay: (iso: string) => void;
};

const DEFAULT_COLOR = '#7f1d1d';

export function MonthCalendar({ monthISO, occurrences, selectedISO, onSelectDay }: Props) {
  const grid = useMemo(() => monthGrid(monthISO), [monthISO]);
  const byDate = useMemo(() => {
    const map = new Map<string, PublicOccurrence[]>();
    for (const occ of occurrences) {
      const list = map.get(occ.data) ?? [];
      list.push(occ);
      map.set(occ.data, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.hora ?? '99:99').localeCompare(b.hora ?? '99:99'));
    }
    return map;
  }, [occurrences]);

  const todayIso = useMemo(() => todayISO(), []);
  const monthAnchor = parseISO(monthISO).getMonth();
  const legend = useMemo(() => {
    const seen = new Map<string, string>();
    for (const occ of occurrences) {
      if (occ.categoria && !seen.has(occ.categoria.id)) seen.set(occ.categoria.id, occ.categoria.cor);
    }
    return [...seen.entries()];
  }, [occurrences]);

  return (
    <div>
      <div className="calendar-grid" role="grid" aria-label="Calendário mensal">
        {WEEKDAY_SHORT.map((name) => (
          <div key={name} className="calendar-head">
            {name}
          </div>
        ))}

        {grid.map((iso) => {
          const day = byDate.get(iso) ?? [];
          const isOtherMonth = parseISO(iso).getMonth() !== monthAnchor;
          const isToday = iso === todayIso;
          const isSelected = iso === selectedISO;

          const classes = ['calendar-day'];
          if (isOtherMonth) classes.push('calendar-day--other');
          if (isToday) classes.push('calendar-day--today');
          if (isSelected) classes.push('calendar-day--selected');

          const visible = isOtherMonth ? [] : day.slice(0, 2);
          const restCount = isOtherMonth ? 0 : Math.max(0, day.length - visible.length);
          const dots = isOtherMonth ? [] : day.slice(0, 3);

          return (
            <button
              type="button"
              key={iso}
              className={classes.join(' ')}
              onClick={() => onSelectDay(iso)}
              aria-label={`${isOtherMonth ? 'Outro mês' : `${day.length} evento(s)`} em ${iso}`}
            >
              <span className="calendar-day__num">{Number(iso.slice(8))}</span>

              {/* Visualização Desktop: chips com hora e título */}
              {!isOtherMonth && day.length > 0 && (
                <div className="calendar-day__events-desktop">
                  {visible.map((occ) => (
                    <span
                      key={occ.ocorrenciaId}
                      className="event-chip"
                      style={{ background: occ.categoria?.cor ?? DEFAULT_COLOR }}
                      title={occ.titulo}
                    >
                      <strong>{humanTime(occ.hora)}{humanTime(occ.hora) ? ' · ' : ''}</strong>
                      {occ.titulo}
                    </span>
                  ))}
                  {restCount > 0 && <span className="calendar-day__holy">+{restCount} mais</span>}
                </div>
              )}

              {/* Visualização Mobile: bolinhas coloridas e contador compacto */}
              {!isOtherMonth && day.length > 0 && (
                <div className="calendar-day__events-mobile" aria-hidden="true">
                  <div className="calendar-dots">
                    {dots.map((occ) => (
                      <span
                        key={occ.ocorrenciaId}
                        className="calendar-dot"
                        style={{ background: occ.categoria?.cor ?? DEFAULT_COLOR }}
                      />
                    ))}
                    {day.length > 3 && (
                      <span className="calendar-dot-count">+{day.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {legend.length > 0 && (
        <div className="calendar-legend">
          {legend.map(([id, cor]) => (
            <span key={id}>
              <span className="dot" style={{ background: cor }} />
              {occurrences.find((o) => o.categoria?.id === id)?.categoria?.nome}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}