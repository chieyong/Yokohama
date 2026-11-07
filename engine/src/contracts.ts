import type { Resource } from './board';

export interface Contract {
  id: string;
  cost: Partial<Record<Resource, number>>;
  points: number;
}

/** 18 contracten: 6× twee goederen, 8× drie goederen, 4× vier goederen. */
const raw: [Partial<Record<Resource, number>>, number][] = [
  [{ koffie: 1, tabak: 1 }, 3],
  [{ koffie: 1, graan: 1 }, 3],
  [{ koffie: 1, staal: 1 }, 3],
  [{ tabak: 1, graan: 1 }, 3],
  [{ tabak: 1, staal: 1 }, 3],
  [{ graan: 1, staal: 1 }, 3],
  [{ koffie: 2, tabak: 1 }, 5],
  [{ koffie: 2, staal: 1 }, 5],
  [{ tabak: 2, graan: 1 }, 5],
  [{ tabak: 2, koffie: 1 }, 5],
  [{ graan: 2, staal: 1 }, 5],
  [{ graan: 2, koffie: 1 }, 5],
  [{ staal: 2, tabak: 1 }, 5],
  [{ staal: 2, graan: 1 }, 5],
  [{ koffie: 1, tabak: 1, graan: 1, staal: 1 }, 8],
  [{ koffie: 2, tabak: 2 }, 7],
  [{ graan: 2, staal: 2 }, 7],
  [{ koffie: 2, staal: 2 }, 7],
];

export const CONTRACTS: Contract[] = raw.map(([cost, points], i) => ({
  id: `c${String(i + 1).padStart(2, '0')}`,
  cost,
  points,
}));

export const CONTRACT_BY_ID: Record<string, Contract> = Object.fromEntries(
  CONTRACTS.map((c) => [c.id, c]),
);
