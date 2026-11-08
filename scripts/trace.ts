/** Eén partij met verslag per beurt.  npx tsx scripts/trace.ts [niveaus] [seed] */
import { applyMove, createGame, finalScores, isGameOver } from '../engine/src';
import { botTurn, type BotLevel } from '../bots';

const levels = (process.argv[2] ?? 'normal,normal').split(',') as BotLevel[];
let s = createGame({ seed: Number(process.argv[3] ?? 1), players: levels.map((l, i) => ({ name: `${l}${i}`, kind: l })) });
let rng = 1;
while (!isGameOver(s)) {
  const p = s.current;
  let moves;
  [moves, rng] = botTurn(s, levels[p]!, rng, 200);
  for (const m of moves) s = applyMove(s, m);
  const me = s.players[p]!;
  console.log(`R${s.round} ${me.name.padEnd(8)} ${moves.map((m) => JSON.stringify(m)).join(' ')}  | ƒ${me.gulden} ${JSON.stringify(me.resources)} hand ${me.hand.length} done ${me.delivered.length}`);
}
console.log(finalScores(s));
