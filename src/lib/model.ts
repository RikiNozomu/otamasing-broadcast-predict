/**
 * Data model and the JSON file format (docs/board-json.md). One file = ONE race board: the race, its runners
 * with their last three races, and 1–4 pundits with their picks. The dock keeps it in localStorage.
 */
import { z } from "zod";
import { SCHEMES, type Scheme } from "@otamasing/broadcast-shared/data";
export { SCHEMES, type Scheme };

export const MAX_RUNNERS = 30;
export const MIN_PUNDITS = 1;
export const MAX_PUNDITS = 4;
/** Past races shown per horse (the three RECENT PERFORMANCES columns). */
export const FORM_RACES = 3;
export const GRADES = ["G1", "G2", "G3", "L"] as const;
export type Grade = (typeof GRADES)[number];
export const SURFACES = ["Turf", "Dirt", "Jump"] as const;
/** Newspaper marks: ◎ first choice, ○ second, ▲ third, △ place hopes, ☆ dark horse, × against. "" shows "--". */
export const MARKS = ["◎", "○", "▲", "△", "☆", "×"] as const;
/** Running style boxes from top to bottom: front runner, stalker, closer, deep closer (逃げ 先行 差し 追込). */
export const RUN_STYLES = ["Front", "Stalker", "Closer", "Deep closer"] as const;

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "สีต้องเป็น #RRGGBB");
/** ISO 3166 alpha-2 code ("JP"), a JRA centre (MIHO / RITTO), or "" for no flag. */
const flag = z.union([z.string().regex(/^[A-Z]{2}$/, "รหัสประเทศต้องเป็นตัวพิมพ์ใหญ่ 2 ตัว เช่น JP"), z.literal("MIHO"), z.literal("RITTO"), z.literal("")]).default("");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "วันที่ต้องเป็น YYYY-MM-DD");
const silks = z.preprocess((v) => (typeof v === "string" ? v : ""), z.string());

/** One of the horse's recent races. `other` is the winner, or the runner-up (shown in brackets) when this horse won. */
export const PastRaceSchema = z.object({
  date,
  round: z.string().default(""),
  grade: z.enum(GRADES).nullable().default(null),
  name: z.string().min(1, "ต้องมีชื่อรายการ"),
  course: z.string().default(""),
  surface: z.enum(SURFACES).default("Turf"),
  distanceM: z.number().int().positive().nullable().default(null),
  finish: z.number().int().min(1).nullable().default(null),
  field: z.number().int().min(1).nullable().default(null),
  /** Rating of the run (the coloured box before the time). */
  rating: z.number().int().min(0).max(200).nullable().default(null),
  time: z.string().default(""),
  jockey: z.string().default(""),
  jockeyCountry: flag,
  weight: z.number().min(30).max(80).nullable().default(null),
  other: z.string().default(""),
});
export type PastRace = z.infer<typeof PastRaceSchema>;

export const RunnerSchema = z.object({
  number: z.number().int().min(1).max(MAX_RUNNERS),
  draw: z.number().int().min(1).max(MAX_RUNNERS).nullable().default(null),
  name: z.string().default(""),
  /** Flag before the horse's name. */
  country: flag,
  /** Written as shown, e.g. "5yo DB H". */
  profile: z.string().default(""),
  /** Rating with its distance letter, e.g. "L123" (box colour follows the number). */
  rating: z.string().default(""),
  sire: z.string().default(""),
  dam: z.string().default(""),
  /** Broodmare sire (the dam's sire): "DAM by BMS". */
  bms: z.string().default(""),
  /** Badge before the trainer: MIHO / RITTO or a country flag. */
  center: flag,
  trainer: z.string().default(""),
  blinkers: z.boolean().default(false),
  /** Running style 1–4 (RUN_STYLES), null = no boxes. */
  runStyle: z.number().int().min(1).max(4).nullable().default(null),
  jockey: z.string().default(""),
  jockeyCountry: flag,
  weight: z.number().min(30).max(80).nullable().default(null),
  /** Owner's silks by name from otamasing-broadcast-shared (lib/silks), "" = none. */
  silks,
  scratched: z.boolean().default(false),
  form: z.array(PastRaceSchema).max(FORM_RACES, `ผลงานย้อนหลังได้ไม่เกิน ${FORM_RACES} รายการ`).default([]),
});
export type Runner = z.infer<typeof RunnerSchema>;

