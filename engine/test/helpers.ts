import { createGame, type GameState, type LocationId, type Resource } from '../src';

/** 2–4 spelers, speler 0 aan zet in de actiefase op `loc`. */
export function at(loc: LocationId, opts: { n?: number; res?: Partial<Record<Resource, number>> } = {}) {
  const n = opts.n ?? 3;
  const g: GameState = createGame({
    seed: 3,
    players: Array.from({ length: n }, (_, i) => ({ name: `P${i}`, kind: 'human' })),
  });
  g.startPlayer = 0;
  g.current = 0;
  g.phase = 'action';
  g.players.forEach((p, i) => (p.boat = i === 0 ? loc : (`x${i}` as LocationId)));
  Object.assign(g.players[0]!.resources, opts.res ?? {});
  return g;
}
