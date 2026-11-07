import { reachable } from './board';
import type { GameState, Move } from './types';

export function legalMoves(state: GameState): Move[] {
  if (state.phase === 'move') {
    const me = state.players[state.current]!;
    const occupied = new Set(state.players.map((p) => p.boat));
    const dests = reachable(me.boat).filter((l) => !occupied.has(l));
    return dests.length ? dests.map((to) => ({ type: 'move', to })) : [{ type: 'stay' }];
  }
  if (state.phase === 'action') {
    // Stap 1: alleen rusten. Werken en vestigen volgen in stap 2.
    return [{ type: 'rest' }];
  }
  return [];
}

const key = (m: Move) => JSON.stringify(m);

export function isLegal(state: GameState, move: Move): boolean {
  const k = key(move);
  return legalMoves(state).some((m) => key(m) === k);
}

export function applyMove(state: GameState, move: Move): GameState {
  if (!isLegal(state, move)) throw new Error(`Illegale zet: ${key(move)}`);
  const s: GameState = structuredClone(state);
  const me = s.players[s.current]!;

  switch (move.type) {
    case 'move':
      me.boat = move.to;
      s.phase = 'action';
      return s;
    case 'stay':
      s.phase = 'action';
      return s;
    case 'rest':
      me.gulden += 1;
      return endTurn(s);
  }
}

function endTurn(s: GameState): GameState {
  const n = s.players.length;
  s.current = (s.current + 1) % n;
  s.phase = 'move';
  if (s.current === s.startPlayer) {
    s.round += 1;
    if (s.round > s.maxRounds) {
      s.round = s.maxRounds;
      s.phase = 'gameOver';
    }
  }
  return s;
}

export function isGameOver(state: GameState): boolean {
  return state.phase === 'gameOver';
}
