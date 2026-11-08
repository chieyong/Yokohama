import { CONTRACT_BY_ID, LOCATION_INFO, RESOURCES, buildCost, hasOffice, type GameState, type Move, type Resource } from '../engine/src';
import { resName } from './describe';

function goods(list: Resource[]): string {
  return RESOURCES.filter((r) => list.includes(r))
    .map((r) => `${list.filter((x) => x === r).length} ${resName(r)}`)
    .join(' + ');
}

/** Korte beschrijving van alleen de actie (voor de melding op het bord). */
export function actionText(s: GameState, m: Move): string {
  const me = s.players[s.current]!;
  const bonus = hasOffice(s, me.boat, s.current);
  switch (m.type) {
    case 'produce': {
      const info = LOCATION_INFO[me.boat];
      return info.kind === 'produce' ? `haalt ${bonus ? 2 : 1} ${resName(info.resource)} op` : 'werkt';
    }
    case 'sell':
      return `verkoopt ${goods(m.goods)} voor ƒ${m.goods.length * 2 + (bonus ? 1 : 0)}`;
    case 'trade':
      return `ruilt ${goods(m.give)} → ${goods(m.take)}`;
    case 'takeContract': {
      const c = CONTRACT_BY_ID[m.contract]!;
      return `neemt contract (${goods(RESOURCES.flatMap((r) => Array(c.cost[r] ?? 0).fill(r)))} · ${c.points} pnt)`;
    }
    case 'deliver':
      return `levert af: +${CONTRACT_BY_ID[m.contract]!.points + (bonus ? 1 : 0)} punten`;
    case 'build':
      return `vestigt een kantoor (ƒ${buildCost(s, me.boat)})`;
    case 'rest':
      return 'rust (+ƒ1)';
    default:
      return '';
  }
}

/** Volledige logregel voor een beurt. `s` is de stand vóór de beurt. */
export function turnText(s: GameState, moves: Move[], after: GameState): string {
  const [sail, action] = moves as [Move, Move];
  const from = s.players[s.current]!.boat;
  const where = sail.type === 'move' ? `vaart naar ${LOCATION_INFO[sail.to].name}` : `blijft in ${LOCATION_INFO[from].name}`;
  const mid = { ...s, players: s.players.map((p, i) => (i === s.current ? { ...p, boat: sail.type === 'move' ? sail.to : from } : p)) };
  const paid = s.players
    .map((p, i) => ({ name: p.name, d: after.players[i]!.gulden - p.gulden, i }))
    .filter((x) => x.i !== s.current && x.d > 0)
    .map((x) => `${x.name} +ƒ${x.d}`);
  return `${where} en ${actionText(mid, action)}${paid.length ? ` (${paid.join(', ')})` : ''}`;
}
