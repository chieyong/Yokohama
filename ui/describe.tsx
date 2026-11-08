import {
  CONTRACT_BY_ID, LOCATION_INFO, RESOURCES, buildCost, hasOffice,
  type GameState, type LocationId, type Move, type Resource,
} from '../engine/src';
import { Icon, ResourceGlyph } from './icons';
import { RES } from './theme';

export const resName = (r: Resource) => RES[r].label.toLowerCase();

export function Goods({ goods, size = 20 }: { goods: Resource[]; size?: number }) {
  return (
    <span className="goods">
      {goods.map((r, i) => (
        <Icon key={i} size={size} label={RES[r].label}>
          <ResourceGlyph r={r} fill={RES[r].color} />
        </Icon>
      ))}
    </span>
  );
}

export function contractText(id: string): string {
  const c = CONTRACT_BY_ID[id]!;
  const cost = RESOURCES.filter((r) => c.cost[r]).map((r) => `${c.cost[r]} ${resName(r)}`).join(', ');
  return `Lever ${cost} af bij de Wilhelminapier voor ${c.points} punten. Heb je dit contract aan het eind nog in je hand, dan kost het 2 punten.`;
}

export function locationLines(s: GameState, l: LocationId, me: number): string[] {
  const info = LOCATION_INFO[l];
  const lines: string[] = [];
  switch (info.kind) {
    case 'produce':
      lines.push(`Werken: +1 ${resName(info.resource)}, met eigen kantoor +2.`);
      break;
    case 'market':
      lines.push('Werken: verkoop 1 of 2 goederen voor ƒ2 per stuk. Met eigen kantoor +ƒ1.');
      break;
    case 'exchange':
      lines.push('Werken: ruil 1 goed voor 1 ander soort goed. Met eigen kantoor 2 ruilen.');
      break;
    case 'contracts':
      lines.push('Werken: neem 1 open contract (max. 3 in je hand). Met eigen kantoor +ƒ1.');
      break;
    case 'deliver':
      lines.push('Werken: lever 1 contract af voor de punten. Met eigen kantoor +1 punt.');
      break;
  }
  const owners = s.offices[l].flatMap((n, i) => (n > 0 && i !== me ? [i] : []));
  if (owners.length) {
    lines.push(`Werk je hier, dan krijgt ${owners.map((i) => s.players[i]!.name).join(' en ')} ƒ1 (eigen kantoor).`);
  }
  lines.push(`Kantoor vestigen: ƒ${buildCost(s, l)}.${hasOffice(s, l, me) ? ' Je hebt hier al een kantoor.' : ''}`);
  return lines;
}

/** Korte omschrijving van een zet, voor knoppen en log. */
export function MoveLabel({ s, m }: { s: GameState; m: Move }) {
  const me = s.players[s.current]!;
  const bonus = hasOffice(s, me.boat, s.current);
  switch (m.type) {
    case 'move':
      return <>Varen naar {LOCATION_INFO[m.to].name}</>;
    case 'stay':
      return <>Blijf liggen</>;
    case 'produce': {
      const info = LOCATION_INFO[me.boat];
      return info.kind === 'produce' ? (
        <>
          Werken <Goods goods={Array(bonus ? 2 : 1).fill(info.resource)} />
        </>
      ) : null;
    }
    case 'sell':
      return (
        <>
          <Goods goods={m.goods} /> → ƒ{m.goods.length * 2 + (bonus ? 1 : 0)}
        </>
      );
    case 'trade':
      return (
        <>
          <Goods goods={m.give} /> → <Goods goods={m.take} />
        </>
      );
    case 'takeContract':
    case 'deliver':
      return null; // als kaart getoond
    case 'build':
      return <>Vestig kantoor · ƒ{buildCost(s, me.boat)}</>;
    case 'rest':
      return <>Rusten · +ƒ1</>;
  }
}

/** Wat een kantoor oplevert (volgt docs/rules.md). */
export const OFFICE_LINES = [
  'Een kantoor blijft tot het eind van het spel op de locatie staan.',
  'Werk jij daar, dan krijg je een bonus (extra goed, extra ƒ, extra ruil of extra punt).',
  'Werkt een ander daar, dan krijg jij ƒ1 uit de bank.',
  'Aan het eind: meerderheidspunten per locatie (meeste kantoren 2, tweede 1). Het kantoor zelf telt niet.',
  'Kosten: ƒ2 + ƒ1 per kantoor dat er al staat. Je hebt er 6.',
];
