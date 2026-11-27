/** ม้า: the runners, each with its horse, trainer, jockey, silks and up to three recent races. */
import { Button } from "@otamasing/broadcast-shared/components/Button";
import { Section, hintClass } from "@otamasing/broadcast-shared/components/Section";
import { Switch } from "@otamasing/broadcast-shared/components/Switch";
import { SilksPicker } from "@otamasing/broadcast-shared/components/SilksPicker";
import { cx } from "@otamasing/broadcast-shared/lib/cx";
import { FORM_RACES, GRADES, MAX_RUNNERS, RUN_STYLES, SURFACES, newPastRace, newRunner, type Grade, type PastRace, type Runner } from "../lib/model";
import { GRADE_PILL } from "../lib/labels";
import { update, useData } from "../lib/store";
import { Field, inputClass } from "./Field";
import { FlagPicker } from "./FlagPicker";

const num = (v: string, int = true) => (v === "" ? null : int ? Math.round(+v) : +v);

export function HorsesTab() {
  const d = useData();
  const setRunner = (no: number, p: Partial<Runner>) => update((x) => ({ ...x, runners: x.runners.map((h) => (h.number === no ? { ...h, ...p } : h)) }));
  const add = () => update((x) => {
    const next = Math.max(0, ...x.runners.map((h) => h.number)) + 1;
    return { ...x, runners: [...x.runners, newRunner(next)] };
  });
  return (
    <>
      <Section title={`ม้า ${d.runners.length} ตัว`}>
        {d.runners.map((h) => <RunnerEditor key={h.number} h={h} taken={d.runners.map((x) => x.number)} canRemove={d.runners.length > 1} set={(p) => setRunner(h.number, p)}
          remove={() => update((x) => ({ ...x, runners: x.runners.filter((r) => r.number !== h.number) }))} />)}
        <Button variant="primary" onClick={add} disabled={d.runners.length >= MAX_RUNNERS}>+ เพิ่มม้า</Button>
        <span className={hintClass}>ตารางเรียงตามลำดับในรายการนี้ ปกติข้อมูลม้ามาจากไฟล์ JSON ที่เตรียมไว้ ที่นี่ใช้แก้ทีละช่อง</span>
      </Section>
    </>
  );
}

function RunnerEditor({ h, taken, canRemove, set, remove }: { h: Runner; taken: number[]; canRemove: boolean; set: (p: Partial<Runner>) => void; remove: () => void }) {
  const id = (k: string) => `h${h.number}-${k}`;
  const text = (k: "name" | "profile" | "rating" | "sire" | "dam" | "bms" | "trainer" | "jockey", label: string) => (
    <Field id={id(k)} label={label}><input id={id(k)} className={inputClass} value={h[k]} onChange={(e) => set({ [k]: e.target.value })} /></Field>
  );
  const setForm = (i: number, p: Partial<PastRace>) => set({ form: h.form.map((r, j) => (j === i ? { ...r, ...p } : r)) });
  return (
    <details className="border border-line bg-panel" data-testid="runner-editor">
      <summary className={cx("cursor-pointer px-2 py-1.5 text-[13px]", h.scratched && "line-through opacity-60")}>{h.number}. {h.name || "(ไม่มีชื่อ)"}</summary>
      <div className="grid gap-1.5 px-2 pb-2">
        <Field id={id("number")} label="เบอร์">
          <input id={id("number")} className={inputClass} type="number" min={1} max={MAX_RUNNERS} value={h.number}
            onChange={(e) => { const n = Math.round(+e.target.value); if (n >= 1 && n <= MAX_RUNNERS && !taken.includes(n)) set({ number: n }); }} />
        </Field>
        <Field id={id("draw")} label="ซอง (ถ้าไม่คำนวณเอง)">
          <input id={id("draw")} className={inputClass} type="number" min={1} max={MAX_RUNNERS} value={h.draw ?? ""} onChange={(e) => set({ draw: num(e.target.value) })} />
        </Field>
        {text("name", "ชื่อม้า")}
        <Field id={id("country")} label="ธงม้า"><FlagPicker label={`ธงม้าเบอร์ ${h.number}`} value={h.country} onChange={(country) => set({ country })} /></Field>
        {text("profile", "อายุ สี เพศ")}
        {text("rating", "เรตติ้ง (เช่น L123)")}
        {text("sire", "พ่อ")}
        {text("dam", "แม่")}
        {text("bms", "พ่อของแม่")}
        <Field id={id("center")} label="สังกัด / ธงเทรนเนอร์"><FlagPicker centers label={`สังกัดเบอร์ ${h.number}`} value={h.center} onChange={(center) => set({ center })} /></Field>
        {text("trainer", "เทรนเนอร์")}
        <Field id={id("style")} label="สไตล์การวิ่ง">
          <select id={id("style")} className={inputClass} value={h.runStyle ?? ""} onChange={(e) => set({ runStyle: num(e.target.value) })}>
            <option value="">ไม่แสดง</option>
            {RUN_STYLES.map((s, i) => <option key={s} value={i + 1}>{s}</option>)}
          </select>
        </Field>
        <Switch on={h.blinkers} label="ใส่ Blinkers (B)" onToggle={() => set({ blinkers: !h.blinkers })} />
        {text("jockey", "จ็อกกี้")}
        <Field id={id("jc")} label="ธงจ็อกกี้"><FlagPicker label={`ธงจ็อกกี้เบอร์ ${h.number}`} value={h.jockeyCountry} onChange={(jockeyCountry) => set({ jockeyCountry })} /></Field>
        <Field id={id("weight")} label="น้ำหนัก (kg)">
          <input id={id("weight")} className={inputClass} type="number" step={0.5} value={h.weight ?? ""} onChange={(e) => set({ weight: num(e.target.value, false) })} />
        </Field>
        <Field id={id("silks")} label="ลายเสื้อ"><SilksPicker id={id("silks")} value={h.silks} onChange={(silks) => set({ silks })} selectClassName={inputClass} /></Field>
        <Switch on={h.scratched} label="ถอนตัว" onToggle={() => set({ scratched: !h.scratched })} />
        <h4 className="m-0 mt-1 text-[13px] font-medium">ผลงานล่าสุด ({h.form.length}/{FORM_RACES})</h4>
        {h.form.map((r, i) => <PastEditor key={i} r={r} label={`เบอร์ ${h.number} รายการที่ ${i + 1}`} set={(p) => setForm(i, p)} remove={() => set({ form: h.form.filter((_, j) => j !== i) })} />)}
        <div className="flex justify-between gap-1.5">
          <Button disabled={h.form.length >= FORM_RACES} onClick={() => set({ form: [...h.form, newPastRace()] })}>+ เพิ่มผลงาน</Button>
          <Button variant="danger" disabled={!canRemove} onClick={remove}>ลบม้าตัวนี้</Button>
        </div>
      </div>
    </details>
  );
}

