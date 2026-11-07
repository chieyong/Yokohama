import type { GameState } from '../engine/src';
import { Icon, ShapeGlyph } from './icons';
import { PLAYERS } from './theme';

export function TopBar({ state }: { state: GameState }) {
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
              <span className="pname">{p.kind === 'human' ? 'Jij' : p.name}</span>
              <span className="pgold">ƒ{p.gulden}</span>
            </li>
          );
        })}
      </ol>
    </header>
  );
}
