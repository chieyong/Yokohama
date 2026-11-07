import { useCallback, useRef, useState } from 'react';

export interface View { x: number; y: number; k: number }
const MAX = 4;
const IDENTITY: View = { x: 0, y: 0, k: 1 };

/**
 * Pinch-zoom + pan met pointer events. Dubbeltik = hele bord.
 * Geeft `moved` terug zodat een tik later van een pan te onderscheiden is.
 */
export function useZoomPan(onTap?: (clientX: number, clientY: number) => void) {
  const [view, setView] = useState<View>(IDENTITY);
  const [animating, setAnimating] = useState(false);
  const el = useRef<HTMLDivElement | null>(null);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ view: View; mid: { x: number; y: number }; dist: number } | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);
  const moved = useRef(false);

  const clamp = useCallback((v: View): View => {
    const r = el.current?.getBoundingClientRect();
    const k = Math.min(MAX, Math.max(1, v.k));
    if (!r) return { ...v, k };
    const minX = r.width - r.width * k;
    const minY = r.height - r.height * k;
    return { k, x: Math.min(0, Math.max(minX, v.x)), y: Math.min(0, Math.max(minY, v.y)) };
  }, []);

  const local = (e: React.PointerEvent) => {
    const r = el.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const snapshot = (v: View) => {
    const list = [...pts.current.values()];
    const mid = list.reduce((a, p) => ({ x: a.x + p.x / list.length, y: a.y + p.y / list.length }), { x: 0, y: 0 });
    const dist = list.length > 1 ? Math.hypot(list[0]!.x - list[1]!.x, list[0]!.y - list[1]!.y) : 0;
    start.current = { view: v, mid, dist };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    try {
      el.current?.setPointerCapture(e.pointerId);
    } catch {
      /* niet elke pointer kan gecaptured worden */
    }
    pts.current.set(e.pointerId, local(e));
    if (pts.current.size === 1) moved.current = false;
    setAnimating(false);
    snapshot(view);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId) || !start.current) return;
    pts.current.set(e.pointerId, local(e));
    const list = [...pts.current.values()];
    const mid = list.reduce((a, p) => ({ x: a.x + p.x / list.length, y: a.y + p.y / list.length }), { x: 0, y: 0 });
    const s = start.current;
    if (Math.hypot(mid.x - s.mid.x, mid.y - s.mid.y) > 8 || list.length > 1) moved.current = true;
    let k = s.view.k;
    if (list.length > 1 && s.dist > 0) {
      const d = Math.hypot(list[0]!.x - list[1]!.x, list[0]!.y - list[1]!.y);
      k = Math.min(MAX, Math.max(1, s.view.k * (d / s.dist)));
    }
    // Het punt onder het startmidden blijft onder de vingers.
    const bx = (s.mid.x - s.view.x) / s.view.k;
    const by = (s.mid.y - s.view.y) / s.view.k;
    setView(clamp({ k, x: mid.x - bx * k, y: mid.y - by * k }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const p = pts.current.get(e.pointerId);
    pts.current.delete(e.pointerId);
    snapshot(view);
    if (pts.current.size === 0 && p && !moved.current) {
      const now = performance.now();
      const lt = lastTap.current;
      if (lt && now - lt.t < 320 && Math.hypot(lt.x - p.x, lt.y - p.y) < 30) {
        setAnimating(true);
        setView(IDENTITY);
        lastTap.current = null;
      } else {
        lastTap.current = { t: now, x: p.x, y: p.y };
        onTap?.(e.clientX, e.clientY);
      }
    }
  };

  return {
    ref: el,
    view,
    animating,
    wasPan: () => moved.current,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
