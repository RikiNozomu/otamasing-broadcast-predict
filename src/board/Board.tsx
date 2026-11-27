/**
 * The runner board with pundit picks, drawn at the Figma frame's width (1418 px, "JRA20261129 TKY G1 Shimbun").
 * The overlay scales it to the screen width and scrolls it; the table header sticks to the top while scrolling.
 * The JPG / PDF export draws the same board at full height.
 */
import type { CSSProperties, ReactNode } from "react";
import { boxColors, drawOf, numberFont, type Pair } from "@otamasing/broadcast-shared/lib/colors";
import { Flag } from "@otamasing/broadcast-shared/components/Flag";
import { FitText } from "@otamasing/broadcast-shared/components/FitText";
import { Logo } from "@otamasing/broadcast-shared/components/Logo";
import { Silks } from "@otamasing/broadcast-shared/components/Silks";
import { cx } from "@otamasing/broadcast-shared/lib/cx";
import { FORM_RACES, photoTransform, type Board as BoardData, type PastRace, type Runner } from "../lib/model";
import { courseLine, dotDate, finishBg, GRADE_PILL, ordinal, raceInfo, ratingColor, ratingValue, RUN_STYLE_COLOR } from "../lib/labels";

export const BOARD_W = 1418;
export const TABLE_X = 38;
export const TABLE_W = 1342;
/** Top of the table header, its height, and each runner row's height. */
export const HEAD_Y = 240;
export const HEAD_H = 54;
/** Figma's board font: Alumni Sans for Latin, Otamasing Display (Noto Sans Thai) for Thai. */
export const BOARD_FONT = '"Alumni Sans Variable", var(--font-display)';
export const ROW_H = 94;
const BOTTOM = 38;
export const boardHeight = (rows: number) => HEAD_Y + HEAD_H + rows * ROW_H + BOTTOM;

const INK = "#0B1A78";
const GREY = "#6E6E6E";
const LINE = "#D2D4DC";

function Pill({ children, color, className }: { children: ReactNode; color: string; className?: string }) {
  return <span className={cx("inline-flex flex-none items-center justify-center rounded-full px-2 leading-none font-bold text-white", className)} style={{ background: color }}>{children}</span>;
}

function Rating({ text, className }: { text: string; className?: string }) {
  const n = ratingValue(text);
  if (!text) return null;
  return <span className={cx("inline-flex flex-none items-center rounded-[3px] px-[5px] leading-none font-semibold text-white", className)} style={{ background: Number.isNaN(n) ? "#8E8E8E" : ratingColor(n) }}>{text}</span>;
}

/** A board flag with the thin grey frame of the Figma "flag" component. */
const BoardFlag = ({ code, className }: { code: string; className?: string }) =>
  code ? <Flag code={code} className={cx("rounded-none", className)} style={{ boxShadow: `0 0 0 1px ${LINE}` }} /> : null;

/** The BK / PP cell: the whole cell takes the box colour; plain = black number on white. */
function NumberCell({ value, colors }: { value: number; colors: Pair | null }) {
  const [bg, fg] = colors ?? ["#FFFFFF", "#000000"];
  return <div className="flex items-center justify-center text-[34px] font-bold" style={{ ...numberFont, background: bg, color: fg, borderRight: `1px solid ${LINE}` }}>{value}</div>;
}

/** Four stacked boxes in the style's colour, with a triangle in the horse's running style. */
function RunStyle({ style }: { style: number }) {
  const c = RUN_STYLE_COLOR[style - 1];
  return (
    <span className="grid gap-px" data-testid="run-style" data-style={style}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className="flex size-[11px] items-center justify-center bg-white" style={{ boxShadow: `inset 0 0 0 1px ${c}` }}>
          {i === style && <span className="size-0 border-x-[4px] border-b-[7px] border-x-transparent" style={{ borderBottomColor: c }} />}
        </span>
      ))}
    </span>
  );
}

