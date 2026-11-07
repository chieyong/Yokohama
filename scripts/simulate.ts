/**
 * Bot-tegen-bot check in de console.  npm run simulate -- [aantal] [spelers]
 * Eenvoudige gretige bot met wat willekeur (wordt in stap 5 vervangen door /bots).
 */
import {
  CONTRACT_BY_ID, LOCATION_INFO, RESOURCES, applyMove, canPay, createGame, finalScores,
  isGameOver, legalMoves, nextRandom, type GameState, type Move,
} from '../engine/src';

function need(s: GameState): Record<string, number> {
  const me = s.players[s.current]!;
  const n: Record<string, number> = { koffie: 0, tabak: 0, graan: 0, staal: 0 };
  for (const id of me.hand) for (const r of RESOURCES) n[r]! += CONTRACT_BY_ID[id]!.cost[r] ?? 0;
  for (const r of RESOURCES) n[r] = Math.max(0, n[r]! - me.resources[r]);
  return n;
}

function value(s: GameState, m: Move): number {
  const me = s.players[s.current]!;
  const late = s.round >= s.maxRounds - 1;
  switch (m.type) {
    case 'deliver': return 10 + CONTRACT_BY_ID[m.contract]!.points;
    case 'takeContract': return late ? -3 : 6 - me.hand.length + CONTRACT_BY_ID[m.contract]!.points / 3;
    case 'produce': {
      const info = LOCATION_INFO[me.boat];
      return info.kind === 'produce' ? (need(s)[info.resource]! > 0 ? 7 : 2) : 0;
    }
    case 'trade': {
      const n = need(s);
      return m.give.every((g) => n[g] === 0) && m.take.every((t) => n[t]! > 0) ? 5 + m.take.length : -1;
    }
    case 'sell': return m.goods.every((g) => need(s)[g] === 0) ? 2 + m.goods.length : -1;
    case 'build': return late ? 4 : 5;
    case 'rest': return 1;
    default: return 0;
  }
}

function bestAction(s: GameState): number {
  return Math.max(...legalMoves(s).map((m) => value(s, m)));
}

function choose(s: GameState, rng: number): [Move, number] {
  const moves = legalMoves(s);
  let r: number;
  const scored = moves.map((m) => {
    [r, rng] = nextRandom(rng);
    const v = s.phase === 'move' ? bestAction(applyMove(s, m)) : value(s, m);
    return { m, v: v + r * 1.5 };
  });
  scored.sort((a, b) => b.v - a.v);
  return [scored[0]!.m, rng];
}

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
