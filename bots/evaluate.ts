import {
  CONTRACT_BY_ID, LOCATIONS, NEIGHBOURS, PRODUCE_AMOUNT, RESOURCES, finalScores, hasOffice, reachable,
  type GameState, type LocationId,
} from '../engine/src';
import { turnsLeft } from './turns';

/**
 * Schatting van de eindscore van speler p.
 * Basis = huidige telling; daarbovenop de verwachte waarde van contracten,
 * goederen, geld en kantoren, afhankelijk van het aantal resterende beurten.
 */
export function evaluate(s: GameState, p: number): number {
  const score = finalScores(s)[p]!;
  const me = s.players[p]!;
  if (s.phase === 'gameOver') return score.total;

  const left = turnsLeft(s, p);
  let v = score.total - score.money + me.gulden / 3;

  // Contracten: haalbaar in de resterende beurten?
  const avail = { ...me.resources };
  let needTurns = 0;
  let canDeliverNow = false;
  const hand = me.hand.map((id) => CONTRACT_BY_ID[id]!).sort((a, b) => b.points - a.points);
  for (const c of hand) {
    let missing = 0;
    let visits = 0; // havenbezoeken: PRODUCE_AMOUNT per keer
    for (const r of RESOURCES) {
      const need = c.cost[r] ?? 0;
      const use = Math.min(need, avail[r]);
      avail[r] -= use;
      missing += need - use;
      visits += Math.ceil((need - use) / PRODUCE_AMOUNT);
    }
    if (missing === 0) canDeliverNow = true;
    needTurns += visits + 1;
    if (needTurns <= left) {
      const conf = Math.max(0.3, 0.95 - 0.1 * missing - (needTurns > left - 1 ? 0.25 : 0));
      v += (c.points + 2) * conf * 0.6; // +2: strafpunt vervalt; 0.6 = afgesteld in simulaties
    }
  }

  // Overige goederen: verkoop- of ruilwaarde.
  for (const r of RESOURCES) v += avail[r] * (left > 0 ? 0.45 : 0);

  // Geld is vroeg in het spel meer waard (kantoren bouwen).
  if (left > 2) v += me.gulden * 0.12;

  // Kantoren: toekomstige bonus en inkomsten van anderen.
  for (const l of LOCATIONS) {
    if (hasOffice(s, l, p)) v += left * (0.12 + 0.06 * (s.players.length - 1));
  }

  // Positie: kun je volgende beurt afleveren?
  if (canDeliverNow && left > 0) {
    const pier: LocationId = 'wilhelminapier';
    if (me.boat !== pier && reachable(me.boat).includes(pier)) v += 1.2;
    else if (me.boat !== pier && NEIGHBOURS[pier].some((x) => reachable(me.boat).includes(x))) v += 0.4;
  }
  return v;
}

/** Relatieve waarde: eigen score minus de sterkste tegenstander. */
export function relativeValue(s: GameState, p: number): number {
  const vals = s.players.map((_, i) => evaluate(s, i));
  const mine = vals[p]!;
  const best = Math.max(...vals.filter((_, i) => i !== p));
  return mine - 0.5 * best;
}