function HorseCell({ h }: { h: Runner }) {
  return (
    <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)] content-center gap-[1px] overflow-hidden px-2 leading-none" style={{ borderRight: `1px solid ${LINE}` }}>
      <div className="flex items-center gap-1.5 text-[15.5px]" style={{ color: GREY }}>
        <FitText>{h.sire.toUpperCase()}</FitText>
        <Rating text={h.rating} className="h-[15px] text-[13px]" />
        <span className="flex-none">{h.profile}</span>
      </div>
      <div className="flex items-center gap-1.5 pr-6">
        <BoardFlag code={h.country} className="h-[15px] w-[22px]" />
        <FitText className="text-[32px] leading-[1.05] font-bold" strike={h.scratched}><span data-testid="horse" style={{ color: INK }}>{h.name.toUpperCase()}</span></FitText>
      </div>
      <div className="flex items-center gap-1.5 pr-6 text-[20px]" style={{ color: "#3A3A3A" }}>
        <BoardFlag code={h.center} className="h-[16px] w-[24px]" />
        <FitText>{h.trainer.toUpperCase()}</FitText>
      </div>
      <div className="text-[16px]" style={{ color: GREY }}>
        <FitText>{h.dam.toUpperCase()}{h.bms && <> <span className="lowercase">by</span> {h.bms.toUpperCase()}</>}</FitText>
      </div>
      <span className="absolute top-[24px] right-2 grid justify-items-center gap-1">
        {h.blinkers && <span data-testid="blinkers" className="flex size-[13px] items-center justify-center bg-[#C8161D] text-[10px] font-bold text-white">B</span>}
        {h.runStyle && <RunStyle style={h.runStyle} />}
      </span>
    </div>
  );
}

function JockeyCell({ h }: { h: Runner }) {
  return (
    <div className="grid min-w-0 content-center justify-items-center gap-[2px] px-1 leading-none" style={{ borderRight: `1px solid ${LINE}` }}>
      {h.silks ? <Silks name={h.silks} className="h-[40px] w-[48px]" /> : <span className="h-[40px]" />}
      <span className="flex w-full justify-center text-[16px] font-bold" style={{ color: INK }}><FitText grow={false}>{h.jockey.toUpperCase()}</FitText></span>
      <span className="flex items-center gap-1 text-[17px]" style={{ color: "#3A3A3A" }}>
        <BoardFlag code={h.jockeyCountry} className="h-[13px] w-[20px]" />
        {h.weight != null && <span>{h.weight.toFixed(1)} kg</span>}
      </span>
    </div>
  );
}

function PastCell({ r, last }: { r?: PastRace; last: boolean }) {
  const border: CSSProperties = last ? {} : { borderRight: `1px solid ${LINE}` };
  if (!r) return <div style={border} />;
  const won = r.finish === 1;
  return (
    <div data-testid="past" className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-center gap-x-1 gap-y-[4px] px-2 leading-none" style={{ ...border, background: finishBg(r.finish) }}>
      <span className="flex items-center gap-1.5 text-[16px]" style={{ color: GREY }}>
        {dotDate(r.date)} {r.round}
        {r.grade && <Pill color={GRADE_PILL[r.grade].color} className="h-[15px] text-[12px]">{GRADE_PILL[r.grade].label}</Pill>}
      </span>
      <span className="row-span-2 self-end text-right whitespace-nowrap" style={{ color: "#333" }}>
        {r.finish != null && <><span className="text-[31px] font-bold">{ordinal(r.finish)}</span>{r.field != null && <span className="text-[15px]"> of {r.field}</span>}</>}
      </span>
      <span className="flex min-w-0 text-[24px] font-bold" style={{ color: INK }}><FitText>{r.name.toUpperCase()}</FitText></span>
      <span className="flex min-w-0 text-[16px]" style={{ color: GREY }}><FitText>{courseLine(r)}</FitText></span>
      <span className="flex items-center justify-end gap-1 text-[17px]" style={{ color: "#3A3A3A" }}>
        {r.rating != null && <span className="rounded-[2px] px-1 text-[12px] leading-[13px] font-semibold text-white" style={{ background: ratingColor(r.rating) }}>{r.rating}</span>}
        {r.time}
      </span>
      <span className="flex min-w-0 items-center gap-1 text-[16px]" style={{ color: GREY }}>
        <BoardFlag code={r.jockeyCountry} className="h-[11px] w-[17px]" />
        <FitText>{r.jockey.toUpperCase()}{r.weight != null && <>&nbsp; {r.weight.toFixed(1)}</>}</FitText>
      </span>
      <span className="max-w-[110px] text-right text-[16px] whitespace-nowrap" style={{ color: GREY }}>
        <FitText grow={false}>{r.other ? (won ? `(${r.other.toUpperCase()})` : r.other.toUpperCase()) : ""}</FitText>
      </span>
    </div>
  );
}

