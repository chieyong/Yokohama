import { applyMove, createGame, type GameState, type Move } from '../engine/src';
import { chooseGreedy } from '../bots/greedy';

/** Voorbeeldpartij halverwege, alleen om het bord te tonen (stap 3). */
export function demoState(moves = 30, seed = 2026): GameState {
  let s = createGame({
    seed,
    players: [
      { name: 'Jij', kind: 'human' },
      { name: 'Anna', kind: 'normal' },
      { name: 'Bram', kind: 'normal' },
    ],
  });
  let rng = seed;
  for (let i = 0; i < moves && s.phase !== 'gameOver'; i++) {
    let m: Move;
    [m, rng] = chooseGreedy(s, rng);
    s = applyMove(s, m);
  }
  return s;
}
