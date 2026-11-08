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
      <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="80">
        <stop offset="0" stopColor={C.skyTop} />
        <stop offset="0.55" stopColor={C.skyMid} />
        <stop offset="0.85" stopColor="#e9dcb9" />
        <stop offset="1" stopColor={C.paper} />
      </linearGradient>
      <filter id="soft" x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <linearGradient id="riverShine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.waterDeep} />
        <stop offset="0.45" stopColor={C.water} />
        <stop offset="1" stopColor={C.waterDeep} />
      </linearGradient>
      <pattern id="waves" width="22" height="10" patternUnits="userSpaceOnUse">
        <path d="M0 6 Q5.5 2 11 6 T22 6" fill="none" stroke={C.waterLight} strokeWidth="1" opacity="0.45" />
      </pattern>
    </defs>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#soft)">
      <ellipse cx="2" cy="7" rx="36" ry="8" fill={C.cloudShade} opacity="0.85" />
      <circle cx="-16" cy="0" r="10" fill={C.cloud} />
      <circle cx="0" cy="-6" r="14" fill={C.cloud} />
      <circle cx="17" cy="-1" r="10" fill={C.cloud} />
      <circle cx="28" cy="3" r="6" fill={C.cloud} />
    </g>
  );
}

/** Lucht met wolken en een stadssilhouet met kerktoren langs de noordrand. */
function Sky() {
  const H = 74; // horizon
  const gables: [number, number, number][] = [
    // x, breedte, hoogte
    [-120, 22, 13], [-98, 18, 18], [-80, 20, 11], [-60, 20, 15], [-40, 16, 19], [-24, 24, 11], [0, 18, 14], [18, 14, 20], [32, 20, 12], [52, 14, 18], [66, 22, 10], [88, 16, 16],
    [104, 18, 22], [122, 14, 13], [136, 20, 17], [156, 16, 11], [172, 18, 19], [190, 22, 14],
    [292, 16, 18], [308, 20, 12], [328, 14, 21], [342, 20, 15], [362, 16, 19], [378, 18, 12], [396, 18, 17], [414, 20, 13], [434, 16, 20], [450, 22, 12], [472, 18, 17], [490, 24, 13], [514, 20, 19],
  ];
  return (
    <g>
      <rect x="-400" y="-400" width={BOARD_W + 800} height={400 + H + 6} fill="url(#sky)" />
      <Cloud x={-20} y={34} s={1.2} />
      <Cloud x={80} y={22} s={1.3} />
      <Cloud x={185} y={14} s={0.9} />
      <Cloud x={330} y={24} s={1.5} />
      <Cloud x={440} y={36} s={1.1} />
      <g fill={C.skyline} opacity="0.82">
        {gables.map(([x, w, h]) => (
          <path key={x} d={`M${x} ${H} V${H - h} L${x + w / 2} ${H - h - w * 0.45} L${x + w} ${H - h} V${H}Z`} />
        ))}
        {/* kerk met kruisbeuk en toren */}
        <path d={`M206 ${H} V${H - 26} L226 ${H - 40} L250 ${H - 26} V${H}Z`} />
        <path d={`M224 ${H - 40} V${H - 50} M224 ${H - 52} h0`} stroke={C.skyline} strokeWidth="1.5" />
        <path d={`M252 ${H} V${H - 52} H258 V${H - 60} H276 V${H - 52} H282 V${H}Z`} />
        <rect x="262" y={H - 66} width="10" height="6" />
        <path d={`M262 ${H - 66} L267 ${H - 70} L272 ${H - 66}Z`} />
      </g>
      <rect x="-400" y={H} width={BOARD_W + 800} height="2" fill={C.skyline} opacity="0.5" />
    </g>
  );
}

