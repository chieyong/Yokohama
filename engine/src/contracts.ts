import type { Resource } from './board';

export interface Contract {
  id: string;
  cost: Partial<Record<Resource, number>>;
  points: number;
}

/** 18 contracten: 6× twee goederen (6 pnt), 8× drie goederen (8 pnt), 4× vier goederen (10–11 pnt). */
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
];

export const CONTRACTS: Contract[] = raw.map(([cost, points], i) => ({
  id: `c${String(i + 1).padStart(2, '0')}`,
  cost,
  points,
}));

export const CONTRACT_BY_ID: Record<string, Contract> = Object.fromEntries(
  CONTRACTS.map((c) => [c.id, c]),
);
