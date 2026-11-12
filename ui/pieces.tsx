import { CONTRACT_BY_ID, RESOURCES } from '../engine/src';
import { ResourceGlyph, ShapeGlyph } from './icons';
import { C, PLAYERS, RES, SERIF } from './theme';

export function Boat({ player, x, y }: { player: number; x: number; y: number }) {
  const p = PLAYERS[player]!;
  return (
    <g transform={`translate(${x} ${y})`} aria-label={`Schuit ${p.name}`}>
      <ellipse cx="0" cy="13" rx="17" ry="3" fill="#000" opacity="0.18" />
      <path d="M-16 4 H16 L11 12 H-11Z" fill={C.wood} stroke={C.ink} strokeWidth="1" />
      <path d="M-14.5 6.5 H14.5" stroke={C.gold} strokeWidth="1.3" />
      <path d="M-1 4 V-18" stroke={C.ink} strokeWidth="1.6" />
      <path d="M1 -17 L13 1 H1Z" fill={p.color} stroke={C.ink} strokeWidth="1" />
      <path d="M-3 -14 L-12 1 H-3Z" fill={p.color} stroke={C.ink} strokeWidth="1" opacity="0.85" />
      <g transform="translate(6 -4)">
        <ShapeGlyph shape={p.shape} size={3.6} fill={C.paper} />
      </g>
    </g>
  );
}

export function Office({ player, x, y }: { player: number; x: number; y: number }) {
  const p = PLAYERS[player]!;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="office-pop">
        <path d="M-7 -2 L0 -9 L7 -2 V7 H-7Z" fill={p.color} stroke={C.ink} strokeWidth="1.1" />
        <g transform="translate(0 2)">
          <ShapeGlyph shape={p.shape} size={3.2} fill={C.paper} />
        </g>
      </g>
    </g>
  );
}

/** Contractkaart, 100×74 in SVG-eenheden, linksboven op (0,0). */
export function ContractCardSvg({ id }: { id: string }) {
  const c = CONTRACT_BY_ID[id]!;
  const goods = RESOURCES.flatMap((r) => Array.from({ length: c.cost[r] ?? 0 }, () => r));
  const step = goods.length > 3 ? 21 : 25;
  const x0 = 50 - ((goods.length - 1) * step) / 2;
  return (
    <g>
      <rect width="100" height="74" rx="6" fill={C.paper} stroke={C.woodDark} strokeWidth="2" />
      <rect x="4" y="4" width="92" height="66" rx="4" fill="none" stroke={C.gold} strokeWidth="1" />
      {goods.map((r, i) => (
        <g key={i} transform={`translate(${x0 + i * step} 26) scale(0.8)`}>
          <circle r="12" fill={C.paperDark} />
          <ResourceGlyph r={r} fill={RES[r].color} />
        </g>
      ))}
      <g transform="translate(50 56)">
        <circle r="12" fill="#7c2b3b" stroke={C.ink} strokeWidth="1" />
        <text y="5" textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="14" fill={C.paper}>
          {c.points}
        </text>
      </g>
    </g>
  );
}

export function ContractCard({ id, width = 100 }: { id: string; width?: number }) {
  const c = CONTRACT_BY_ID[id]!;
  const label = `Contract: ${RESOURCES.filter((r) => c.cost[r]).map((r) => `${c.cost[r]} ${RES[r].label.toLowerCase()}`).join(', ')}, ${c.points} punten`;
  return (
    <svg width={width} height={(width * 74) / 100} viewBox="-1 -1 102 76" role="img" aria-label={label}>
      <ContractCardSvg id={id} />
    </svg>
  );
}
