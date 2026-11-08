import { Icon, ShapeGlyph } from './icons';
import { PLAYERS } from './theme';

/** Wat er gebeurt als het niet jouw beurt is. */
export function StatusPanel({ player, name, text, onLog }: { player?: number; name?: string; text: string; onLog?: () => void }) {
  const c = player === undefined ? undefined : PLAYERS[player]!;
  return (
    <div className="status" role="status" aria-live="polite">
      <div className="status-line" style={c ? { ['--pc' as string]: c.color } : undefined}>
        {c && (
          <Icon size={22}>
            <ShapeGlyph shape={c.shape} size={10} fill={c.color} />
          </Icon>
        )}
        <span>
          {name && <b>{name} </b>}
          {text}
        </span>
      </div>
      {onLog && (
        <button className="btn ghost" onClick={onLog}>
          Logboek
        </button>
      )}
    </div>
  );
}
