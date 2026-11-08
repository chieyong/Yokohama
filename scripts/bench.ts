import { createGame } from '../engine/src';
import { mctsTurn } from '../bots/mcts';
import { enumerateTurns } from '../bots/turns';
const s = createGame({ seed: 4, players: [0, 1, 2].map((i) => ({ name: `b${i}`, kind: 'hard' })) });
console.log('beurten aan wortel:', enumerateTurns(s).length);
for (const it of [200, 1000]) {
  const t = performance.now();
  mctsTurn(s, { iterations: it, seed: 1 });
  console.log(`${it} iteraties: ${(performance.now() - t).toFixed(0)} ms`);
}
