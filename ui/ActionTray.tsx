import { LOCATION_INFO, legalMoves, type GameState, type Move } from '../engine/src';
import { MoveLabel, locationLines } from './describe';
import { ContractCard } from './pieces';

const same = (a: Move | null, b: Move) => !!a && JSON.stringify(a) === JSON.stringify(b);
const WORK = new Set(['produce', 'sell', 'trade', 'takeContract', 'deliver']);

interface Props {
  s: GameState; // conceptstand (na varen)
  pending: Move | null;
  canUndo: boolean;
  onPick: (m: Move) => void;
  onUndo: () => void;
  onConfirm: () => void;
  onInfo: () => void;
}

export function ActionTray({ s, pending, canUndo, onPick, onUndo, onConfirm, onInfo }: Props) {
  const moves = legalMoves(s);
  const me = s.players[s.current]!;
  const work = moves.filter((m) => WORK.has(m.type));
  const other = moves.filter((m) => !WORK.has(m.type));

  return (
    <section className="tray" aria-label="Jouw beurt">
      {s.phase === 'move' ? (
        <>
          <h2 className="tray-title">Jouw beurt · kies waar je heen vaart</h2>
          <p className="tray-hint">Tik op een oplichtende locatie (1 of 2 stappen).</p>
          {moves[0]?.type === 'stay' && (
            <div className="opts">
              <button className="opt" onClick={() => onPick(moves[0]!)}>
                Je kunt nergens heen · blijf liggen
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="tray-title-row">
            <h2 className="tray-title">{LOCATION_INFO[me.boat].name} · kies een actie</h2>
            <button className="info-btn" onClick={onInfo} aria-label="Uitleg over deze locatie en kantoren">
              i
            </button>
          </div>
          <p className="tray-hint">{locationLines(s, me.boat, s.current)[0]}</p>
          <div className="opts">
            {work.length === 0 && <span className="opt-note">Werken kan hier nu niet.</span>}
            {work.map((m, i) =>
              m.type === 'takeContract' || m.type === 'deliver' ? (
                <button
                  key={i}
                  className={`opt card ${same(pending, m) ? 'on' : ''}`}
                  onClick={() => onPick(m)}
                  aria-label={`${m.type === 'deliver' ? 'Lever af' : 'Neem'} contract`}
                >
                  <ContractCard id={m.contract} width={76} />
                  <span>{m.type === 'deliver' ? 'Afleveren' : 'Nemen'}</span>
                </button>
              ) : (
                <button key={i} className={`opt ${same(pending, m) ? 'on' : ''}`} onClick={() => onPick(m)}>
                  <MoveLabel s={s} m={m} />
                </button>
              ),
            )}
            {other.map((m, i) => (
              <button key={`o${i}`} className={`opt alt ${same(pending, m) ? 'on' : ''}`} onClick={() => onPick(m)}>
                <MoveLabel s={s} m={m} />
              </button>
            ))}
          </div>
        </>
      )}
      <div className="tray-buttons">
        <button className="btn ghost" onClick={onUndo} disabled={!canUndo}>
          ↶ Terug
        </button>
        <button className="btn primary" onClick={onConfirm} disabled={!pending}>
          ✓ Bevestig
        </button>
      </div>
    </section>
  );
}
