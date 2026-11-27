/**
 * The OBS Browser Source: the board scaled to the page width, scrolled to the dock's position
 * (smoothly). Once the title has scrolled away the table header floats HEAD_GAP below the top;
 * everything else, background included, keeps scrolling.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cx } from "@otamasing/broadcast-shared/lib/cx";
import { useData } from "../lib/store";
import { Board, BOARD_FONT, BOARD_W, boardHeight, HEAD_Y, TABLE_W, TABLE_X, TableHead } from "../board/Board";

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
  const [size, setSize] = useState({ w: BOARD_W, h: VIEW_H });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // normally the board fills the width and scrolls; "fit" shrinks it to the height so the whole board shows, centred
  const zoom = d.fit ? Math.min(size.w / BOARD_W, size.h / boardHeight(d.runners.length)) : size.w / BOARD_W;
  const target = useRef(0);
  target.current = d.fit ? 0 : d.scroll * zoom;
  const fitRef = useRef(d.fit);
  fitRef.current = d.fit;
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const el = box.current;
      if (el) {
        if (fitRef.current) el.scrollTop = 0;
        const cur = el.scrollTop, diff = target.current - cur;
        // ease 18% of the way each frame (at least 1 px, since scrollTop rounds), then land exactly
        if (Math.abs(diff) > 1) el.scrollTop = cur + Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.18);
        else if (diff !== 0) el.scrollTop = target.current;
        // past the point where the board's own header reaches HEAD_GAP: show the floating copy (only the header sticks)
        const stuck = el.scrollTop / (el.clientWidth / BOARD_W) > HEAD_Y - HEAD_GAP;
        if (head.current) head.current.style.visibility = stuck ? "visible" : "hidden";
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <>
      <div ref={box} data-testid="scroller" className={cx("absolute inset-0 overflow-hidden", !d.fit && "bg-white")}>
        <div className="mx-auto w-fit" style={{ zoom }}><Board b={d} /></div>
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
    // a transparent page for OBS; the app's dark colour-scheme would paint an opaque dark canvas behind it
    document.documentElement.style.colorScheme = "light";
    document.documentElement.style.background = document.body.style.background = "transparent";
    document.title = "โอตะม้าซิ่ง Broadcast Predict · Overlay";
  }, []);
  return <div className="fixed inset-0"><ScrolledBoard /></div>;
}
