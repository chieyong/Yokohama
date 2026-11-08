import {
  applyMoveUnchecked, isGameOver, nextRandom, shuffle, type GameState, type Move,
} from '../engine/src';
import { evaluate } from './evaluate';
import { enumerateTurns } from './turns';
import { noisyTurn } from './heuristic';

/**
 * Hard: Monte Carlo Tree Search op beurtniveau (varen + actie = één tak).
 * De volgorde van de contractenstapel is verborgen en wordt per iteratie
 * opnieuw geschud (determinisatie). Rollouts spelen de partij uit met de
 * Normaal-heuristiek plus wat ruis; de eindscores bepalen de beloning.
 */

interface Node {
  visits: number;
  /** som van beloningen per speler */
  reward: number[];
  children: Map<string, Node>;
  /** aantal keren dat dit kind beschikbaar was (ISMCTS) */
  avail: number;
}

const newNode = (n: number): Node => ({ visits: 0, reward: Array(n).fill(0), children: new Map(), avail: 0 });
const key = (moves: Move[]) => JSON.stringify(moves);
const C = 0.9;
/** Ruis in de rollouts (zelfde schaal als de heuristiek). */
const ROLLOUT_NOISE = 1;

function rewards(s: GameState): number[] {
  const vals = s.players.map((_, i) => evaluate(s, i));
  return vals.map((v, i) => {
    const best = Math.max(...vals.filter((_, j) => j !== i));
    return 1 / (1 + Math.exp(-(v - best) / 3));
  });
}

export interface MctsOptions {
  timeMs?: number;
  iterations?: number;
  seed?: number;
  rolloutTurns?: number;
}

export function mctsTurn(root: GameState, opts: MctsOptions = {}): Move[] {
  const n = root.players.length;
  const me = root.current;
  const rootTurns = enumerateTurns(root);
  if (rootTurns.length === 1) return rootTurns[0]!.moves;

  const tree = newNode(n);
  const deadline = opts.timeMs ? performance.now() + opts.timeMs : Infinity;
  const maxIt = opts.iterations ?? (opts.timeMs ? Infinity : 2000);
  const depth = opts.rolloutTurns ?? Infinity; // tot het einde van de partij
  let rng = (opts.seed ?? root.rng) >>> 0;

  for (let it = 0; it < maxIt && performance.now() < deadline; it++) {
    // Determinisatie: verborgen stapelvolgorde schudden.
    let s: GameState = { ...root };
    [s.deck, rng] = shuffle(root.deck, rng);
    let node = tree;
    const path: { node: Node; player: number }[] = [];

    // Selectie + expansie
    while (!isGameOver(s)) {
      const turns = node === tree ? rootTurns.map((t) => t.moves) : enumerateTurns(s).map((t) => t.moves);
      const player = s.current;
      let chosen: Move[] | null = null;
      let child: Node | undefined;
      let bestU = -Infinity;
      const unvisited: Move[][] = [];
      for (const t of turns) {
        const c = node.children.get(key(t));
        if (c) c.avail++;
        if (!c || c.visits === 0) unvisited.push(t);
      }
      if (unvisited.length) {
        let r: number;
        [r, rng] = nextRandom(rng);
        chosen = unvisited[Math.floor(r * unvisited.length)]!;
        child = node.children.get(key(chosen)) ?? newNode(n);
        if (!node.children.has(key(chosen))) {
          child.avail = 1;
          node.children.set(key(chosen), child);
        }
      } else {
        for (const t of turns) {
          const c = node.children.get(key(t))!;
          const u = c.reward[player]! / c.visits + C * Math.sqrt(Math.log(Math.max(c.avail, 1)) / c.visits);
          if (u > bestU) { bestU = u; chosen = t; child = c; }
        }
      }
      for (const m of chosen!) s = applyMoveUnchecked(s, m);
      path.push({ node: child!, player });
      node = child!;
      if (child!.visits === 0) break; // nieuw blad: verder met rollout
    }

    // Rollout
    let turnsPlayed = 0;
    while (!isGameOver(s) && turnsPlayed < depth) {
      let ms: Move[];
      [ms, rng] = noisyTurn(s, rng, ROLLOUT_NOISE);
      for (const m of ms) s = applyMoveUnchecked(s, m);
      turnsPlayed++;
    }

    // Terugpropagatie
    const r = rewards(s);
    tree.visits++;
    for (const { node: nd } of path) {
      nd.visits++;
      for (let i = 0; i < n; i++) nd.reward[i]! += r[i]!;
    }
  }

  // Meest bezochte beurt aan de wortel.
  let best = rootTurns[0]!.moves;
  let most = -1;
  for (const t of rootTurns) {
    const c = tree.children.get(key(t.moves));
    if (c && c.visits > most) { most = c.visits; best = t.moves; }
  }
  void me;
  return best;
}
