/**
 * Bot-tegen-bot check in de console.  npm run simulate -- [aantal] [spelers]
 */
import { RESOURCES, applyMove, createGame, finalScores, isGameOver, type Move } from '../engine/src';
import { chooseGreedy as choose } from '../bots/greedy';

const games = Number(process.argv[2] ?? 200);
const playerCounts = process.argv[3] ? [Number(process.argv[3])] : [2, 3, 4];

for (const n of playerCounts) {
  const totals: number[] = [];
  const cat = { contracts: 0, offices: 0, majorities: 0, money: 0, penalty: 0 };
  const seatWins = Array(n).fill(0);
  let moves = 0;
  const t0 = performance.now();
  for (let seed = 1; seed <= games; seed++) {
    let s = createGame({ seed, players: Array.from({ length: n }, (_, i) => ({ name: `Bot${i}`, kind: 'normal' })) });
    let rng = seed * 7919;
    while (!isGameOver(s)) {
      let m: Move;
      [m, rng] = choose(s, rng);
      s = applyMove(s, m);
      moves++;
      for (const p of s.players) {
        if (p.gulden < 0 || RESOURCES.some((r) => p.resources[r] < 0)) throw new Error('negatieve voorraad');
      }
    }
    for (const r of finalScores(s)) {
      totals.push(r.total);
      for (const k of Object.keys(cat) as (keyof typeof cat)[]) cat[k] += r[k];
      if (r.winner) seatWins[(r.player - s.startPlayer + n) % n]++;
    }
  }
  const avg = (x: number) => (x / (games * n)).toFixed(1);
  const ms = performance.now() - t0;
  console.log(`\n${n} spelers · ${games} partijen · ${(ms / games).toFixed(0)} ms/partij · ${(moves / games).toFixed(0)} zetten/partij`);
  console.log(`  gem. score ${avg(totals.reduce((a, b) => a + b, 0))}  (min ${Math.min(...totals)}, max ${Math.max(...totals)})`);
  console.log(`  per categorie: ${Object.entries(cat).map(([k, v]) => `${k} ${avg(v)}`).join(' · ')}`);
  console.log(`  winst per zitplaats (vanaf startspeler): ${seatWins.join(' / ')}`);
}
