import { finalScores, type GameState } from '../engine/src';
import { Icon, ShapeGlyph } from './icons';
import { PLAYERS } from './theme';

const ROWS = [
  ['contracts', 'Contracten'],
  ['majorities', 'Meerderheden'],
  ['money', 'Geld (ƒ3 = 1)'],
  ['penalty', 'Niet afgeleverd'],
] as const;

export function EndScreen({ state, onNew }: { state: GameState; onNew: () => void }) {
  const scores = finalScores(state);
  const winners = scores.filter((s) => s.winner).map((s) => state.players[s.player]!);
  const iWon = scores[0]!.winner;
  const best = Math.max(...scores.map((s) => s.total));
  const tieBroken = scores.filter((s) => s.total === best).length > winners.length;
  return (
    <div className="info-backdrop">
      <div className="info end" role="dialog" aria-modal="true">
        <h2>{iWon ? (winners.length > 1 ? 'Gedeelde winst!' : 'Je hebt gewonnen!') : `${winners.map((p) => p.name).join(' & ')} wint`}</h2>
        {tieBroken && <p className="tie">Gelijke stand; meeste geld over beslist.</p>}
        <table className="score">
          <thead>
            <tr>
              <th />
              {state.players.map((p, i) => (
                <th key={i} className={scores[i]!.winner ? 'win' : ''}>
                  <Icon size={14}>
                    <ShapeGlyph shape={PLAYERS[i]!.shape} size={10} fill={PLAYERS[i]!.color} />
                  </Icon>
                  <div>{p.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([k, label]) => (
              <tr key={k}>
                <td>{label}</td>
                {scores.map((s) => (
                  <td key={s.player}>{s[k]}</td>
                ))}
              </tr>
            ))}
            <tr className="total">
              <td>Totaal</td>
              {scores.map((s) => (
                <td key={s.player} className={s.winner ? 'win' : ''}>
                  {s.total}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <button className="btn primary wide" onClick={onNew}>
          Nieuw spel
        </button>
      </div>
    </div>
  );
}
