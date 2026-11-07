export const RESOURCES = ['koffie', 'tabak', 'graan', 'staal'] as const;
export type Resource = (typeof RESOURCES)[number];

export const LOCATIONS = [
  'delfshaven',
  'veerhaven',
  'beurs',
  'binnenrotte',
  'oudeHaven',
  'feijenoord',
  'wilhelminapier',
  'katendrecht',
] as const;
export type LocationId = (typeof LOCATIONS)[number];

export type LocationKind =
  | { kind: 'produce'; resource: Resource }
  | { kind: 'market' }
  | { kind: 'exchange' }
  | { kind: 'contracts' }
  | { kind: 'deliver' };

export const LOCATION_INFO: Record<LocationId, { name: string } & LocationKind> = {
  delfshaven: { name: 'Delfshaven', kind: 'produce', resource: 'graan' },
  oudeHaven: { name: 'Oude Haven', kind: 'produce', resource: 'koffie' },
  katendrecht: { name: 'Katendrecht', kind: 'produce', resource: 'tabak' },
  feijenoord: { name: 'Feijenoord', kind: 'produce', resource: 'staal' },
  binnenrotte: { name: 'Binnenrotte', kind: 'market' },
  veerhaven: { name: 'Veerhaven', kind: 'exchange' },
  beurs: { name: 'Beurs', kind: 'contracts' },
  wilhelminapier: { name: 'Wilhelminapier', kind: 'deliver' },
};

export const PRODUCE_LOCATIONS: LocationId[] = LOCATIONS.filter(
  (l) => LOCATION_INFO[l].kind === 'produce',
);

export const EDGES: [LocationId, LocationId][] = [
  ['delfshaven', 'veerhaven'],
  ['veerhaven', 'beurs'],
  ['beurs', 'binnenrotte'],
  ['delfshaven', 'katendrecht'],
  ['veerhaven', 'wilhelminapier'],
  ['beurs', 'oudeHaven'],
  ['binnenrotte', 'oudeHaven'],
  ['oudeHaven', 'feijenoord'],
  ['katendrecht', 'wilhelminapier'],
  ['wilhelminapier', 'feijenoord'],
];

export const NEIGHBOURS: Record<LocationId, LocationId[]> = Object.fromEntries(
  LOCATIONS.map((l) => [
    l,
    EDGES.flatMap(([a, b]) => (a === l ? [b] : b === l ? [a] : [])),
  ]),
) as Record<LocationId, LocationId[]>;

/** Alle locaties die in 1 of 2 stappen bereikbaar zijn (exclusief de start). */
export function reachable(from: LocationId): LocationId[] {
  const set = new Set<LocationId>();
  for (const a of NEIGHBOURS[from]) {
    set.add(a);
    for (const b of NEIGHBOURS[a]) set.add(b);
  }
  set.delete(from);
  return LOCATIONS.filter((l) => set.has(l));
}
