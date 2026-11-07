import { EDGES, LOCATIONS, LOCATION_INFO, type GameState, type LocationId } from '../engine/src';
import { LocationGlyph } from './icons';
import { Boat, ContractCardSvg, Office } from './pieces';
import { BOARD_H, BOARD_W, C, POS, SERIF, locColor } from './theme';
import { useZoomPan } from './useZoomPan';

const R = 36;

function Defs() {
  return (
    <defs>
      <filter id="paper" filterUnits="userSpaceOnUse" x="-400" y="-400" width="1210" height="1580">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.10 0" />
        <feComposite in2="SourceGraphic" operator="in" />
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>
      <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
        <stop offset="60%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#5a3819" stopOpacity="0.28" />
      </radialGradient>
      <pattern id="waves" width="22" height="10" patternUnits="userSpaceOnUse">
        <path d="M0 6 Q5.5 2 11 6 T22 6" fill="none" stroke={C.waterLight} strokeWidth="1.2" opacity="0.8" />
      </pattern>
    </defs>
  );
}

/** De Maas en de oevers. */
function Landscape() {
  const river = 'M-400 420 C-200 380 -60 410 -10 395 C90 365 170 420 260 400 S380 360 420 385 C520 410 640 360 810 390 V480 C640 450 520 500 420 470 C340 450 280 495 190 478 S60 445 -10 480 C-120 500 -250 460 -400 500Z';
  return (
    <g>
      <rect x="-400" y="-400" width={BOARD_W + 800} height={BOARD_H + 800} fill={C.paper} filter="url(#paper)" />
      <path d={river} fill={C.water} />
      <path d={river} fill="url(#waves)" />
      <path d="M-400 420 C-200 380 -60 410 -10 395 C90 365 170 420 260 400 S380 360 420 385 C520 410 640 360 810 390" fill="none" stroke={C.waterDeep} strokeWidth="2" />
      <path d="M810 480 C640 450 520 500 420 470 C340 450 280 495 190 478 S60 445 -10 480 C-120 500 -250 460 -400 500" fill="none" stroke={C.waterDeep} strokeWidth="2" />
      <text x="300" y="440" fontFamily={SERIF} fontStyle="italic" fontSize="20" fill={C.waterDeep} letterSpacing="6" transform="rotate(-6 300 440)">
        de Maas
      </text>
      <text x="22" y="40" fontFamily={SERIF} fontSize="13" fill={C.inkSoft} letterSpacing="3">NOORD</text>
      <text x="22" y="640" fontFamily={SERIF} fontSize="13" fill={C.inkSoft} letterSpacing="3">ZUID</text>
    </g>
  );
}

function Waterway({ a, b }: { a: LocationId; b: LocationId }) {
  const p = POS[a];
  const q = POS[b];
  return (
    <g>
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.waterDeep} strokeWidth="13" strokeLinecap="round" />
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.water} strokeWidth="9" strokeLinecap="round" />
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.waterLight} strokeWidth="1.5" strokeDasharray="5 7" />
    </g>
  );
}

function Location({ l, state }: { l: LocationId; state: GameState }) {
  const { x, y } = POS[l];
  const col = locColor(l);
  const name = LOCATION_INFO[l].name;
  const offices = state.offices[l].flatMap((n, p) => Array.from({ length: n }, () => p));
  const w = name.length * 6.6 + 18;
  return (
    <g transform={`translate(${x} ${y})`} aria-label={name}>
      <circle r={R + 4} fill="#000" opacity="0.15" cy="3" />
      <circle r={R} fill={C.paper} stroke={col} strokeWidth="5" />
      <circle r={R - 9} fill={col} />
      <circle r={R - 9} fill="none" stroke={C.paper} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
      <g transform="scale(1.45)">
        <LocationGlyph l={l} fill={C.paper} detail={col} />
      </g>
      {/* naambord */}
      <g transform={`translate(0 ${R + 13})`}>
        <rect x={-w / 2} y="-10" width={w} height="20" rx="3" fill={C.woodDark} />
        <rect x={-w / 2 + 2} y="-8" width={w - 4} height="16" rx="2" fill="none" stroke={C.wood} strokeWidth="1" />
        <text y="4.5" textAnchor="middle" fontFamily={SERIF} fontSize="12.5" fontWeight="600" fill={C.paper}>
          {name}
        </text>
      </g>
      {/* kantoren in een boog rechtsboven */}
      {offices.map((p, i) => {
        const a = (-70 + i * 26) * (Math.PI / 180);
        return <Office key={i} player={p} x={Math.cos(a) * (R + 9)} y={Math.sin(a) * (R + 9)} />;
      })}
    </g>
  );
}

function ContractRow({ state }: { state: GameState }) {
  return (
    <g transform="translate(0 668)">
      <text x={BOARD_W / 2} y="0" textAnchor="middle" fontFamily={SERIF} fontSize="13" fill={C.inkSoft} letterSpacing="2">
        OPEN CONTRACTEN · stapel {state.deck.length}
      </text>
      {state.display.map((id, i) => (
        <g key={id} transform={`translate(${45 + i * 112} 14) scale(0.98)`}>
          <ContractCardSvg id={id} />
        </g>
      ))}
    </g>
  );
}

export function Board({ state }: { state: GameState }) {
  const zp = useZoomPan();
  const { x, y, k } = zp.view;
  return (
    <div className="board" ref={zp.ref} {...zp.handlers}>
      <svg
        viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${k})`,
          transition: zp.animating ? 'transform 280ms ease-out' : 'none',
        }}
      >
        <Defs />
        <Landscape />
        {EDGES.map(([a, b]) => (
          <Waterway key={a + b} a={a} b={b} />
        ))}
        {LOCATIONS.map((l) => (
          <Location key={l} l={l} state={state} />
        ))}
        {state.players.map((p, i) => {
          const { x: bx, y: by } = POS[p.boat];
          return <Boat key={i} player={i} x={bx - R - 2} y={by - R + 6} />;
        })}
        <ContractRow state={state} />
        
      </svg>
    </div>
  );
}
