import { applyMove, createGame, type GameState } from '../engine/src';
import { heuristicTurn } from '../bots';

/** Voorbeeldpartij halverwege (?demo in de URL), handig voor screenshots. */
export function demoState(turns = 15, seed = 2026): GameState {
  let s = createGame({
    seed,
    players: [
      { name: 'Jij', kind: 'human' },
      { name: 'Anna', kind: 'normal' },
      { name: 'Bram', kind: 'normal' },
    ],
  });
  let rng = seed;
  for (let i = 0; i < turns && s.phase !== 'gameOver'; i++) {
    let moves;
    [moves, rng] = heuristicTurn(s, 'easy', rng);
    for (const m of moves) s = applyMove(s, m);
  }
  return s;
}
