import { LOCATIONS, type LocationId } from './board';
import { CONTRACT_BY_ID } from './contracts';
import { OFFICES_PER_PLAYER, UNDELIVERED_PENALTY } from './constants';
import type { GameState } from './types';

export interface ScoreBreakdown {
  player: number;
  contracts: number;
  offices: number;
  majorities: number;
  money: number;
  penalty: number;
  total: number;
  /** Gedeelde winst is mogelijk. */
  winner: boolean;
}

/** Meerderheidspunten voor één locatie: [punten per speler]. */
export function majorityPoints(counts: number[]): number[] {
  const pts = counts.map(() => 0);
  const present = [...new Set(counts.filter((c) => c > 0))].sort((a, b) => b - a);
  const first = present[0];
  if (first === undefined) return pts;
  const top = counts.flatMap((c, i) => (c === first ? [i] : []));
  if (top.length > 1) {
    top.forEach((i) => (pts[i] = 2));
    return pts;
  }
  pts[top[0]!] = 3;
  const second = present[1];
  if (second !== undefined) counts.forEach((c, i) => c === second && (pts[i] = 1));
  return pts;
}

export function finalScores(s: GameState): ScoreBreakdown[] {
  const maj = s.players.map(() => 0);
  for (const loc of LOCATIONS as readonly LocationId[]) {
    majorityPoints(s.offices[loc]).forEach((p, i) => (maj[i]! += p));
  }
  const rows = s.players.map((p, i) => {
    const contracts = p.delivered.reduce((a, id) => a + CONTRACT_BY_ID[id]!.points, 0) + p.bonusPoints;
    const offices = OFFICES_PER_PLAYER - p.officesLeft;
    const money = Math.floor(p.gulden / 3);
    const penalty = -UNDELIVERED_PENALTY * p.hand.length;
    const majorities = maj[i]!;
    return {
      player: i,
      contracts,
      offices,
      majorities,
      money,
      penalty,
      total: contracts + offices + majorities + money + penalty,
      winner: false,
    };
  });
  const best = Math.max(...rows.map((r) => r.total));
  const top = rows.filter((r) => r.total === best);
  const richest = Math.max(...top.map((r) => s.players[r.player]!.gulden));
  top.forEach((r) => (r.winner = s.players[r.player]!.gulden === richest));
  return rows;
}
