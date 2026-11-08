import { applyMoveUnchecked, legalMoves, type GameState, type Move } from '../engine/src';

export interface Turn {
  moves: Move[]; // [varen/blijven, actie]
  after: GameState;
}

/** Alle complete beurten (varen + actie) voor de speler aan zet. */
export function enumerateTurns(s: GameState): Turn[] {
  const out: Turn[] = [];
  for (const m of legalMoves(s)) {
    const s1 = applyMoveUnchecked(s, m);
    for (const a of legalMoves(s1)) out.push({ moves: [m, a], after: applyMoveUnchecked(s1, a) });
  }
  return out;
}

/** Hoeveel beurten heeft speler p nog (inclusief de lopende)? */
export function turnsLeft(s: GameState, p: number): number {
  if (s.phase === 'gameOver') return 0;
  const n = s.players.length;
  const played = (p - s.startPlayer + n) % n < (s.current - s.startPlayer + n) % n;
  return s.maxRounds - s.round + (played ? 0 : 1);
}
