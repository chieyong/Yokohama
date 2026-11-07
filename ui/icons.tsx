import type { LocationId, Resource } from '../engine/src';
import { LOCATION_INFO } from '../engine/src';
import type { Shape } from './theme';

/** Alle iconen zijn getekend in een vak van -12..12. */
export function ResourceGlyph({ r, fill = 'currentColor', detail = '#f1e6cc' }: { r: Resource; fill?: string; detail?: string }) {
  switch (r) {
    case 'koffie':
      return (
        <g transform="rotate(-30)">
          <ellipse rx="7" ry="10.5" fill={fill} />
          <path d="M0 -9 C-3.5 -3 3.5 3 0 9" stroke={detail} strokeWidth="1.8" fill="none" />
        </g>
      );
    case 'tabak':
      return (
        <g transform="rotate(35)">
          <path d="M0 -11.5 C8 -6 8 6 0 11.5 C-8 6 -8 -6 0 -11.5Z" fill={fill} />
          <path d="M0 -10 V11 M0 -3 L4 -6 M0 2 L-4 -1 M0 6 L4 3" stroke={detail} strokeWidth="1.2" fill="none" />
        </g>
      );
    case 'graan':
      return (
        <g fill={fill}>
          <path d="M0 -11 V12" stroke={fill} strokeWidth="1.8" />
          {[-8, -3.5, 1].map((y) => (
            <g key={y}>
              <ellipse cx="-3.2" cy={y} rx="2.6" ry="4" transform={`rotate(-25 -3.2 ${y})`} />
              <ellipse cx="3.2" cy={y} rx="2.6" ry="4" transform={`rotate(25 3.2 ${y})`} />
            </g>
          ))}
          <ellipse cx="0" cy="-11" rx="2" ry="3.2" />
        </g>
      );
    case 'staal':
      return <path d="M-10 -10 H10 V-6 H3 V6 H10 V10 H-10 V6 H-3 V-6 H-10Z" fill={fill} />;
  }
}

export function LocationGlyph({ l, fill = 'currentColor', detail }: { l: LocationId; fill?: string; detail?: string }) {
  const info = LOCATION_INFO[l];
  if (info.kind === 'produce') return <ResourceGlyph r={info.resource} fill={fill} detail={detail} />;
  switch (info.kind) {
    case 'market': // marktkraam met luifel
      return (
        <g fill={fill}>
          <path d="M-11 -6 L-9 -11 H9 L11 -6Z" />
          <path d="M-11 -6 a2.75 2.75 0 0 0 5.5 0 a2.75 2.75 0 0 0 5.5 0 a2.75 2.75 0 0 0 5.5 0 a2.75 2.75 0 0 0 5.5 0Z" />
          <rect x="-9" y="-2" width="2" height="12" />
          <rect x="7" y="-2" width="2" height="12" />
          <rect x="-7" y="3" width="14" height="4" rx="1" />
        </g>
      );
    case 'exchange': // twee pijlen
      return (
        <g fill="none" stroke={fill} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-9 -4 H8 M3 -9 L8 -4 L3 1" />
          <path d="M9 5 H-8 M-3 0 L-8 5 L-3 10" />
        </g>
      );
    case 'contracts': // beursgebouw
      return (
        <g fill={fill}>
          <path d="M-12 -5 L0 -12 L12 -5Z" />
          {[-8.5, -3.5, 1.5, 6.5].map((x) => (
            <rect key={x} x={x} y="-3.5" width="2.4" height="11" />
          ))}
          <rect x="-11" y="8" width="22" height="3" />
        </g>
      );
    case 'deliver': // anker
      return (
        <g fill="none" stroke={fill} strokeWidth="2.4" strokeLinecap="round">
          <circle cx="0" cy="-8.5" r="2.6" />
          <path d="M0 -6 V10 M-6 -2 H6 M-10 3 C-9 9 -4 11 0 11 C4 11 9 9 10 3" />
        </g>
      );
  }
}

export function ShapeGlyph({ shape, size = 6, fill }: { shape: Shape; size?: number; fill: string }) {
  const s = size;
  switch (shape) {
    case 'triangle':
      return <path d={`M0 ${-s} L${s * 0.95} ${s * 0.7} H${-s * 0.95}Z`} fill={fill} />;
    case 'circle':
      return <circle r={s * 0.82} fill={fill} />;
    case 'square':
      return <rect x={-s * 0.72} y={-s * 0.72} width={s * 1.44} height={s * 1.44} fill={fill} />;
    case 'diamond':
      return <path d={`M0 ${-s} L${s} 0 L0 ${s} L${-s} 0Z`} fill={fill} />;
  }
}

/** Losse SVG voor gebruik in HTML. */
export function Icon({ children, size = 22, label }: { children: React.ReactNode; size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="-13 -13 26 26" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {children}
    </svg>
  );
}
