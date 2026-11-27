/** Text and colours of the board (from the Figma "Shimbun" frame). */
import type { Grade, PastRace, Race } from "./model";

export const ordinal = (n: number) => n + (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");

/** JRA grade pills: GI blue, GII red, GIII green, LR yellow. */
export const GRADE_PILL: Record<Grade, { label: string; color: string }> = {
  G1: { label: "GI", color: "#0B1A78" }, G2: { label: "GII", color: "#E8231B" }, G3: { label: "GIII", color: "#2FA836" }, L: { label: "LR", color: "#F2B10F" },
};

/** Rating box: 120+ gold, 110+ blue, 100+ bronze, lower grey. */
export const ratingColor = (n: number) => (n >= 120 ? "#E2A40E" : n >= 110 ? "#4F9BD9" : n >= 100 ? "#D9895A" : "#8E8E8E");
/** "L123" → 123 */
export const ratingValue = (s: string) => Number(s.match(/\d+/)?.[0] ?? NaN);

/** Past race cell background: 1st gold, 2nd blue, 3rd peach, others white. */
export const finishBg = (f: number | null) => (f === 1 ? "#FDE7AE" : f === 2 ? "#D4E6F8" : f === 3 ? "#FCE1D1" : "#FFFFFF");

/** Running style box colours, top to bottom (front runner … deep closer). */
export const RUN_STYLE_COLOR = ["#0B1A78", "#2FA836", "#EF6A21", "#E8231B"] as const;

/** "2026-11-29" → "2026.11.29" */
export const dotDate = (d: string) => d.replaceAll("-", ".");

const meters = (surface: string, m: number | null) => [surface, m ? `${m} METERS` : ""].filter(Boolean).join(" ");
/** "KYOTO TURF 2400 METERS" */
export const courseLine = (r: Pick<PastRace, "course" | "surface" | "distanceM">) => [r.course, meters(r.surface, r.distanceM)].filter(Boolean).join(" ").toUpperCase();
/** "2026.11.29 TOKYO TURF 2400 METERS" (the POST TIME part is drawn separately, in bold). */
export const raceInfo = (r: Race) => [dotDate(r.date), courseLine(r)].filter(Boolean).join(" ");
