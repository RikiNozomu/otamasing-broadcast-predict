import { describe, expect, it } from "vitest";
import { exportBoard, fileStem, parseBoard } from "../../src/lib/model";
import { SAMPLE, sampleData } from "../../src/lib/sample";
import { finishBg, ordinal, ratingColor, ratingValue } from "../../src/lib/labels";
import { scrollY } from "../../src/overlay/Overlay";

describe("board file", () => {
  it("round-trips the sample through export and import", () => {
    const d = { ...sampleData(), scroll: 3 };
    const out = exportBoard(d);
    expect(out).not.toHaveProperty("scroll");
    const r = parseBoard(JSON.stringify(out));
    expect(r.ok && r.board).toEqual(out);
  });
  it("fills defaults for a minimal hand-written file", () => {
    const r = parseBoard(JSON.stringify({ race: { date: "2026-11-29", name: "Japan Cup" }, runners: [{ number: 1, name: "A" }] }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.board.pundits).toHaveLength(1);
    expect(r.board.runners[0]).toMatchObject({ silks: "", form: [], draw: null, runStyle: null });
    expect(r.board.style).toMatchObject({ drawScheme: "jra", numberScheme: "plain", autoDraw: true, showDraw: true });
  });
  it("keeps 1 to 4 pundits and at most 3 recent races, with Thai errors", () => {
    const base = { race: { date: "2026-11-29", name: "X" }, runners: [{ number: 1 }] };
    expect(parseBoard(JSON.stringify({ ...base, pundits: [] }))).toEqual({ ok: false, error: "pundits: ต้องมีผู้ทายผลอย่างน้อย 1 คน" });
    expect(parseBoard(JSON.stringify({ ...base, pundits: [{}, {}, {}, {}, {}] }))).toEqual({ ok: false, error: "pundits: ผู้ทายผลได้ไม่เกิน 4 คน" });
    const form = Array(4).fill({ date: "2026-01-01", name: "R" });
    expect(parseBoard(JSON.stringify({ ...base, runners: [{ number: 1, form }] })).ok).toBe(false);
    expect(parseBoard(JSON.stringify({ ...base, runners: [{ number: 1 }, { number: 1 }] }))).toEqual({ ok: false, error: "runners: เบอร์ 1 ซ้ำ" });
    expect(parseBoard("{")).toEqual({ ok: false, error: "ไฟล์ไม่ใช่ JSON ที่ถูกต้อง" });
  });
  it("rejects a pick that is not one of the marks", () => {
    expect(parseBoard(JSON.stringify({ ...SAMPLE, pundits: [{ name: "a", picks: { "1": "X" } }] })).ok).toBe(false);
  });
  it("names files after the date, round and race", () => {
    expect(fileStem(sampleData().race)).toBe("2026-11-29-12r-japan-cup");
  });
});

describe("labels", () => {
  it("ordinals, rating colours and finish colours", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd"]);
    expect(ratingValue("L123")).toBe(123);
    expect([123, 115, 105, 65].map(ratingColor)).toEqual(["#E2A40E", "#4F9BD9", "#D9895A", "#8E8E8E"]);
    expect([1, 2, 3, 9, null].map(finishBg)).toEqual(["#FDE7AE", "#D4E6F8", "#FCE1D1", "#FFFFFF", "#FFFFFF"]);
  });
  it("scroll 0 is the top, then one row at a time under the header", () => {
    expect([0, 1, 2].map(scrollY)).toEqual([0, 240, 334]);
  });
});
