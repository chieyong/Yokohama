import type { LocationId, Resource } from '../engine/src';
import { LOCATION_INFO } from '../engine/src';

export const C = {
  paper: '#f1e6cc',
  paperDark: '#e3d2ab',
  paperEdge: '#c9b184',
  ink: '#3a2817',
  inkSoft: '#6d5538',
  wood: '#8b5a2b',
  woodDark: '#5a3819',
  water: '#86aeb0',
  waterDeep: '#5d8890',
  waterLight: '#b7d0cc',
};

export const RES: Record<Resource, { label: string; color: string }> = {
  koffie: { label: 'Koffie', color: '#6b3f22' },
  tabak: { label: 'Tabak', color: '#b07a24' },
  graan: { label: 'Graan', color: '#c9a13a' },
  staal: { label: 'Staal', color: '#5d7889' },
};

const KIND_COLOR = {
  market: '#b0502c',
  exchange: '#3f6f5e',
  contracts: '#2f4a6b',
  deliver: '#8a3448',
} as const;

export function locColor(l: LocationId): string {
  const i = LOCATION_INFO[l];
  return i.kind === 'produce' ? RES[i.resource].color : KIND_COLOR[i.kind];
}

/** Bordcoördinaten (viewBox 0 0 410 770). */
export const BOARD_W = 410;
export const BOARD_H = 770;
export const POS: Record<LocationId, { x: number; y: number }> = {
  binnenrotte: { x: 330, y: 90 },
  beurs: { x: 185, y: 120 },
  delfshaven: { x: 70, y: 235 },
  veerhaven: { x: 180, y: 290 },
  oudeHaven: { x: 330, y: 265 },
  wilhelminapier: { x: 220, y: 520 },
  katendrecht: { x: 75, y: 565 },
  feijenoord: { x: 340, y: 575 },
};

export const PLAYERS = [
  { name: 'Rood', color: '#b03a2e', shape: 'triangle' },
  { name: 'Blauw', color: '#2c6aa0', shape: 'circle' },
  { name: 'Groen', color: '#3d7a3f', shape: 'square' },
  { name: 'Paars', color: '#74508f', shape: 'diamond' },
] as const;
export type Shape = (typeof PLAYERS)[number]['shape'];

export const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
