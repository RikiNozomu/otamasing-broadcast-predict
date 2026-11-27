/**
 * The OBS Browser Source: the board scaled to the page width, scrolled to the dock's position
 * (smoothly). Once the title has scrolled away the table header floats HEAD_GAP below the top,
 * and the band above and beside it is see-through (nothing is drawn there).
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useData } from "../lib/store";
import { Board, BOARD_FONT, BOARD_W, boardHeight, HEAD_H, HEAD_Y, TABLE_W, TABLE_X, TableHead } from "../board/Board";

/** Height of the board seen on a 16:9 screen (the board is 1418 px wide). */
export const VIEW_H = Math.round((BOARD_W * 9) / 16);
/** Furthest the board scrolls on a 16:9 screen: its bottom edge at the bottom of the screen. */
/** Space above the floating table header, in board px (same as the table's side margin). */
export const HEAD_GAP = TABLE_X;
export const maxScroll = (rows: number) => Math.max(0, boardHeight(rows) - VIEW_H);

/**
 * The board fitted to its box's width, scrolled to the dock's position (board px, free, no snapping).
 * The page eases toward it every frame, so slider drags, wheel steps and jumps all glide.
 */
export function ScrolledBoard() {
  const d = useData();
  const box = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
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
        // the box's own offset from the top (see below) is not part of the scroll position
        const off = parseFloat(el.style.top) || 0, cur = el.scrollTop - off, diff = target.current - cur;
        // ease 18% of the way each frame (at least 1 px, since scrollTop rounds), then land exactly
        const pos = Math.abs(diff) > 1 ? cur + Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.18) : target.current;
        // past the point where the board's own header reaches HEAD_GAP: show the floating copy and move the board's box
        // down to just under it, so nothing at all is drawn above (a clip-path there came out black in OBS)
        const z = el.clientWidth / BOARD_W, stuck = pos / z > HEAD_Y - HEAD_GAP, top = stuck ? (HEAD_GAP + HEAD_H) * z : 0;
        el.style.top = `${top}px`;
        el.scrollTop = pos + top;
        if (head.current) head.current.style.visibility = stuck ? "visible" : "hidden";
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <>
      <div ref={box} data-testid="scroller" className="absolute inset-0 overflow-hidden bg-white">
        <div style={{ zoom }}><Board b={d} /></div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0" style={{ zoom }}>
        <div ref={head} data-testid="floating-head" className="invisible absolute" style={{ fontFamily: BOARD_FONT, top: HEAD_GAP, left: TABLE_X, width: TABLE_W }}><TableHead b={d} /></div>
      </div>
    </>
  );
}

export function Overlay() {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    // OBS shows the scene through the band above the floating header. The app's dark colour-scheme
    // paints an opaque dark canvas behind a transparent page, so switch it off here too.
    document.documentElement.style.colorScheme = "light";
    document.documentElement.style.background = document.body.style.background = "transparent";
    document.title = "โอตะม้าซิ่ง Broadcast Predict · Overlay";
  }, []);
  return <div className="fixed inset-0"><ScrolledBoard /></div>;
}
