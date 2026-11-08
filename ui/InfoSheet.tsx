import { LOCATION_INFO, type GameState, type LocationId } from '../engine/src';
import { OFFICE_LINES, contractText, locationLines } from './describe';
import { Icon, LocationGlyph } from './icons';
import { ContractCard } from './pieces';
import { locColor } from './theme';

export type Info = { kind: 'loc'; id: LocationId } | { kind: 'contract'; id: string };

export function InfoSheet({ info, state, me, onClose }: { info: Info; state: GameState; me: number; onClose: () => void }) {
  return (
    <div className="info-backdrop" onClick={onClose}>
      <div className="info" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {info.kind === 'loc' ? (
          <>
            <h2>
              <span className="loc-dot big" style={{ background: locColor(info.id) }}>
                <Icon size={24}>
                  <LocationGlyph l={info.id} fill="#f1e5c8" detail={locColor(info.id)} />
                </Icon>
              </span>
              {LOCATION_INFO[info.id].name}
            </h2>
            {locationLines(state, info.id, me).map((t) => (
              <p key={t}>{t}</p>
            ))}
            <details className="office-help">
              <summary>Wat doet een kantoor?</summary>
              <ul>
                {OFFICE_LINES.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </details>
          </>
        ) : (
          <>
            <h2>Contract</h2>
            <div className="info-card">
              <ContractCard id={info.id} width={140} />
            </div>
            <p>{contractText(info.id)}</p>
          </>
        )}
        <button className="btn" onClick={onClose}>
          Sluiten
        </button>
      </div>
    </div>
  );
}
