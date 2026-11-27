/** ผู้ทายผล: 1–4 pundits (one column each on the board) and their mark for every horse. */
import { Button } from "@otamasing/broadcast-shared/components/Button";
import { Section, hintClass } from "@otamasing/broadcast-shared/components/Section";
import { cx } from "@otamasing/broadcast-shared/lib/cx";
import { MARKS, MAX_PUNDITS, MIN_PUNDITS, type Pundit } from "../lib/model";
import { update, useData } from "../lib/store";
import { inputClass } from "./Field";

export function PunditsTab() {
  const d = useData();
  const setPundits = (fn: (p: Pundit[]) => Pundit[]) => update((x) => ({ ...x, pundits: fn(x.pundits) }));
  const setPick = (i: number, no: number, mark: string) =>
    setPundits((ps) => ps.map((p, j) => {
      if (j !== i) return p;
      const picks = { ...p.picks };
      if (mark) picks[String(no)] = mark as Pundit["picks"][string];
      else delete picks[String(no)];
      return { ...p, picks };
    }));
  return (
    <>
      <Section title={`ผู้ทายผล (${d.pundits.length}/${MAX_PUNDITS})`}>
        {d.pundits.map((p, i) => (
          <div key={i} className="flex gap-1.5">
            <input className={inputClass} aria-label={`ชื่อผู้ทายผลคนที่ ${i + 1}`} value={p.name} placeholder={`คนที่ ${i + 1}`}
              onChange={(e) => setPundits((ps) => ps.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <Button aria-label={`ลบผู้ทายผลคนที่ ${i + 1}`} disabled={d.pundits.length <= MIN_PUNDITS}
              onClick={() => setPundits((ps) => ps.filter((_, j) => j !== i))}>ลบ</Button>
          </div>
        ))}
        <Button variant="primary" disabled={d.pundits.length >= MAX_PUNDITS} onClick={() => setPundits((ps) => [...ps, { name: "", picks: {} }])}>+ เพิ่มผู้ทายผล</Button>
        <span className={hintClass}>อย่างน้อย {MIN_PUNDITS} คน สูงสุด {MAX_PUNDITS} คน ชื่อจะเขียนแนวตั้งบนหัวตาราง</span>
      </Section>
      <Section title="ทายผล">
        <div className="grid gap-1 text-[13px]" style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${d.pundits.length}, 52px)` }}>
          <span />
          {d.pundits.map((p, i) => <span key={i} className="truncate text-center text-[11px] text-ink-muted" title={p.name}>{p.name || `คนที่ ${i + 1}`}</span>)}
          {d.runners.map((h) => (
            <div key={h.number} className="contents">
              <span className={cx("truncate", h.scratched && "line-through opacity-60")}>{h.number}. {h.name}</span>
              {d.pundits.map((p, i) => (
                <select key={i} aria-label={`${p.name || `คนที่ ${i + 1}`} เบอร์ ${h.number}`} className={cx(inputClass, "px-0.5 text-center")}
                  value={p.picks[String(h.number)] ?? ""} onChange={(e) => setPick(i, h.number, e.target.value)}>
                  <option value="">--</option>
                  {MARKS.map((m) => <option key={m}>{m}</option>)}
                </select>
              ))}
            </div>
          ))}
        </div>
        <span className={hintClass}>◎ ตัวเต็ง · ○ ตัวรอง · ▲ ตัวสอดแทรก · △ ลุ้นติดอันดับ · ☆ ม้ามืด · × ตัดทิ้ง</span>
      </Section>
    </>
  );
}