export function useColumns(b: BoardData) {
  const draw = b.style.showDraw;
  return `${draw ? "62px " : ""}62px 242px 124px ${b.pundits.map(() => "40px").join(" ")} repeat(${FORM_RACES}, minmax(0, 1fr))`;
}

/** The table header (BK PP HORSE JOCKEY, the pundits' names written sideways, RECENT PERFORMANCES). */
export function TableHead({ b }: { b: BoardData }) {
  const cell = "flex items-center justify-center text-[24px] font-bold";
  const sep = { borderRight: "1px solid rgb(255 255 255 / .35)" };
  return (
    <div data-testid="table-head" className="grid overflow-hidden rounded-t-[22px] bg-[#00157D] text-white" style={{ gridTemplateColumns: useColumns(b), height: HEAD_H }}>
      {b.style.showDraw && <span className={cell} style={sep}>BK</span>}
      <span className={cell} style={sep}>PP</span>
      <span className={cell} style={sep}>HORSE</span>
      <span className={cell} style={sep}>JOCKEY</span>
      {b.pundits.map((p, i) => (
        <span key={i} data-testid="pundit-head" className="flex items-center justify-center overflow-hidden" style={sep}>
          <span className="max-h-[52px] text-center font-body text-[11px] leading-[1.15] font-medium [writing-mode:vertical-rl]">{p.name}</span>
        </span>
      ))}
      <span className={cx(cell, "text-[22px]")} style={{ gridColumn: `span ${FORM_RACES}` }}>RECENT PERFORMANCES</span>
    </div>
  );
}

function Row({ b, h }: { b: BoardData; h: Runner }) {
  const S = b.style, n = b.runners.length;
  const d = drawOf(S, h.number, h.draw, n);
  return (
    <div data-testid="row" data-no={h.number} data-out={h.scratched ? "" : undefined} className={cx("grid bg-white", h.scratched && "opacity-45")}
      style={{ gridTemplateColumns: useColumns(b), height: ROW_H, borderBottom: `1px solid ${LINE}` }}>
      {S.showDraw && <NumberCell value={d} colors={boxColors(S.drawScheme, d, h.number, n, S, false)} />}
      <NumberCell value={h.number} colors={boxColors(S.numberScheme, h.number, h.number, n, S, true)} />
      <HorseCell h={h} />
      <JockeyCell h={h} />
      {b.pundits.map((p, i) => (
        <div key={i} data-testid="pick" data-mark={p.picks[String(h.number)] ?? ""} className="flex items-center justify-center" style={{ color: INK, borderRight: `1px solid ${LINE}` }}>
          <Mark m={p.picks[String(h.number)]} />
        </div>
      ))}
      {Array.from({ length: FORM_RACES }, (_, i) => <PastCell key={i} r={h.form[i]} last={i === FORM_RACES - 1} />)}
    </div>
  );
}

