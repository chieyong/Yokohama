import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { NEIGHBOURS, RESOURCES, type GameState, type LocationId, type Resource } from '../engine/src';
import { ResourceGlyph } from './icons';
import { BOARD_H, BOARD_W, C, POS, RES, SERIF } from './theme';
import { Boat } from './pieces';

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

/** Hoe de viewBox (meet) in de container past: schaal en marges in px. */
export interface Fit {
  s: number;
  ox: number;
  oy: number;
}

export function useFit(ref: RefObject<HTMLElement | null>): Fit {
  const [fit, setFit] = useState<Fit>({ s: 1, ox: 0, oy: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const sc = Math.min(w / BOARD_W, h / BOARD_H);
      setFit({ s: sc, ox: (w - BOARD_W * sc) / 2, oy: (h - BOARD_H * sc) / 2 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return fit;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Afmeting van het boot-plaatje in viewBox-eenheden. */
const BOAT_BOX = { x: -20, y: -24, w: 40, h: 40 };

/**
 * Laat schuiten vloeiend over de vaarwegen glijden: langzaam starten,
 * versnellen, langzaam aankomen. De schuiten zijn losse HTML-lagen die met
 * translate3d bewegen: alleen de GPU werkt, het bord wordt niet opnieuw getekend.
 */
export function useBoatMotion(state: GameState, stepMs: number, fit: Fit) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const shown = useRef<{ seed: number; locs: LocationId[] }>({ seed: -1, locs: [] });
  const raf = useRef<number[]>([]);
  const fitRef = useRef(fit);
  fitRef.current = fit;

  useLayoutEffect(() => {
    const fresh = shown.current.seed !== state.seed;
    state.players.forEach((p, i) => {
      const el = refs.current[i];
      if (!el) return;
      const prev = fresh ? undefined : shown.current.locs[i];
      const place = (x: number, y: number, rot = 0) => {
        const f = fitRef.current;
        el.style.transform = `translate3d(${f.ox + (x + BOAT_BOX.x) * f.s}px, ${f.oy + (y + BOAT_BOX.y) * f.s}px, 0) rotate(${rot}deg)`;
      };

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
      const total = segs.reduce((x, y) => x + y, 0) || 1;
      const dur = stepMs * segs.length;
      let t0 = 0;
      const tick = (now: number) => {
        if (!t0) t0 = now; // start op het eerste frame: geen sprong
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

export function BoatLayer({ count, fit, refs }: { count: number; fit: Fit; refs: React.MutableRefObject<(HTMLDivElement | null)[]> }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="boat-el" ref={(el) => (refs.current[i] = el)}>
          <svg
            width={BOAT_BOX.w * fit.s}
            height={BOAT_BOX.h * fit.s}
            viewBox={`${BOAT_BOX.x} ${BOAT_BOX.y} ${BOAT_BOX.w} ${BOAT_BOX.h}`}
            aria-hidden="true"
          >
            <Boat player={i} x={0} y={0} />
          </svg>
        </div>
      ))}
    </>
  );
}

/** Pulserende ringen om toegestane bestemmingen (opacity op de GPU). */
export function TargetRings({ targets, selected, fit }: { targets?: LocationId[]; selected?: LocationId; fit: Fit }) {
  const r = (R + 9) * fit.s;
  const ring = (l: LocationId, cls: string) => (
    <div
      key={l + cls}
      className={`ring ${cls}`}
      style={{
        width: 2 * r,
        height: 2 * r,
        transform: `translate3d(${fit.ox + POS[l].x * fit.s - r}px, ${fit.oy + POS[l].y * fit.s - r}px, 0)`,
      }}
    />
  );
  return (
    <>
      {targets?.filter((l) => l !== selected).map((l) => ring(l, 'pulse'))}
      {selected && ring(selected, 'chosen')}
    </>
  );
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

export function FlyLayer({ flies, fit, onDone }: { flies: Fly[]; fit: Fit; onDone: (id: number) => void }) {
  const px = (p: { x: number; y: number }, dy = 0) => `translate3d(${fit.ox + (p.x - 14) * fit.s}px, ${fit.oy + (p.y - 14 + dy) * fit.s}px, 0)`;
  return (
    <>
      {flies.map((f) => (
        <div
          key={f.id}
          className="fly-el"
          style={{ opacity: 0 }}
          ref={(el) => {
            if (!el || el.dataset.started) return;
            el.dataset.started = '1';
            const lift = { x: (f.from.x + f.to.x) / 2, y: Math.min(f.from.y, f.to.y) - 40 };
            const anim = el.animate(
              [
                { transform: `${px(f.from)} scale(0.6)`, opacity: 0 },
                { transform: `${px(f.from, -10)} scale(1.1)`, opacity: 1, offset: 0.15 },
                { transform: `${px(lift)} scale(1.15)`, opacity: 1, offset: 0.55 },
                { transform: `${px(f.to)} scale(0.7)`, opacity: 1, offset: 0.92 },
                { transform: `${px(f.to)} scale(0.3)`, opacity: 0 },
              ],
              { duration: f.ms, delay: f.delay, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'both' },
            );
            anim.onfinish = () => onDone(f.id);
          }}
        >
          <svg width={28 * fit.s} height={28 * fit.s} viewBox="-14 -14 28 28" aria-hidden="true">
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
          </svg>
        </div>
      ))}
    </>
  );
}