export const PunditSchema = z.object({
  name: z.string().default(""),
  /** Mark per horse number: { "3": "◎" }. */
  picks: z.record(z.string().regex(/^\d+$/), z.enum(MARKS)).default({}),
});
export type Pundit = z.infer<typeof PunditSchema>;

export const RaceSchema = z.object({
  date,
  course: z.string().default(""),
  round: z.string().default(""),
  postTime: z.string().default(""),
  timeZone: z.string().default("JST"),
  name: z.string().min(1, "ต้องมีชื่อรายการ"),
  jpName: z.string().default(""),
  grade: z.enum(GRADES).nullable().default(null),
  surface: z.enum(SURFACES).default("Turf"),
  distanceM: z.number().int().positive().nullable().default(null),
});
export type Race = z.infer<typeof RaceSchema>;

export const StyleSchema = z.object({
  drawScheme: z.enum(SCHEMES).default("jra"),
  numberScheme: z.enum(SCHEMES).default("plain"),
  autoDraw: z.boolean().default(true),
  /** Custom scheme colours by number: [background, text]. Missing numbers fall back to the US colours. */
  customColors: z.record(z.string().regex(/^\d+$/), z.tuple([hex, hex])).default({}),
  /** Show the BK (draw) column. */
  showDraw: z.boolean().default(true),
});
export type Style = z.infer<typeof StyleSchema>;

export const BoardSchema = z
  .object({
    version: z.literal(1).default(1),
    race: RaceSchema,
    style: StyleSchema.default({}),
    pundits: z.array(PunditSchema).min(MIN_PUNDITS, "ต้องมีผู้ทายผลอย่างน้อย 1 คน").max(MAX_PUNDITS, `ผู้ทายผลได้ไม่เกิน ${MAX_PUNDITS} คน`).default([{}]),
    runners: z.array(RunnerSchema).min(1, "ต้องมีม้าอย่างน้อย 1 ตัว").max(MAX_RUNNERS, `ม้าได้ไม่เกิน ${MAX_RUNNERS} ตัว`),
    /** The top-left picture as a data: URL (JPEG), so it travels inside the JSON; null = none. */
    photo: z.string().regex(/^data:image\//, "รูปต้องเป็น data:image/...").nullable().default(null),
  })
  .superRefine((b, ctx) => {
    const seen = new Set<number>();
    for (const h of b.runners) {
      if (seen.has(h.number)) ctx.addIssue({ code: "custom", message: `เบอร์ ${h.number} ซ้ำ`, path: ["runners"] });
      seen.add(h.number);
    }
  });
export type BoardInput = z.input<typeof BoardSchema>;
export type Board = z.output<typeof BoardSchema>;

/** What the dock stores: the board plus how far the overlay is scrolled, in board px (0 = top), free, no snapping. */
export type AppData = Board & { scroll: number };

export type ParseResult = { ok: true; board: Board } | { ok: false; error: string };

/** Validate a JSON text; errors are short Thai messages with the path, for the dock toast. */
export function parseBoard(text: string): ParseResult {
  if (!text.trim()) return { ok: false, error: "ไฟล์ว่างเปล่า (ไม่มีข้อมูล)" };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "ไฟล์ไม่ใช่ JSON ที่ถูกต้อง" };
  }
  const res = BoardSchema.safeParse(json);
  if (res.success) return { ok: true, board: res.data };
  const issue = res.error.issues[0];
  return { ok: false, error: `${issue.path.join(".") || "ไฟล์"}: ${issue.message}` };
}

/** The file written by "ส่งออก JSON": the board without the dock's scroll position. */
export function exportBoard(d: AppData): Board {
  const { scroll: _, ...board } = d;
  return board;
}

/** e.g. 2026-11-29-12r-japan-cup */
export function fileStem(r: Race) {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [r.date, slug(r.round), slug(r.name)].filter(Boolean).join("-") || "board";
}

export const newRunner = (number: number): Runner => RunnerSchema.parse({ number });
export const newPastRace = (): PastRace => PastRaceSchema.parse({ date: new Date().toISOString().slice(0, 10), name: "-" });
