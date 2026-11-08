import {
  CONTRACT_BY_ID, LOCATION_INFO, RESOURCES, applyMoveUnchecked, isGameOver, legalMoves,
  nextRandom, shuffle, type GameState, type Move,
} from '../engine/src';
import { evaluate } from './evaluate';
import { enumerateTurns, turnsLeft } from './turns';

/**
 * Hard: Monte Carlo Tree Search op beurtniveau (varen + actie = één tak).
 * De volgorde van de contractenstapel is verborgen en wordt per iteratie
 * opnieuw geschud (determinisatie). Rollouts gaan twee rondes diep met een
 * snelle policy en worden daarna met de heuristiek beoordeeld.
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

function rewards(s: GameState): number[] {
  const vals = s.players.map((_, i) => evaluate(s, i));
  return vals.map((v, i) => {
    const best = Math.max(...vals.filter((_, j) => j !== i));
    return 1 / (1 + Math.exp(-(v - best) / 3));
  });
}

/** Snelle rollout-policy: één zet tegelijk, eenvoudige voorkeuren met toeval. */
function rolloutMove(s: GameState, rng: number): [Move, number] {
  const moves = legalMoves(s);
  let r: number;
  [r, rng] = nextRandom(rng);
  if (s.phase === 'move') return [moves[Math.floor(r * moves.length)]!, rng];
  const me = s.players[s.current]!;
  const need = new Set(me.hand.flatMap((id) => RESOURCES.filter((x) => (CONTRACT_BY_ID[id]!.cost[x] ?? 0) > me.resources[x])));
  const left = turnsLeft(s, s.current);
  let best = moves[moves.length - 1]!; // rust
  let bestV = -1;
  for (const m of moves) {
    let v = 0;
    switch (m.type) {
      case 'deliver': v = 10; break;
      case 'produce': {
        const info = LOCATION_INFO[me.boat];
        v = info.kind === 'produce' && need.has(info.resource) ? 6 : 2; break;
      }
      case 'takeContract': v = left > 3 && me.hand.length < 2 ? 5 : 0; break;
      case 'build': v = left > 2 ? 3 : 1; break;
      case 'trade': v = m.take.every((t) => need.has(t)) && m.give.every((g) => !need.has(g)) ? 4 : 0; break;
      case 'sell': v = m.goods.every((g) => !need.has(g)) ? 2.5 : 0; break;
      case 'rest': v = 0.5; break;
    }
    [r, rng] = nextRandom(rng);
    v += r * 2.5;
    if (v > bestV) { bestV = v; best = m; }
  }
  return [best, rng];
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
  const depth = opts.rolloutTurns ?? 2 * n;
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
      const who = s.current;
      while (s.current === who && !isGameOver(s)) {
        let m: Move;
        [m, rng] = rolloutMove(s, rng);
        s = applyMoveUnchecked(s, m);
      }
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
