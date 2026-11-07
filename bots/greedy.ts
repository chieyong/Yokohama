/** Eenvoudige gretige bot met wat willekeur. Basis voor Easy/Normal in stap 5. */
import {
  CONTRACT_BY_ID, LOCATION_INFO, RESOURCES, applyMove, legalMoves, nextRandom,
  type GameState, type Move,
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

export function chooseGreedy(s: GameState, rng: number): [Move, number] {
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

