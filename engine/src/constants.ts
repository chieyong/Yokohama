/** Speelduur: Kort / Middel / Lang (rondes). */
export const ROUND_OPTIONS = { short: 15, medium: 20, long: 25 } as const;
export const MAX_ROUNDS = ROUND_OPTIONS.short;
/** Goederen per keer werken in een haven (+1 met eigen kantoor). */
export const PRODUCE_AMOUNT = 2;
/** Contracten in de hand bij de start. */
export const START_HAND = 2;
export const START_GULDEN = 4;
export const OFFICES_PER_PLAYER = 6;
export const HAND_LIMIT = 3;
export const DISPLAY_SIZE = 3;
export const UNDELIVERED_PENALTY = 2;
export const SELL_PRICE = 2;
export const BUILD_BASE_COST = 2;
/** Meerderheid per locatie: meeste kantoren, tweede, gedeelde eerste plaats. */
export const MAJORITY_FIRST = 2;
export const MAJORITY_SECOND = 1;
export const MAJORITY_TIE = 1;
export const PLAYER_COLORS = [
  { name: 'rood', hex: '#b03a2e', shape: 'triangle' },
  { name: 'blauw', hex: '#2e5c8a', shape: 'circle' },
  { name: 'groen', hex: '#3d7a4a', shape: 'square' },
  { name: 'paars', hex: '#6b4a8a', shape: 'diamond' },
] as const;
