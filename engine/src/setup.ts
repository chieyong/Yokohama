import { LOCATIONS, PRODUCE_LOCATIONS, type LocationId } from './board';
import { CONTRACTS } from './contracts';
import { DISPLAY_SIZE, MAX_ROUNDS, OFFICES_PER_PLAYER, START_GULDEN } from './constants';
import { randomInt, shuffle } from './rng';
import type { GameConfig, GameState, PlayerState } from './types';

export function createGame(config: GameConfig): GameState {
  const n = config.players.length;
  if (n < 2 || n > 4) throw new Error('Rotterdam is voor 2–4 spelers');

  let rng = config.seed >>> 0;
  let startPlayer: number;
  [startPlayer, rng] = randomInt(rng, n);

  let boats: LocationId[];
  [boats, rng] = shuffle(PRODUCE_LOCATIONS, rng);

  let deck: string[];
  [deck, rng] = shuffle(
    CONTRACTS.map((c) => c.id),
    rng,
  );

  const players: PlayerState[] = config.players.map((p, i) => ({
    name: p.name,
    kind: p.kind,
    gulden: START_GULDEN,
    resources: { koffie: 0, tabak: 0, graan: 0, staal: 0 },
    hand: [],
    delivered: [],
    bonusPoints: 0,
    officesLeft: OFFICES_PER_PLAYER,
    boat: boats[i]!,
  }));

  // Ieder 1 contract, in beurtvolgorde vanaf de startspeler.
  for (let k = 0; k < n; k++) players[(startPlayer + k) % n]!.hand.push(deck.shift()!);
  const display = deck.splice(0, DISPLAY_SIZE);

  return {
    version: 1,
    seed: config.seed,
    rng,
    players,
    offices: Object.fromEntries(LOCATIONS.map((l) => [l, Array(n).fill(0)])) as GameState['offices'],
    deck,
    display,
    round: 1,
    maxRounds: config.maxRounds ?? MAX_ROUNDS,
    startPlayer,
    current: startPlayer,
    phase: 'move',
  };
}
