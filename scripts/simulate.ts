/**
 * Bot-tegen-bot check in de console.
 *
 *   npm run simulate -- [partijen] [niveaus] [hard-ms]
 *   npm run simulate -- 200 normal,normal,normal
 *   npm run simulate -- 40 easy,normal,hard 150
 *
 * Zitplaatsen draaien elke partij mee, zodat de startspeler eerlijk verdeeld is.
 */
import { RESOURCES, applyMove, createGame, finalScores, isGameOver } from '../engine/src';
import { botTurn, type BotLevel } from '../bots';

const games = Number(process.argv[2] ?? 100);
const levels = (process.argv[3] ?? 'easy,normal').split(',') as BotLevel[];
const hardMs = Number(process.argv[4] ?? 150);
const n = levels.length;

const wins = Array(n).fill(0);
const totals = Array(n).fill(0);
const seatWins = Array(n).fill(0);
const cat = { contracts: 0, offices: 0, majorities: 0, money: 0, penalty: 0 };
const t0 = performance.now();

for (let g = 0; g < games; g++) {
  // bot b zit op stoel (b + g) % n
  const seatOf = levels.map((_, b) => (b + g) % n);
  const botAt = Array(n);
  seatOf.forEach((seat, b) => (botAt[seat] = b));
  let s = createGame({
    seed: 1000 + g,
    players: botAt.map((b: number) => ({ name: `${levels[b]}#${b}`, kind: levels[b]! })),
  });
  let rng = 7919 * (g + 1);
  while (!isGameOver(s)) {
    const level = levels[botAt[s.current]]!;
    let moves;
    [moves, rng] = botTurn(s, level, rng, hardMs);
    for (const m of moves) s = applyMove(s, m); // applyMove controleert legaliteit
    for (const p of s.players) {
      if (p.gulden < 0 || RESOURCES.some((r) => p.resources[r] < 0)) throw new Error('negatieve voorraad');
    }
  }
  for (const r of finalScores(s)) {
    const b = botAt[r.player];
    totals[b] += r.total;
    if (r.winner) {
      wins[b]++;
      seatWins[(r.player - s.startPlayer + n) % n]++;
    }
    for (const k of Object.keys(cat) as (keyof typeof cat)[]) cat[k] += r[k];
  }
}

const sec = (performance.now() - t0) / 1000;
console.log(`\n${games} partijen · ${n} spelers · ${(sec / games).toFixed(2)} s/partij`);
levels.forEach((l, b) =>
  console.log(`  ${`${l}#${b}`.padEnd(10)} winst ${String(wins[b]).padStart(4)} (${((100 * wins[b]) / games).toFixed(0)}%)  gem. score ${(totals[b] / games).toFixed(1)}`),
);
console.log(`  per categorie (gem.): ${Object.entries(cat).map(([k, v]) => `${k} ${(v / (games * n)).toFixed(1)}`).join(' · ')}`);
console.log(`  winst per zitplaats vanaf startspeler: ${seatWins.join(' / ')}`);
