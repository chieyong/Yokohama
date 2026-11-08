import { describe, expect, it } from 'vitest';
import { applyMove, createGame, isGameOver } from '../../engine/src';
import { botTurn, type BotLevel } from '..';
import { enumerateTurns, turnsLeft } from '../turns';

describe('bots', () => {
  for (const level of ['easy', 'normal', 'hard'] as BotLevel[]) {
    it(`${level} speelt een volledige partij met alleen legale zetten`, () => {
      let s = createGame({ seed: 11, players: [{ name: 'a', kind: level }, { name: 'b', kind: level }] });
      let rng = 3;
      while (!isGameOver(s)) {
        let moves;
        [moves, rng] = botTurn(s, level, rng, 20);
        expect(moves).toHaveLength(2);
        for (const m of moves) s = applyMove(s, m); // gooit bij een illegale zet
      }
      expect(isGameOver(s)).toBe(true);
    });
  }

  it('is reproduceerbaar met dezelfde rng (easy/normal)', () => {
    const s = createGame({ seed: 5, players: [{ name: 'a', kind: 'easy' }, { name: 'b', kind: 'easy' }] });
    expect(botTurn(s, 'easy', 9)).toEqual(botTurn(s, 'easy', 9));
  });

  it('enumerateTurns: elke beurt is varen/blijven + één actie', () => {
    const s = createGame({ seed: 2, players: [{ name: 'a', kind: 'normal' }, { name: 'b', kind: 'normal' }] });
    const turns = enumerateTurns(s);
    expect(turns.length).toBeGreaterThan(0);
    for (const t of turns) {
      expect(['move', 'stay']).toContain(t.moves[0]!.type);
      expect(t.after.current).not.toBe(s.current);
    }
  });

  it('turnsLeft telt de lopende beurt mee', () => {
    const s = createGame({ seed: 2, players: [{ name: 'a', kind: 'normal' }, { name: 'b', kind: 'normal' }] });
    expect(turnsLeft(s, s.current)).toBe(10);
  });
});
