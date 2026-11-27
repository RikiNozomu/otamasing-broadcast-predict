/**
 * The OBS Browser Source: the board scaled to the page width, scrolled to the row the dock picked
 * (smoothly), with the table header stuck to the top once the title has scrolled away.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useData } from "../lib/store";
import { Board, BOARD_W, HEAD_Y, ROW_H } from "../board/Board";

/** Scroll position (board px) for the dock's value: 0 = top, k = horse row k right under the header. */
export const scrollY = (scroll: number) => (scroll <= 0 ? 0 : HEAD_Y + (scroll - 1) * ROW_H);

/** The board fitted to its box's width, scrolled by `scroll`. Used by the overlay and the landing preview. */
export function ScrolledBoard({ smooth = true }: { smooth?: boolean }) {
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
  useEffect(() => {
    box.current?.scrollTo({ top: scrollY(d.scroll) * zoom, behavior: smooth ? "smooth" : "auto" });
  }, [d.scroll, zoom, smooth, d.runners.length]);
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
