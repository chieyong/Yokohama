import { describe, expect, it } from 'vitest';
import { applyMove, legalMoves, CONTRACT_BY_ID, type Move } from '../src';
import { at } from './helpers';

const types = (ms: Move[]) => [...new Set(ms.map((m) => m.type))];

describe('werken: goederenlocaties', () => {
  it('levert 1 goed', () => {
    const g = applyMove(at('oudeHaven'), { type: 'produce' });
    expect(g.players[0]!.resources.koffie).toBe(1);
  });
  it('met eigen kantoor 2 goederen', () => {
    const g = at('feijenoord');
    g.offices.feijenoord[0] = 1;
    expect(applyMove(g, { type: 'produce' }).players[0]!.resources.staal).toBe(2);
  });
  it('andere spelers met kantoor krijgen ƒ1, ongeacht aantal', () => {
    const g = at('delfshaven');
    g.offices.delfshaven = [0, 3, 1];
    const before = g.players.map((p) => p.gulden);
    const after = applyMove(g, { type: 'produce' }).players.map((p) => p.gulden);
    expect(after).toEqual([before[0], before[1]! + 1, before[2]! + 1]);
  });
  it('eigen kantoor betaalt jezelf niets', () => {
    const g = at('katendrecht');
    g.offices.katendrecht = [1, 0, 0];
    const gulden = g.players[0]!.gulden;
    expect(applyMove(g, { type: 'produce' }).players[0]!.gulden).toBe(gulden);
  });
});

describe('werken: markt (Binnenrotte)', () => {
  it('zonder goederen kun je niet verkopen', () => {
    expect(types(legalMoves(at('binnenrotte')))).not.toContain('sell');
  });
  it('verkoop 1 of 2 goederen à ƒ2', () => {
    const g = at('binnenrotte', { res: { koffie: 2, staal: 1 } });
    const sells = legalMoves(g).filter((m) => m.type === 'sell');
    // 1 goed: koffie, staal; 2 goederen: koffie+koffie, koffie+staal
    expect(sells).toHaveLength(4);
    const g2 = applyMove(g, { type: 'sell', goods: ['koffie', 'staal'] });
    expect(g2.players[0]!.gulden).toBe(g.players[0]!.gulden + 4);
    expect(g2.players[0]!.resources).toMatchObject({ koffie: 1, staal: 0 });
  });
  it('met kantoor +ƒ1', () => {
    const g = at('binnenrotte', { res: { graan: 1 } });
    g.offices.binnenrotte[0] = 1;
    expect(applyMove(g, { type: 'sell', goods: ['graan'] }).players[0]!.gulden).toBe(g.players[0]!.gulden + 3);
  });
  it('nooit meer dan 2', () => {
    const g = at('binnenrotte', { res: { graan: 5 } });
    expect(() => applyMove(g, { type: 'sell', goods: ['graan', 'graan', 'graan'] })).toThrow();
  });
});

describe('werken: ruilen (Veerhaven)', () => {
  it('1 goed voor 1 ander soort goed', () => {
    const g = at('veerhaven', { res: { tabak: 1 } });
    const trades = legalMoves(g).filter((m) => m.type === 'trade');
    expect(trades).toHaveLength(3);
    const g2 = applyMove(g, { type: 'trade', give: ['tabak'], take: ['staal'] });
    expect(g2.players[0]!.resources).toMatchObject({ tabak: 0, staal: 1 });
  });
  it('niet voor hetzelfde soort', () => {
    const g = at('veerhaven', { res: { tabak: 1 } });
    expect(() => applyMove(g, { type: 'trade', give: ['tabak'], take: ['tabak'] })).toThrow();
  });
  it('zonder kantoor geen 2 ruilen, met kantoor wel', () => {
    const g = at('veerhaven', { res: { tabak: 2 } });
    const two = { type: 'trade', give: ['tabak', 'tabak'], take: ['koffie', 'staal'] } as Move;
    expect(() => applyMove(g, two)).toThrow();
    g.offices.veerhaven[0] = 1;
    expect(applyMove(g, two).players[0]!.resources).toMatchObject({ tabak: 0, koffie: 1, staal: 1 });
  });
});

