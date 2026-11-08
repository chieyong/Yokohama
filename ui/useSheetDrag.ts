import { useRef, useState } from 'react';

/**
 * Sleepbare bottom sheet: volgt de vinger en klikt bij loslaten naar open of
 * dicht (op basis van positie en snelheid). Een korte tik schakelt om.
 */
export function useSheetDrag() {
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState<number | null>(null);
  const sheet = useRef<HTMLElement | null>(null);
  const start = useRef<{ y: number; base: number; closed: number; t: number; lastY: number; lastT: number } | null>(null);

  const closedY = () => {
    const el = sheet.current!;
    const visible = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--peek-h')) + parseFloat(getComputedStyle(el).paddingBottom);
    return el.offsetHeight - visible;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const closed = closedY();
    start.current = { y: e.clientY, base: open ? 0 : closed, closed, t: performance.now(), lastY: e.clientY, lastT: performance.now() };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* synthetische pointer */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const dy = e.clientY - s.y;
    if (dragY === null && Math.abs(dy) < 6) return;
    s.lastY = e.clientY;
    s.lastT = performance.now();
    setDragY(Math.min(s.closed, Math.max(0, s.base + dy)));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (dragY === null) {
      setOpen(!open); // tik
      return;
    }
    const dt = Math.max(1, performance.now() - s.t);
    const v = (e.clientY - s.y) / dt; // px per ms, positief = omlaag
    const y = dragY;
    setDragY(null);
    if (v > 0.4) setOpen(false);
    else if (v < -0.4) setOpen(true);
    else setOpen(y < s.closed / 2);
  };

  const style: React.CSSProperties | undefined =
    dragY === null ? undefined : { transform: `translateY(${dragY}px)`, transition: 'none' };

  return {
    open,
    setOpen,
    sheetRef: sheet,
    style,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
