/**
 * The OBS Browser Source: the board scaled to the page width, scrolled to the row the dock picked
 * (smoothly), with the table header stuck to the top once the title has scrolled away.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useData } from "../lib/store";
import { Board, BOARD_W, boardHeight } from "../board/Board";

/** Height of the board seen on a 16:9 screen (the board is 1418 px wide). */
export const VIEW_H = Math.round((BOARD_W * 9) / 16);
/** Furthest the board scrolls on a 16:9 screen: its bottom edge at the bottom of the screen. */
export const maxScroll = (rows: number) => Math.max(0, boardHeight(rows) - VIEW_H);

/**
 * The board fitted to its box's width, scrolled to the dock's position (board px, free, no snapping).
 * The page eases toward it every frame, so slider drags, wheel steps and jumps all glide.
 */
export function ScrolledBoard() {
  const d = useData();
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setZoom(el.clientWidth / BOARD_W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const target = useRef(0);
  target.current = d.scroll * zoom;
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const el = box.current;
      if (el) {
        const cur = el.scrollTop, diff = target.current - cur;
        // ease 18% of the way each frame (at least 1 px, since scrollTop rounds), then land exactly
        if (Math.abs(diff) > 1) el.scrollTop = cur + Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.18);
        else if (diff !== 0) el.scrollTop = target.current;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={box} data-testid="scroller" className="absolute inset-0 overflow-hidden bg-white">
      <div style={{ zoom }}><Board b={d} sticky /></div>
    </div>
  );
}

export function Overlay() {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    document.title = "โอตะม้าซิ่ง Broadcast Predict · Overlay";
  }, []);
  return <div className="fixed inset-0"><ScrolledBoard /></div>;
}
