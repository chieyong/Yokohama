import type { LocationId, Resource } from './board';

export type PlayerKind = 'human' | 'easy' | 'normal' | 'hard';

export interface PlayerState {
  name: string;
  kind: PlayerKind;
  gulden: number;
  resources: Record<Resource, number>;
  hand: string[];
  delivered: string[];
  /** Extra punten (bijv. kantoorbonus bij afleveren). */
  bonusPoints: number;
  officesLeft: number;
  boat: LocationId;
}

export type Phase = 'move' | 'action' | 'gameOver';

export interface GameState {
  version: 1;
  seed: number;
  rng: number;
  players: PlayerState[];
  /** offices[locatie][speler] = aantal kantoren */
  offices: Record<LocationId, number[]>;
  deck: string[];
  display: string[];
  round: number;
  maxRounds: number;
  startPlayer: number;
  current: number;
  phase: Phase;
}

/** Goederen als gesorteerde lijst, bijv. ['koffie','koffie','staal']. */
export type Goods = Resource[];

export type Move =
  | { type: 'move'; to: LocationId }
  | { type: 'stay' }
  | { type: 'produce' }
  | { type: 'sell'; goods: Goods }
  | { type: 'trade'; give: Goods; take: Goods }
  | { type: 'takeContract'; contract: string }
  | { type: 'deliver'; contract: string }
  | { type: 'build' }
  | { type: 'rest' };

export interface PlayerConfig {
  name: string;
  kind: PlayerKind;
}

export interface GameConfig {
  players: PlayerConfig[];
  seed: number;
  maxRounds?: number;
}
