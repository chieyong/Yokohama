/// <reference lib="webworker" />
import type { GameState } from '../engine/src';
import { mctsTurn } from './mcts';

self.onmessage = (e: MessageEvent<{ id: number; state: GameState; timeMs: number; seed: number }>) => {
  const { id, state, timeMs, seed } = e.data;
  const moves = mctsTurn(state, { timeMs, seed });
  (self as unknown as Worker).postMessage({ id, moves });
};
