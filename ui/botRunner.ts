import type { GameState, Move } from '../engine/src';
import { heuristicTurn, mctsTurn, type BotLevel } from '../bots';

const HARD_MS = 1000;
let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, (m: Move[]) => void>();

function getWorker(): Worker | null {
  if (worker) return worker;
  try {
    worker = new Worker(new URL('../bots/worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; moves: Move[] }>) => {
      waiting.get(e.data.id)?.(e.data.moves);
      waiting.delete(e.data.id);
    };
  } catch {
    worker = null;
  }
  return worker;
}

/** Berekent een complete botbeurt. Moeilijk denkt ~1 s in een Web Worker. */
export async function computeBotTurn(s: GameState, level: BotLevel, seed: number): Promise<Move[]> {
  if (level !== 'hard') return heuristicTurn(s, level, seed)[0];
  const w = getWorker();
  if (!w) return mctsTurn(s, { timeMs: 600, seed });
  const id = nextId++;
  return new Promise((resolve) => {
    waiting.set(id, resolve);
    w.postMessage({ id, state: s, timeMs: HARD_MS, seed });
  });
}
