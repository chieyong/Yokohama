import type { GameState, Move, PlayerKind } from '../engine/src';
import { heuristicTurn } from './heuristic';
import { mctsTurn } from './mcts';

export type BotLevel = Exclude<PlayerKind, 'human'>;

/** Synchrone botbeurt (voor console en tests). Hard gebruikt hier een tijdslimiet. */
export function botTurn(s: GameState, level: BotLevel, rng: number, timeMs = 1000): [Move[], number] {
  if (level === 'hard') return [mctsTurn(s, { timeMs, seed: rng }), (rng * 1103515245 + 12345) >>> 0];
  return heuristicTurn(s, level, rng);
}

export { heuristicTurn, mctsTurn };