/** De Maas en de oevers. */
function Landscape() {
  const river = 'M-400 420 C-200 380 -60 410 -10 395 C90 365 170 420 260 400 S380 360 420 385 C520 410 640 360 810 390 V480 C640 450 520 500 420 470 C340 450 280 495 190 478 S60 445 -10 480 C-120 500 -250 460 -400 500Z';
  return (
    <g>
      <rect x="-400" y="-400" width={BOARD_W + 800} height={BOARD_H + 800} fill={C.paper} filter="url(#paper)" />
      <Sky />
      <path d={river} fill="url(#riverShine)" />
      <path d={river} fill="url(#waves)" />
      <path d="M-400 420 C-200 380 -60 410 -10 395 C90 365 170 420 260 400 S380 360 420 385 C520 410 640 360 810 390" fill="none" stroke={C.waterDeep} strokeWidth="2" />
      <path d="M810 480 C640 450 520 500 420 470 C340 450 280 495 190 478 S60 445 -10 480 C-120 500 -250 460 -400 500" fill="none" stroke={C.waterDeep} strokeWidth="2" />
      <text x="300" y="440" fontFamily={SERIF} fontStyle="italic" fontSize="20" fill={C.waterLight} opacity="0.8" letterSpacing="6" transform="rotate(-6 300 440)">
        de Maas
      </text>
      
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

type Mark = 'normal' | 'target' | 'dim' | 'selected' | 'origin';

function Location({ l, state, mark }: { l: LocationId; state: GameState; mark: Mark }) {
  const { x, y } = POS[l];
  const col = locColor(l);
  const name = LOCATION_INFO[l].name;
  const offices = state.offices[l].flatMap((n, p) => Array.from({ length: n }, () => p));
  const w = name.length * 6.6 + 18;
  return (
    <g transform={`translate(${x} ${y})`} aria-label={name} data-loc={l} className={`loc ${mark}`}>
      {(mark === 'target' || mark === 'selected') && (
        <circle r={R + 9} className={mark === 'target' ? 'pulse' : ''} fill="none" stroke={C.goldLight} strokeWidth={mark === 'selected' ? 6 : 4} />
      )}
      <circle r={R + 4} fill="#000" opacity="0.15" cy="3" />
      <circle r={R + 1.5} fill={C.gold} />
      <circle r={R - 1} fill={C.paper} stroke={col} strokeWidth="5" />
      <circle r={R - 9} fill={col} />
      <circle r={R - 9} fill="none" stroke={C.paper} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
      <g transform="scale(1.45)">
        <LocationGlyph l={l} fill={C.paper} detail={col} />
      </g>
      {/* naambord */}
      <g transform={`translate(0 ${R + 13})`}>
        <rect x={-w / 2} y="-10" width={w} height="20" rx="3" fill={C.woodDark} stroke={C.gold} strokeWidth="1.4" />
        <text y="4.5" textAnchor="middle" fontFamily={SERIF} fontSize="12.5" fontWeight="600" fill={C.goldLight}>
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
        <g key={id} transform={`translate(${45 + i * 112} 14) scale(0.98)`} data-contract={id}>
          <ContractCardSvg id={id} />
        </g>
      ))}
    </g>
  );
}

export type Tap = { kind: 'loc'; id: LocationId } | { kind: 'contract'; id: string };

interface BoardProps {
  state: GameState;
  /** Locaties die nu gekozen kunnen worden; de rest wordt gedimd. */
  targets?: LocationId[];
  selected?: LocationId;
  /** Vertrekpunt: niet dimmen. */
  origin?: LocationId;
  /** Tijdelijke tussenpositie van een schuit (animatie over 2 stappen). */
  boatAt?: { player: number; loc: LocationId };
  /** Duur van de vaaranimatie in ms. */
  boatMs?: number;
  onTap?: (t: Tap) => void;
}

export function Board({ state, targets, selected, origin, boatAt, boatMs = 0, onTap }: BoardProps) {
  const zp = useZoomPan((cx, cy) => {
    const hit = document.elementFromPoint(cx, cy)?.closest('[data-loc],[data-contract]');
    if (!hit || !onTap) return;
    const loc = hit.getAttribute('data-loc');
    if (loc) onTap({ kind: 'loc', id: loc as LocationId });
    else onTap({ kind: 'contract', id: hit.getAttribute('data-contract')! });
  });
  const mark = (l: LocationId): Mark =>
    l === selected
      ? 'selected'
      : !targets
        ? 'normal'
        : targets.includes(l)
          ? 'target'
          : l === origin && !selected
            ? 'origin'
            : 'dim';
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
          <Location key={l} l={l} state={state} mark={mark(l)} />
        ))}
        {state.players.map((p, i) => {
          const loc = boatAt?.player === i ? boatAt.loc : p.boat;
          const { x: bx, y: by } = POS[loc];
          return (
            <g
              key={i}
              pointerEvents="none"
              className="boat"
              style={{
                transform: `translate(${bx - R - 2}px, ${by - R + 6}px)`,
                transition: boatMs ? `transform ${boatMs}ms ease-in-out` : 'none',
              }}
            >
              <Boat player={i} x={0} y={0} />
            </g>
          );
        })}
        <ContractRow state={state} />
        
      </svg>
    </div>
  );
}
