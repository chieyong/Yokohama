import { nextRandom, type GameState, type Move } from '../engine/src';
import { relativeValue } from './evaluate';
import { enumerateTurns } from './turns';

/**
 * Easy: heuristiek met flinke ruis. Normal: puur heuristiek.
 * Geeft de gekozen beurt [varen, actie] en de nieuwe rng-state terug.
 */
export function heuristicTurn(s: GameState, level: 'easy' | 'normal', rng: number): [Move[], number] {
  const turns = enumerateTurns(s);
  if (level === 'easy') {
    // 1 op 5 beurten: een willekeurige zet.
    let r: number;
    [r, rng] = nextRandom(rng);
    if (r < 0.2) {
      [r, rng] = nextRandom(rng);
      return [turns[Math.floor(r * turns.length)]!.moves, rng];
    }
  }
  let best = turns[0]!;
  let bestV = -Infinity;
  for (const t of turns) {
    let v = relativeValue(t.after, s.current);
    if (level === 'easy') {
      let r: number;
      [r, rng] = nextRandom(rng);
      v += r * 6;
    }
    if (v > bestV) {
      bestV = v;
      best = t;
    }
  }
  return [best.moves, rng];
}

/** Normaal met een beetje ruis: rollout-policy voor Moeilijk. */
export function noisyTurn(s: GameState, rng: number, noise: number): [Move[], number] {
  const turns = enumerateTurns(s);
  let best = turns[0]!;
  let bestV = -Infinity;
  for (const t of turns) {
    let r: number;
    [r, rng] = nextRandom(rng);
    const v = relativeValue(t.after, s.current) + r * noise;
    if (v > bestV) {
      bestV = v;
      best = t;
    }
  }
  return [best.moves, rng];
}
