import type { Resource } from './board';

export interface Contract {
  id: string;
  cost: Partial<Record<Resource, number>>;
  points: number;
}

/** 30 contracten: 2 goederen = 6 pnt, 3 = 8, 4 = 10 (4 verschillende = 11), 5 = 13. */
const raw: [Partial<Record<Resource, number>>, number][] = [
  [{ koffie: 1, tabak: 1 }, 6],
  [{ koffie: 1, graan: 1 }, 6],
  [{ koffie: 1, staal: 1 }, 6],
  [{ tabak: 1, graan: 1 }, 6],
  [{ tabak: 1, staal: 1 }, 6],
  [{ graan: 1, staal: 1 }, 6],
  [{ koffie: 2, tabak: 1 }, 8],
  [{ koffie: 2, staal: 1 }, 8],
  [{ tabak: 2, graan: 1 }, 8],
  [{ tabak: 2, koffie: 1 }, 8],
  [{ graan: 2, staal: 1 }, 8],
  [{ graan: 2, koffie: 1 }, 8],
  [{ staal: 2, tabak: 1 }, 8],
  [{ staal: 2, graan: 1 }, 8],
  [{ koffie: 1, tabak: 1, graan: 1, staal: 1 }, 11],
  [{ koffie: 2, tabak: 2 }, 10],
  [{ graan: 2, staal: 2 }, 10],
  [{ koffie: 2, staal: 2 }, 10],
  // uitbreiding naar 30 (langere partijen)
  [{ koffie: 1, graan: 1 }, 6],
  [{ tabak: 1, staal: 1 }, 6],
  [{ koffie: 1, tabak: 1, graan: 1 }, 8],
  [{ koffie: 1, tabak: 1, staal: 1 }, 8],
  [{ koffie: 1, graan: 1, staal: 1 }, 8],
  [{ tabak: 1, graan: 1, staal: 1 }, 8],
  [{ koffie: 2, graan: 2 }, 10],
  [{ tabak: 2, staal: 2 }, 10],
  [{ tabak: 2, graan: 2 }, 10],
  [{ koffie: 1, tabak: 1, graan: 1, staal: 1 }, 11],
  [{ koffie: 2, tabak: 2, staal: 1 }, 13],
  [{ graan: 2, staal: 2, tabak: 1 }, 13],
];

export const CONTRACTS: Contract[] = raw.map(([cost, points], i) => ({
  id: `c${String(i + 1).padStart(2, '0')}`,
  cost,
  points,
}));

export const CONTRACT_BY_ID: Record<string, Contract> = Object.fromEntries(
  CONTRACTS.map((c) => [c.id, c]),
);
