import { describe, expect, it } from 'vitest';
import { CONTRACTS, PRODUCE_LOCATIONS, createGame, type GameConfig } from '../src';

const cfg = (n: number, seed = 42): GameConfig => ({
  seed,
  players: Array.from({ length: n }, (_, i) => ({ name: `P${i}`, kind: i ? 'normal' : 'human' })),
});

describe('setup', () => {
  it('weigert minder dan 2 of meer dan 4 spelers', () => {
    expect(() => createGame(cfg(1))).toThrow();
    expect(() => createGame(cfg(5))).toThrow();
  });

  it('is reproduceerbaar met dezelfde seed', () => {
    expect(createGame(cfg(4, 7))).toEqual(createGame(cfg(4, 7)));
  });

  it('verschilt bij een andere seed', () => {
    const a = Array.from({ length: 10 }, (_, s) => JSON.stringify(createGame(cfg(3, s))));
    expect(new Set(a).size).toBeGreaterThan(1);
  });

  it('is serialiseerbaar (JSON round-trip)', () => {
    const g = createGame(cfg(4));
    expect(JSON.parse(JSON.stringify(g))).toEqual(g);
  });

  for (const n of [2, 3, 4]) {
    describe(`${n} spelers`, () => {
      const seeds = Array.from({ length: 20 }, (_, i) => i);
      it('startgeld ƒ3, ƒ4, ... vanaf de startspeler', () => {
        for (const seed of seeds) {
          const g = createGame(cfg(n, seed));
          for (let k = 0; k < n; k++) {
            expect(g.players[(g.startPlayer + k) % n]!.gulden).toBe(3 + k);
          }
        }
      });
      it('schuiten op verschillende goederenlocaties', () => {
        for (const seed of seeds) {
          const boats = createGame(cfg(n, seed)).players.map((p) => p.boat);
          expect(new Set(boats).size).toBe(n);
          boats.forEach((b) => expect(PRODUCE_LOCATIONS).toContain(b));
        }
      });
      it('1 contract per speler, rij van 3, rest in stapel', () => {
        const g = createGame(cfg(n));
        g.players.forEach((p) => expect(p.hand).toHaveLength(1));
        expect(g.display).toHaveLength(3);
        expect(g.deck).toHaveLength(CONTRACTS.length - 3 - n);
        const all = [...g.deck, ...g.display, ...g.players.flatMap((p) => p.hand)];
        expect(new Set(all).size).toBe(CONTRACTS.length);
      });
      it('lege voorraad, 6 kantoren, ronde 1, startspeler aan zet', () => {
        const g = createGame(cfg(n));
        g.players.forEach((p) => {
          expect(Object.values(p.resources).every((v) => v === 0)).toBe(true);
          expect(p.officesLeft).toBe(6);
        });
        expect(g.round).toBe(1);
        expect(g.current).toBe(g.startPlayer);
        expect(g.phase).toBe('move');
      });
    });
  }
});