/** Race title on the right: grade + Japanese name, the big English name, date · course · post time, and the race number box. */
function Title({ b }: { b: BoardData }) {
  const r = b.race;
  return (
    <div className="absolute top-[56px] right-[42px] flex items-center gap-[18px]">
      <div className="grid justify-items-end leading-none">
        <span className="flex items-center gap-2">
          {r.grade && <Pill color={GRADE_PILL[r.grade].color} className="h-[19px] px-3 text-[14px]">{GRADE_PILL[r.grade].label}</Pill>}
          {r.jpName && <span data-testid="jp-name" className="text-[25px] text-black" style={{ fontFamily: '"Noto Serif JP Variable", serif' }}>{r.jpName}</span>}
        </span>
        <span data-testid="race-name" className="mt-1 text-[95px] leading-[.95] font-bold text-black [text-shadow:0_4px_8px_rgb(0_0_0/.25)]">{r.name.toUpperCase()}</span>
        <span className="mt-2 text-[28px] text-black">
          {raceInfo(r)}{r.postTime && <> <b>POST TIME</b> {r.postTime} {r.timeZone}</>}
        </span>
      </div>
      {r.round && (
        <span data-testid="round" className="flex h-[102px] min-w-[122px] items-center justify-center rounded-[10px] bg-[#00157D] px-3 leading-none font-bold text-white">
          <span className="flex items-baseline">
            <span className="text-[59px]">{r.round.replace(/R$/i, "")}</span>
            {/R$/i.test(r.round) && <span className="text-[48px]">R</span>}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * The whole board. The overlay keeps a copy of the table header on top while it scrolls (see Overlay).
 */
export function Board({ b }: { b: BoardData }) {
  return (
    <div data-testid="board" className="relative bg-white" style={{ fontFamily: BOARD_FONT, width: BOARD_W, minHeight: boardHeight(b.runners.length) }}>
      <div className="absolute inset-x-0 top-0 h-[420px] overflow-hidden">
        {b.photo && (
          <div className="absolute top-0 left-0 h-[420px] w-[1100px] overflow-hidden">
            <img data-testid="photo" src={b.photo} alt="" className="size-full object-cover" style={{ transform: photoTransform(b.photoPos) }} />
            {/* fades drawn as white gradients (the JPG / PDF export can't draw CSS masks) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_35%,#fff_92%)]" />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,#fff_100%)]" />
      </div>
      <Logo className="absolute top-[15px] left-[20px] w-[145px] drop-shadow-[0_1px_3px_rgb(0_0_0/.5)]" />
      <Title b={b} />
      <div className="absolute" style={{ left: TABLE_X, top: HEAD_Y, width: TABLE_W, bottom: BOTTOM }}>
        <TableHead b={b} />
        <div data-testid="rows" style={{ borderLeft: `1px solid ${LINE}`, borderRight: `1px solid ${LINE}` }}>
          {b.runners.map((h) => <Row key={h.number} b={b} h={h} />)}
        </div>
      </div>
    </div>
  );
}

/** Marks drawn as SVG so each sits dead centre at one size (font glyphs differ in size and baseline). */
function Mark({ m }: { m?: string }) {
  const line = { fill: "none", stroke: "currentColor", strokeWidth: 2.4 };
  const shape: Record<string, JSX.Element> = {
    "◎": <><circle cx="16" cy="16" r="13" {...line} /><circle cx="16" cy="16" r="7.5" {...line} /></>,
    "○": <circle cx="16" cy="16" r="13" {...line} />,
    "▲": <path d="M16 3 L30 28 H2 Z" fill="currentColor" />,
    "△": <path d="M16 4.5 L28.5 27 H3.5 Z" {...line} strokeLinejoin="round" />,
    "☆": <path d="M16 2.5 L19.5 12 L29.5 12.3 L21.6 18.5 L24.4 28.2 L16 22.5 L7.6 28.2 L10.4 18.5 L2.5 12.3 L12.5 12 Z" {...line} strokeLinejoin="round" />,
    "×": <path d="M5 5 L27 27 M27 5 L5 27" {...line} strokeWidth={3} strokeLinecap="round" />,
  };
  return (
    // ◎ (first choice) is red, as in Figma's Prediction component
    <svg width="32" height="32" viewBox="0 0 32 32" aria-label={m || "-"} style={m === "◎" ? { color: GRADE_PILL.G2.color } : undefined}>
      {(m && shape[m]) || <path d="M4 16 H13 M19 16 H28" {...line} strokeWidth={3} />}
    </svg>
  );
}
