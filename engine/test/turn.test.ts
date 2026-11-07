import { describe, expect, it } from 'vitest';
import {
  NEIGHBOURS,
  applyMove,
  createGame,
  isGameOver,
  legalMoves,
  reachable,
  type GameState,
} from '../src';

const game = (n = 3, seed = 1) =>
  createGame({ seed, players: Array.from({ length: n }, (_, i) => ({ name: `P${i}`, kind: 'human' })) });

describe('bord', () => {
  it('verbindingen zijn symmetrisch', () => {
    for (const [a, ns] of Object.entries(NEIGHBOURS)) {
      for (const b of ns) expect(NEIGHBOURS[b]).toContain(a);
    }
  });
  it('bereik is 1 of 2 stappen, zonder start', () => {
    expect(reachable('delfshaven').sort()).toEqual(
      ['veerhaven', 'katendrecht', 'beurs', 'wilhelminapier'].sort(),
    );
    expect(reachable('delfshaven')).not.toContain('delfshaven');
  });
});

describe('varen', () => {
  it('alleen bereikbare, onbezette locaties', () => {
    const g = game(4);
    const me = g.players[g.current]!;
    const others = g.players.filter((p) => p !== me).map((p) => p.boat);
    const dests = legalMoves(g).map((m) => (m.type === 'move' ? m.to : null));
    for (const d of dests) {
      expect(reachable(me.boat)).toContain(d);
      expect(others).not.toContain(d);
    }
  });

  it('door een bezette locatie heen varen mag', () => {
    const g = game(2);
    const me = g.players[g.current]!;
    const other = g.players[(g.current + 1) % 2]!;
    me.boat = 'delfshaven';
    other.boat = 'veerhaven';
    const dests = legalMoves(g).map((m) => (m.type === 'move' ? m.to : ''));
    expect(dests).toContain('beurs'); // via veerhaven
    expect(dests).not.toContain('veerhaven');
  });

  it('blijven liggen als er geen bestemming is', () => {
    const g: GameState = structuredClone(game(2));
    const me = g.players[g.current]!;
    me.boat = 'katendrecht';
    // Extra schuiten op elke bestemming (alleen voor deze test).
    for (const t of reachable('katendrecht')) g.players.push({ ...me, boat: t });
    expect(legalMoves(g)).toEqual([{ type: 'stay' }]);
    expect(applyMove(g, { type: 'stay' }).phase).toBe('action');
  });

  it('na varen volgt de actiefase', () => {
    const g = game();
    const g2 = applyMove(g, legalMoves(g)[0]!);
    expect(g2.phase).toBe('action');
    expect(g2.current).toBe(g.current);
  });
});

describe('beurtstructuur', () => {
  it('illegale zet wordt geweigerd', () => {
    const g = game();
    expect(() => applyMove(g, { type: 'rest' })).toThrow();
    expect(() => applyMove(g, { type: 'move', to: g.players[g.current]!.boat })).toThrow();
  });

  it('applyMove muteert de oude state niet', () => {
    const g = game();
    const before = JSON.stringify(g);
    applyMove(g, legalMoves(g)[0]!);
    expect(JSON.stringify(g)).toBe(before);
  });

  it('rusten geeft ƒ1 en geeft de beurt door met de klok mee', () => {
    let g = game(3);
    const p = g.current;
    g = applyMove(g, legalMoves(g)[0]!);
    const gulden = g.players[p]!.gulden;
    g = applyMove(g, { type: 'rest' });
    expect(g.players[p]!.gulden).toBe(gulden + 1);
    expect(g.current).toBe((p + 1) % 3);
    expect(g.phase).toBe('move');
  });

  it('nieuwe ronde als de startspeler weer aan de beurt is', () => {
    let g = game(3);
    for (let i = 0; i < 3; i++) {
      expect(g.round).toBe(1);
      g = applyMove(applyMove(g, legalMoves(g)[0]!), { type: 'rest' });
    }
    expect(g.round).toBe(2);
    expect(g.current).toBe(g.startPlayer);
  });

  for (const n of [2, 3, 4]) {
    it(`spel eindigt na 10 rondes (${n} spelers)`, () => {
      let g = game(n, 9);
      let turns = 0;
      while (!isGameOver(g)) {
        g = applyMove(g, legalMoves(g)[0]!);
        g = applyMove(g, legalMoves(g)[0]!);
        turns++;
      }
      expect(turns).toBe(10 * n);
      expect(legalMoves(g)).toEqual([]);
    });
  }
});
