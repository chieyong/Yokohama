import type { LocationId, Resource } from '../engine/src';
import { LOCATION_INFO } from '../engine/src';

export const C = {
  paper: '#ecdcb8', // zandsteen / land
  paperDark: '#dcc79a',
  paperEdge: '#b99d6a',
  ink: '#2b2118',
  inkSoft: '#5e4c36',
  wood: '#7a4f2a',
  woodDark: '#2e241b', // ebbenhout
  gold: '#c09a45',
  goldLight: '#e3c77c',
  water: '#6f7f74', // donker groengrijs als op het schilderij
  waterDeep: '#47534c',
  waterLight: '#b9c2b0',
  skyTop: '#55728f',
  skyMid: '#9fb0b8',
  cloud: '#f2e8d2',
  cloudShade: '#a9aba3',
  skyline: '#3f3830',
};

export const RES: Record<Resource, { label: string; color: string }> = {
  koffie: { label: 'Koffie', color: '#5a3820' },
  tabak: { label: 'Tabak', color: '#a26c26' },
  graan: { label: 'Graan', color: '#c49a3c' },
  staal: { label: 'Staal', color: '#53657a' },
};

const KIND_COLOR = {
  market: '#a2452b',
  exchange: '#4d6a44',
  contracts: '#2c3d56',
  deliver: '#7c2b3b',
} as const;

export function locColor(l: LocationId): string {
  const i = LOCATION_INFO[l];
  return i.kind === 'produce' ? RES[i.resource].color : KIND_COLOR[i.kind];
}

/** Bordcoördinaten (viewBox 0 0 410 600). */
export const BOARD_W = 410;
export const BOARD_H = 600;
export const POS: Record<LocationId, { x: number; y: number }> = {
  binnenrotte: { x: 330, y: 104 },
  beurs: { x: 185, y: 122 },
  delfshaven: { x: 70, y: 208 },
  veerhaven: { x: 185, y: 252 },
  oudeHaven: { x: 330, y: 240 },
  wilhelminapier: { x: 220, y: 412 },
  katendrecht: { x: 75, y: 442 },
  feijenoord: { x: 340, y: 448 },
};

export const PLAYERS = [
  { name: 'Rood', color: '#b8382a', shape: 'triangle' },
  { name: 'Blauw', color: '#2f6fae', shape: 'circle' },
  { name: 'Groen', color: '#3d7a3f', shape: 'square' },
  { name: 'Paars', color: '#74508f', shape: 'diamond' },
] as const;
export type Shape = (typeof PLAYERS)[number]['shape'];

export const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
