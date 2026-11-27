/** การแข่งขัน: race facts, the top-left picture, and the BK / PP box colours (like compact and intro). */
import { Button, buttonClass } from "@otamasing/broadcast-shared/components/Button";
import { Section, hintClass } from "@otamasing/broadcast-shared/components/Section";
import { Switch } from "@otamasing/broadcast-shared/components/Switch";
import { GRADES, SURFACES, type Grade, type Race, type Scheme, type Style } from "../lib/model";
import { setData, update, useData } from "../lib/store";
import { shrinkPicture } from "../lib/exportImage";
import { GRADE_PILL } from "../lib/labels";
import { Field, inputClass } from "./Field";
import type { Toast } from "./Dock";

const SCHEME_LABEL: Partial<Record<Scheme, string>> = { jra: "JRA 8 สีตามซอง", us: "อเมริกา (Saddle towel)", hk: "ฮ่องกง (ขาว ตัวเลขเขียว)", gb: "อังกฤษ (เหลือง)", fr: "ฝรั่งเศส (เหลือง)", plain: "ไม่มีสี (ดำบนขาว)" };
const NO_SCHEME_LABEL: Partial<Record<Scheme, string>> = { plain: "ไม่มีสี (ดำบนขาว)", jra: "JRA ตามซองของม้า", us: "อเมริกา (Saddle towel)", gb: "อังกฤษ (น้ำเงิน)", fr: "ฝรั่งเศส (แดง)" };

export function RaceTab({ toast }: { toast: Toast }) {
  const d = useData();
  const r = d.race, S = d.style;
  const setRace = (p: Partial<Race>) => update((x) => ({ ...x, race: { ...x.race, ...p } }));
  const setStyle = (p: Partial<Style>) => update((x) => ({ ...x, style: { ...x.style, ...p } }));
  const text = (key: "date" | "round" | "course" | "postTime" | "timeZone" | "name" | "jpName", label: string, type = "text") => (
    <Field id={`race-${key}`} label={label}>
      <input id={`race-${key}`} className={inputClass} type={type} value={r[key]} onChange={(e) => (key === "date" && !e.target.value) || setRace({ [key]: e.target.value })} />
    </Field>
  );
  const pick = async (f: File | undefined) => {
    if (!f) return;
    try {
      const photo = await shrinkPicture(f);
      const ok = setData({ ...d, photo });
      toast(ok ? "ใส่รูปแล้ว" : "รูปใหญ่เกินกว่าจะเก็บในเบราว์เซอร์ ลองรูปที่เล็กลง", !ok);
    } catch {
      toast("เปิดไฟล์รูปนี้ไม่ได้", true);
    }
  };
  return (
    <>
      <Section title="ข้อมูลการแข่งขัน">
        {text("name", "ชื่อรายการ")}
        {text("jpName", "ชื่อญี่ปุ่น")}
        <Field id="race-grade" label="เกรด">
          <select id="race-grade" className={inputClass} value={r.grade ?? ""} onChange={(e) => setRace({ grade: (e.target.value || null) as Grade | null })}>
            <option value="">ไม่มี</option>
            {GRADES.map((g) => <option key={g} value={g}>{GRADE_PILL[g].label}</option>)}
          </select>
        </Field>
        {text("date", "วันที่", "date")}
        {text("round", "เรซ (เช่น 12R)")}
        {text("course", "สนาม")}
        <Field id="race-surface" label="พื้นสนาม">
          <select id="race-surface" className={inputClass} value={r.surface} onChange={(e) => setRace({ surface: e.target.value as Race["surface"] })}>
            {SURFACES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field id="race-distance" label="ระยะ (เมตร)">
          <input id="race-distance" className={inputClass} type="number" min={100} step={100} value={r.distanceM ?? ""} onChange={(e) => setRace({ distanceM: e.target.value ? Math.round(+e.target.value) : null })} />
        </Field>
        {text("postTime", "Post time")}
        {text("timeZone", "เขตเวลา")}
      </Section>
      <Section title="รูปซ้ายบน">
        {d.photo ? <img src={d.photo} alt="รูปซ้ายบน" data-testid="photo-preview" className="max-h-28 w-auto justify-self-start border border-line" /> : <span className={hintClass}>ยังไม่มีรูป</span>}
        <div className="flex gap-1.5">
          <label className={buttonClass("primary")}>
            {d.photo ? "เปลี่ยนรูป…" : "เลือกรูป…"}
            <input type="file" accept="image/*" className="sr-only" data-testid="photo-file" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; pick(f); }} />
          </label>
          {d.photo && <Button onClick={() => update((x) => ({ ...x, photo: null }))}>เอารูปออก</Button>}
        </div>
        <span className={hintClass}>ย่อเหลือไม่เกิน 1600px ให้อัตโนมัติ แล้วเก็บไว้ในไฟล์ JSON ด้วย</span>
      </Section>
      <Section title="สีเบอร์ซอง (BK) และเบอร์ม้า (PP)">
        <Switch on={S.showDraw} label="แสดงช่อง BK (ซอง)" onToggle={() => setStyle({ showDraw: !S.showDraw })} />
        <Field id="draw-scheme" label="สีช่อง BK">
          <select id="draw-scheme" aria-label="สีช่อง BK" className={inputClass} value={S.drawScheme} onChange={(e) => setStyle({ drawScheme: e.target.value as Scheme })}>
            {Object.entries(SCHEME_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Switch on={S.autoDraw} label="คำนวณเลขซองให้อัตโนมัติตามกฎ JRA" onToggle={() => setStyle({ autoDraw: !S.autoDraw })} />
        <Field id="number-scheme" label="สีช่อง PP">
          <select id="number-scheme" aria-label="สีช่อง PP" className={inputClass} value={S.numberScheme} onChange={(e) => setStyle({ numberScheme: e.target.value as Scheme })}>
            {Object.entries(NO_SCHEME_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        {!S.autoDraw && <span className={hintClass}>ใส่เลขซองของแต่ละตัวในแท็บม้า</span>}
      </Section>
    </>
  );
}
