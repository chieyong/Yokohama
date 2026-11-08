import { finalScores, type GameState } from '../engine/src';
import { Icon, ShapeGlyph } from './icons';
import { PLAYERS } from './theme';

export function TopBar({ state, onLog }: { state: GameState; onLog?: () => void }) {
  const scores = finalScores(state);
  return (
    <header className="topbar">
      <div className="round" aria-label={`Ronde ${state.round} van ${state.maxRounds}`}>
        <span className="round-label">Ronde</span>
        <span className="round-num">
          {state.round}<small>/{state.maxRounds}</small>
        </span>
      </div>
      <ol className="players">
        {state.players.map((p, i) => {
          const c = PLAYERS[i]!;
          const active = i === state.current;
          return (
            <li key={i} className={active ? 'active' : ''} style={{ ['--pc' as string]: c.color }}>
              <Icon size={16}>
                <ShapeGlyph shape={c.shape} size={10} fill={c.color} />
              </Icon>
              <span className="pinfo">
                <span className="pname">{p.kind === 'human' ? 'Jij' : p.name}</span>
                <span className="pstat" aria-label={`${p.gulden} gulden, ${scores[i]!.total} punten`}>
                  ƒ{p.gulden} · {scores[i]!.total} pnt
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {onLog && (
        <button className="log-btn" onClick={onLog} aria-label="Logboek en snelheid">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M6 3a2 2 0 0 0-2 2v1h4V5a2 2 0 0 0-2-2zM6 21a2 2 0 0 1-2-2v-1h4v1a2 2 0 0 1-2 2z" fill="currentColor" />
            <path d="M10 8h6M10 12h6M10 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </header>
  );
}