describe('werken: Beurs', () => {
  it('neem een contract uit de rij; rij wordt aangevuld', () => {
    const g = at('beurs');
    const c = g.display[1]!;
    const top = g.deck[0]!;
    const g2 = applyMove(g, { type: 'takeContract', contract: c });
    expect(g2.players[0]!.hand).toContain(c);
    expect(g2.display).toHaveLength(3);
    expect(g2.display).toContain(top);
    expect(g2.deck).toHaveLength(g.deck.length - 1);
  });
  it('lege stapel: rij wordt kleiner', () => {
    const g = at('beurs');
    g.deck = [];
    expect(applyMove(g, { type: 'takeContract', contract: g.display[0]! }).display).toHaveLength(2);
  });
  it('volle hand (3): niet mogelijk', () => {
    const g = at('beurs');
    g.players[0]!.hand = ['c01', 'c02', 'c03'];
    expect(types(legalMoves(g))).not.toContain('takeContract');
  });
  it('met kantoor +ƒ1', () => {
    const g = at('beurs');
    g.offices.beurs[0] = 1;
    const g2 = applyMove(g, { type: 'takeContract', contract: g.display[0]! });
    expect(g2.players[0]!.gulden).toBe(g.players[0]!.gulden + 1);
  });
});

describe('werken: afleveren (Wilhelminapier)', () => {
  it('alleen contracten waarvoor je de goederen hebt', () => {
    const g = at('wilhelminapier', { res: { koffie: 1, tabak: 1 } });
    g.players[0]!.hand = ['c01', 'c06']; // c01 koffie+tabak, c06 graan+staal
    const d = legalMoves(g).filter((m) => m.type === 'deliver');
    expect(d).toEqual([{ type: 'deliver', contract: 'c01' }]);
  });
  it('betaalt goederen, contract gaat naar afgeleverd', () => {
    const g = at('wilhelminapier', { res: { koffie: 2, tabak: 1 } });
    g.players[0]!.hand = ['c01'];
    const p = applyMove(g, { type: 'deliver', contract: 'c01' }).players[0]!;
    expect(p.resources).toMatchObject({ koffie: 1, tabak: 0 });
    expect(p.hand).toEqual([]);
    expect(p.delivered).toEqual(['c01']);
    expect(CONTRACT_BY_ID.c01!.points).toBe(6);
  });
  it('per beurt maar 1 contract', () => {
    const g = at('wilhelminapier', { res: { koffie: 5, tabak: 5 } });
    g.players[0]!.hand = ['c01', 'c16'];
    const g2 = applyMove(g, { type: 'deliver', contract: 'c01' });
    expect(g2.current).toBe(1);
  });
  it('met kantoor +1 punt', () => {
    const g = at('wilhelminapier', { res: { koffie: 1, tabak: 1 } });
    g.players[0]!.hand = ['c01'];
    g.offices.wilhelminapier[0] = 1;
    expect(applyMove(g, { type: 'deliver', contract: 'c01' }).players[0]!.bonusPoints).toBe(1);
  });
});

describe('vestigen', () => {
  it('kost ƒ2 + ƒ1 per bestaand kantoor', () => {
    const g = at('beurs');
    g.players[0]!.gulden = 10;
    g.offices.beurs = [1, 2, 0];
    const g2 = applyMove(g, { type: 'build' });
    expect(g2.players[0]!.gulden).toBe(10 - 5);
    expect(g2.offices.beurs).toEqual([2, 2, 0]);
    expect(g2.players[0]!.officesLeft).toBe(5);
  });
  it('niet genoeg geld: niet mogelijk', () => {
    const g = at('beurs');
    g.players[0]!.gulden = 1;
    expect(types(legalMoves(g))).not.toContain('build');
  });
  it('geen kantoren meer: niet mogelijk', () => {
    const g = at('beurs');
    g.players[0]!.gulden = 99;
    g.players[0]!.officesLeft = 0;
    expect(types(legalMoves(g))).not.toContain('build');
  });
  it('betaalt anderen niets', () => {
    const g = at('beurs');
    g.players[0]!.gulden = 10;
    g.offices.beurs = [0, 1, 0];
    expect(applyMove(g, { type: 'build' }).players[1]!.gulden).toBe(g.players[1]!.gulden);
  });
});

describe('rusten', () => {
  it('altijd mogelijk, +ƒ1', () => {
    const g = at('beurs');
    expect(types(legalMoves(g))).toContain('rest');
    expect(applyMove(g, { type: 'rest' }).players[0]!.gulden).toBe(g.players[0]!.gulden + 1);
  });
});