function PastEditor({ r, label, set, remove }: { r: PastRace; label: string; set: (p: Partial<PastRace>) => void; remove: () => void }) {
  const input = (k: "date" | "round" | "name" | "course" | "time" | "jockey" | "other", ph: string, type = "text") => (
    <input aria-label={`${label} ${ph}`} placeholder={ph} className={inputClass} type={type} value={r[k]} onChange={(e) => (k === "date" && !e.target.value) || set({ [k]: e.target.value })} />
  );
  const number = (k: "distanceM" | "finish" | "field" | "rating" | "weight", ph: string) => (
    <input aria-label={`${label} ${ph}`} placeholder={ph} className={inputClass} type="number" step={k === "weight" ? 0.5 : 1} value={r[k] ?? ""} onChange={(e) => set({ [k]: num(e.target.value, k !== "weight") })} />
  );
  return (
    <div className="grid grid-cols-3 gap-1 border-l-2 border-line pl-1.5">
      {input("date", "วันที่", "date")}
      {input("round", "เรซ")}
      <select aria-label={`${label} เกรด`} className={inputClass} value={r.grade ?? ""} onChange={(e) => set({ grade: (e.target.value || null) as Grade | null })}>
        <option value="">ไม่มีเกรด</option>
        {GRADES.map((g) => <option key={g} value={g}>{GRADE_PILL[g].label}</option>)}
      </select>
      <span className="col-span-3">{input("name", "ชื่อรายการ")}</span>
      {input("course", "สนาม")}
      <select aria-label={`${label} พื้นสนาม`} className={inputClass} value={r.surface} onChange={(e) => set({ surface: e.target.value as PastRace["surface"] })}>
        {SURFACES.map((s) => <option key={s}>{s}</option>)}
      </select>
      {number("distanceM", "ระยะ")}
      {number("finish", "อันดับ")}
      {number("field", "จากกี่ตัว")}
      {number("rating", "เรตติ้ง")}
      {input("time", "เวลา")}
      {input("jockey", "จ็อกกี้")}
      {number("weight", "น้ำหนัก")}
      <span className="col-span-2">{input("other", "ผู้ชนะ (หรือที่ 2 ถ้าชนะเอง)")}</span>
      <span className="flex items-center gap-1">
        <span className="flex-1"><FlagPicker label={`${label} ธงจ็อกกี้`} value={r.jockeyCountry} onChange={(jockeyCountry) => set({ jockeyCountry })} /></span>
        <Button aria-label={`ลบ${label}`} onClick={remove}>ลบ</Button>
      </span>
    </div>
  );
}
