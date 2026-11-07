import { describe, expect, it } from 'vitest';
import { finalScores, majorityPoints } from '../src';
import { at } from './helpers';

describe('meerderheden', () => {
  it('meeste 3, tweede 1', () => expect(majorityPoints([3, 1, 0])).toEqual([3, 1, 0]));
  it('niemand: 0', () => expect(majorityPoints([0, 0, 0])).toEqual([0, 0, 0]));
  it('alleen jij: 3', () => expect(majorityPoints([0, 2, 0])).toEqual([0, 3, 0]));
  it('gelijk om eerste: ieder 2, geen tweede', () =>
    expect(majorityPoints([2, 2, 1])).toEqual([2, 2, 0]));
  it('gelijk om tweede: ieder 1', () => expect(majorityPoints([3, 1, 1, 0])).toEqual([3, 1, 1, 0]));
});

describe('eindtelling', () => {
  it('alle categorieën', () => {
    const g = at('beurs');
    const p = g.players[0]!;
    p.delivered = ['c01', 'c15']; // 3 + 8
    p.bonusPoints = 1;
    p.officesLeft = 3; // 3 gebouwd
    g.offices.beurs = [2, 1, 0]; // 3
    g.offices.delfshaven = [1, 1, 0]; // 2
    p.gulden = 8; // 2
    p.hand = ['c02']; // -2
    const s = finalScores(g)[0]!;
    expect(s).toMatchObject({ contracts: 12, offices: 3, majorities: 5, money: 2, penalty: -2 });
    expect(s.total).toBe(20);
  });

  it('winnaar; gelijke stand → meeste geld', () => {
    const g = at('beurs');
    g.players.forEach((p) => (p.gulden = 0));
    g.players[0]!.delivered = ['c01'];
    g.players[1]!.delivered = ['c02'];
    g.players[1]!.gulden = 2; // 0 punten, wel tiebreak
    const s = finalScores(g);
    expect(s.map((r) => r.winner)).toEqual([false, true, false]);
  });

  it('volledig gelijk: gedeelde winst', () => {
    const g = at('beurs');
    g.players.forEach((p) => {
      p.gulden = 1;
      p.hand = [];
    });
    expect(finalScores(g).every((r) => r.winner)).toBe(true);
  });
});
