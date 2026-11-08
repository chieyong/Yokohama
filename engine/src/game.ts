import { LOCATIONS, LOCATION_INFO, RESOURCES, reachable, type LocationId, type Resource } from './board';
import { CONTRACT_BY_ID } from './contracts';
import { BUILD_BASE_COST, DISPLAY_SIZE, HAND_LIMIT, SELL_PRICE } from './constants';
import type { GameState, Goods, Move, PlayerState } from './types';

// ---------- hulpfuncties ----------

/** Alle multisets van grootte k uit de beschikbare voorraad (gesorteerd). */
function multisets(avail: Record<Resource, number>, k: number, from = 0): Goods[] {
  if (k === 0) return [[]];
  const out: Goods[] = [];
  for (let i = from; i < RESOURCES.length; i++) {
    const r = RESOURCES[i]!;
    if (avail[r] <= 0) continue;
    const rest = { ...avail, [r]: avail[r] - 1 };
    for (const m of multisets(rest, k - 1, i)) out.push([r, ...m]);
  }
  return out;
}

const UNLIMITED: Record<Resource, number> = { koffie: 9, tabak: 9, graan: 9, staal: 9 };

export function hasOffice(s: GameState, loc: LocationId, player: number): boolean {
  return (s.offices[loc][player] ?? 0) > 0;
}

export function officesAt(s: GameState, loc: LocationId): number {
  return s.offices[loc].reduce((a, b) => a + b, 0);
}

export function buildCost(s: GameState, loc: LocationId): number {
  return BUILD_BASE_COST + officesAt(s, loc);
}

export function canPay(p: PlayerState, cost: Partial<Record<Resource, number>>): boolean {
  return RESOURCES.every((r) => p.resources[r] >= (cost[r] ?? 0));
}

// ---------- legale zetten ----------

function workMoves(s: GameState): Move[] {
  const me = s.players[s.current]!;
  const loc = me.boat;
  const info = LOCATION_INFO[loc];
  const bonus = hasOffice(s, loc, s.current);

  switch (info.kind) {
    case 'produce':
      return [{ type: 'produce' }];
    case 'market':
      return [...multisets(me.resources, 1), ...multisets(me.resources, 2)].map((goods) => ({
        type: 'sell',
        goods,
      }));
    case 'exchange': {
      const out: Move[] = [];
      for (let k = 1; k <= (bonus ? 2 : 1); k++) {
        for (const give of multisets(me.resources, k)) {
          for (const take of multisets(UNLIMITED, k)) {
            if (take.some((t) => give.includes(t))) continue;
            out.push({ type: 'trade', give, take });
          }
        }
      }
      return out;
    }
    case 'contracts':
      if (me.hand.length >= HAND_LIMIT) return [];
      return s.display.map((contract) => ({ type: 'takeContract', contract }));
    case 'deliver':
      return me.hand
        .filter((id) => canPay(me, CONTRACT_BY_ID[id]!.cost))
        .map((contract) => ({ type: 'deliver', contract }));
  }
}

export function legalMoves(state: GameState): Move[] {
  const me = state.players[state.current]!;
  if (state.phase === 'move') {
    const occupied = new Set(state.players.map((p) => p.boat));
    const dests = reachable(me.boat).filter((l) => !occupied.has(l));
    return dests.length ? dests.map((to) => ({ type: 'move', to })) : [{ type: 'stay' }];
  }
  if (state.phase === 'action') {
    const moves = workMoves(state);
    if (me.officesLeft > 0 && me.gulden >= buildCost(state, me.boat)) moves.push({ type: 'build' });
    moves.push({ type: 'rest' });
    return moves;
  }
  return [];
}

const key = (m: Move) => JSON.stringify(m);

export function isLegal(state: GameState, move: Move): boolean {
  const k = key(move);
  return legalMoves(state).some((m) => key(m) === k);
}

// ---------- zetten uitvoeren ----------

function payOthers(s: GameState, loc: LocationId) {
  s.players.forEach((p, i) => {
    if (i !== s.current && hasOffice(s, loc, i)) p.gulden += 1;
  });
}

/** Snelle diepe kopie van de spelstand. */
export function cloneState(s: GameState): GameState {
  const offices = {} as GameState['offices'];
  for (const l of LOCATIONS) offices[l] = s.offices[l].slice();
  return {
    ...s,
    players: s.players.map((p) => ({
      ...p,
      resources: { ...p.resources },
      hand: p.hand.slice(),
      delivered: p.delivered.slice(),
    })),
    offices,
    deck: s.deck.slice(),
    display: s.display.slice(),
  };
}

export function applyMove(state: GameState, move: Move): GameState {
  if (!isLegal(state, move)) throw new Error(`Illegale zet: ${key(move)}`);
  return applyMoveUnchecked(state, move);
}

/** Zonder legaliteitscheck: alleen voor zetten uit legalMoves (bots). */
export function applyMoveUnchecked(state: GameState, move: Move): GameState {
  const s = cloneState(state);
  const me = s.players[s.current]!;
  const loc = me.boat;
  const bonus = hasOffice(s, loc, s.current);

  switch (move.type) {
    case 'move':
      me.boat = move.to;
      s.phase = 'action';
      return s;
    case 'stay':
      s.phase = 'action';
      return s;

    case 'produce': {
      const info = LOCATION_INFO[loc];
      if (info.kind === 'produce') me.resources[info.resource] += bonus ? 2 : 1;
      payOthers(s, loc);
      break;
    }
    case 'sell':
      for (const r of move.goods) me.resources[r] -= 1;
      me.gulden += move.goods.length * SELL_PRICE + (bonus ? 1 : 0);
      payOthers(s, loc);
      break;
    case 'trade':
      for (const r of move.give) me.resources[r] -= 1;
      for (const r of move.take) me.resources[r] += 1;
      payOthers(s, loc);
      break;
    case 'takeContract':
      s.display = s.display.filter((c) => c !== move.contract);
      me.hand.push(move.contract);
      while (s.display.length < DISPLAY_SIZE && s.deck.length) s.display.push(s.deck.shift()!);
      if (bonus) me.gulden += 1;
      payOthers(s, loc);
      break;
    case 'deliver': {
      const c = CONTRACT_BY_ID[move.contract]!;
      for (const r of RESOURCES) me.resources[r] -= c.cost[r] ?? 0;
      me.hand = me.hand.filter((id) => id !== move.contract);
      me.delivered.push(move.contract);
      if (bonus) me.bonusPoints += 1;
      payOthers(s, loc);
      break;
    }
    case 'build':
      me.gulden -= buildCost(s, loc);
      s.offices[loc][s.current] = (s.offices[loc][s.current] ?? 0) + 1;
      me.officesLeft -= 1;
      break;
    case 'rest':
      me.gulden += 1;
      break;
  }
  return endTurn(s);
}

function endTurn(s: GameState): GameState {
  const n = s.players.length;
  s.current = (s.current + 1) % n;
  s.phase = 'move';
  if (s.current === s.startPlayer) {
    s.round += 1;
    if (s.round > s.maxRounds) {
      s.round = s.maxRounds;
      s.phase = 'gameOver';
    }
  }
  return s;
}

export function isGameOver(state: GameState): boolean {
  return state.phase === 'gameOver';
}
