import { useLayoutEffect, useRef, useState } from 'react';
import { NEIGHBOURS, RESOURCES, type GameState, type LocationId, type Resource } from '../engine/src';
import { ResourceGlyph } from './icons';
import { C, POS, RES, SERIF } from './theme';

/** Afstand van het medaillon-midden tot het ankerpunt van een schuit. */
export const R = 36;
export const boatAnchor = (l: LocationId) => ({ x: POS[l].x - R - 2, y: POS[l].y - R + 6 });

/** Route over het water: 1 of 2 stappen. */
export function sailPath(from: LocationId, to: LocationId): LocationId[] {
  if (from === to) return [];
  if (NEIGHBOURS[from].includes(to)) return [to];
  const mid = NEIGHBOURS[from].find((m) => NEIGHBOURS[m].includes(to));
  return mid ? [mid, to] : [to];
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Laat schuiten vloeiend over de vaarwegen glijden: langzaam starten,
 * versnellen, langzaam aankomen. Werkt direct op het DOM (requestAnimationFrame),
 * zodat React niet elk frame opnieuw hoeft te tekenen.
 */
export function useBoatMotion(state: GameState, stepMs: number) {
  const refs = useRef<(SVGGElement | null)[]>([]);
  const shown = useRef<{ seed: number; locs: LocationId[] }>({ seed: -1, locs: [] });
  const raf = useRef<number[]>([]);

  useLayoutEffect(() => {
    const fresh = shown.current.seed !== state.seed;
    state.players.forEach((p, i) => {
      const el = refs.current[i];
      if (!el) return;
      const prev = fresh ? undefined : shown.current.locs[i];
      const place = (x: number, y: number, rot = 0) =>
        el.setAttribute('transform', `translate(${x} ${y}) rotate(${rot} 0 6)`);

      if (!prev || prev === p.boat || stepMs <= 0 || reduced()) {
        if (!raf.current[i] || prev !== p.boat) {
          cancelAnimationFrame(raf.current[i] ?? 0);
          raf.current[i] = 0;
          const a = boatAnchor(p.boat);
          place(a.x, a.y);
        }
        return;
      }

      // Route langs de waypoints, met easing over de totale lengte.
      cancelAnimationFrame(raf.current[i] ?? 0);
      const pts = [prev, ...sailPath(prev, p.boat)].map(boatAnchor);
      const segs = pts.slice(1).map((q, k) => Math.hypot(q.x - pts[k]!.x, q.y - pts[k]!.y));
      const total = segs.reduce((a, b) => a + b, 0) || 1;
      const dur = stepMs * segs.length;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        let d = easeInOut(t) * total;
        let k = 0;
        while (k < segs.length - 1 && d > segs[k]!) d -= segs[k++]!;
        const a = pts[k]!;
        const b = pts[k + 1]!;
        const f = segs[k] ? d / segs[k]! : 1;
        // licht deinen tijdens het varen
        place(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, Math.sin(t * Math.PI * 4) * 4 * (1 - t));
        raf.current[i] = t < 1 ? requestAnimationFrame(tick) : 0;
      };
      raf.current[i] = requestAnimationFrame(tick);
    });
    shown.current = { seed: state.seed, locs: state.players.map((p) => p.boat) };
  });

  return refs;
}

interface Fly {
  id: number;
  kind: Resource | 'coin';
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay: number;
  ms: number;
}

let flyId = 1;

/**
 * Vergelijkt de vorige en de nieuwe stand: elk ontvangen goed of muntje
 * vliegt in een boog van de locatie van de actie naar de schuit.
 */
export function useFlies(state: GameState, flyMsFor: (player: number) => number) {
  const prev = useRef<GameState | null>(null);
  const [flies, setFlies] = useState<Fly[]>([]);

  useLayoutEffect(() => {
    const p0 = prev.current;
    prev.current = state;
    if (!p0 || p0.seed !== state.seed || reduced()) return;
    const ms = flyMsFor(p0.current);
    if (ms <= 0 || p0.phase !== 'action') return;
    const src = POS[state.players[p0.current]!.boat];
    const add: Fly[] = [];
    state.players.forEach((p, i) => {
      const before = p0.players[i]!;
      const a = boatAnchor(p.boat);
      const to = { x: a.x, y: a.y - 4 };
      const gains: (Resource | 'coin')[] = [];
      for (const r of RESOURCES) for (let n = 0; n < Math.min(3, p.resources[r] - before.resources[r]); n++) gains.push(r);
      for (let n = 0; n < Math.min(4, p.gulden - before.gulden); n++) gains.push('coin');
      gains.forEach((kind) => add.push({ id: flyId++, kind, from: { x: src.x, y: src.y }, to, delay: add.length * 110, ms }));
    });
    if (add.length) setFlies((f) => [...f, ...add]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const done = (id: number) => setFlies((f) => f.filter((x) => x.id !== id));
  return { flies, done };
}

export function FlyLayer({ flies, onDone }: { flies: Fly[]; onDone: (id: number) => void }) {
  return (
    <g pointerEvents="none">
      {flies.map((f) => (
        <g
          key={f.id}
          style={{ opacity: 0 }}
          ref={(el) => {
            if (!el || el.dataset.started) return;
            el.dataset.started = '1';
            const lift = { x: (f.from.x + f.to.x) / 2, y: Math.min(f.from.y, f.to.y) - 40 };
            const anim = el.animate(
              [
                { transform: `translate(${f.from.x}px, ${f.from.y}px) scale(0.6)`, opacity: 0 },
                { transform: `translate(${f.from.x}px, ${f.from.y - 10}px) scale(1.1)`, opacity: 1, offset: 0.15 },
                { transform: `translate(${lift.x}px, ${lift.y}px) scale(1.15)`, opacity: 1, offset: 0.55 },
                { transform: `translate(${f.to.x}px, ${f.to.y}px) scale(0.7)`, opacity: 1, offset: 0.92 },
                { transform: `translate(${f.to.x}px, ${f.to.y}px) scale(0.3)`, opacity: 0 },
              ],
              { duration: f.ms, delay: f.delay, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'both' },
            );
            anim.onfinish = () => onDone(f.id);
          }}
        >
          <circle r="13" fill={C.paper} stroke={C.gold} strokeWidth="2" />
          {f.kind === 'coin' ? (
            <>
              <circle r="9.5" fill={C.gold} stroke="#8d6d27" strokeWidth="1" />
              <text y="5" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="700" fontSize="14" fill={C.ink}>
                ƒ
              </text>
            </>
          ) : (
            <g transform="scale(0.8)">
              <ResourceGlyph r={f.kind} fill={RES[f.kind].color} />
            </g>
          )}
        </g>
      ))}
    </g>
  );
}
