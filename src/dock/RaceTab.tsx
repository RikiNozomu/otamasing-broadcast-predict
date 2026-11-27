/** การแข่งขัน: race facts, the top-left picture, and the BK / PP box colours (like compact and intro). */
import { Button, buttonClass } from "@otamasing/broadcast-shared/components/Button";
import { Section, hintClass } from "@otamasing/broadcast-shared/components/Section";
import { Switch } from "@otamasing/broadcast-shared/components/Switch";
import { useEffect, useRef, useState } from "react";
import { GRADES, PHOTO_H, PHOTO_W, photoTransform, PhotoPosSchema, SURFACES, type Grade, type PhotoPos, type Race, type Scheme, type Style } from "../lib/model";
import { getData, setData, update, useData } from "../lib/store";
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
      const ok = setData({ ...d, photo, photoPos: PhotoPosSchema.parse({}) });
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
        {d.photo ? <PhotoFrame photo={d.photo} pos={d.photoPos} /> : <span className={hintClass}>ยังไม่มีรูป</span>}
        <div className="flex gap-1.5">
          <label className={buttonClass("primary")}>
            {d.photo ? "เปลี่ยนรูป…" : "เลือกรูป…"}
            <input type="file" accept="image/*" className="sr-only" data-testid="photo-file" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; pick(f); }} />
          </label>
          {d.photo && <Button onClick={() => update((x) => ({ ...x, photo: null }))}>เอารูปออก</Button>}
        </div>
        {d.photo && <PhotoSliders pos={d.photoPos} />}
        <span className={hintClass}>ลากบนภาพเพื่อเลื่อน หมุนล้อเมาส์เพื่อซูม · ย่อเหลือไม่เกิน 1600px ให้อัตโนมัติ แล้วเก็บไว้ในไฟล์ JSON ด้วย พร้อมตำแหน่ง ซูม และมุมหมุน</span>
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

const setPos = (p: Partial<PhotoPos>) => update((x) => ({ ...x, photoPos: PhotoPosSchema.parse({ ...x.photoPos, ...p }) }));
const clampZoom = (z: number) => Math.round(Math.min(5, Math.max(0.2, z)) * 100) / 100;

/** The photo's frame as on the board (fade not drawn): drag to move, wheel to zoom. */
function PhotoFrame({ photo, pos }: { photo: string; pos: PhotoPos }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.3);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / PHOTO_W));
    ro.observe(el);
    // non-passive, so the dock page itself doesn't scroll
    const wheel = (e: WheelEvent) => { e.preventDefault(); setPos({ zoom: clampZoom(getData().photoPos.zoom * Math.exp(-e.deltaY / 500)) }); };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => { ro.disconnect(); el.removeEventListener("wheel", wheel); };
  }, []);
  return (
    <div ref={box} data-testid="photo-frame" className="relative w-full cursor-grab touch-none overflow-hidden border border-line bg-white active:cursor-grabbing" style={{ aspectRatio: `${PHOTO_W} / ${PHOTO_H}` }}
      onPointerDown={(e) => { const p = getData().photoPos; drag.current = { x: e.clientX, y: e.clientY, px: p.x, py: p.y }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { const g = drag.current; if (g) setPos({ x: Math.round(g.px + (e.clientX - g.x) / k), y: Math.round(g.py + (e.clientY - g.y) / k) }); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <div className="pointer-events-none absolute top-0 left-0 origin-top-left" style={{ width: PHOTO_W, height: PHOTO_H, transform: `scale(${k})` }}>
        <img src={photo} alt="รูปซ้ายบน" data-testid="photo-preview" draggable={false} className="size-full object-cover" style={{ transform: photoTransform(pos) }} />
      </div>
    </div>
  );
}

function PhotoSliders({ pos }: { pos: PhotoPos }) {
  const row = (label: string, key: keyof PhotoPos, min: number, max: number, step: number, show: string) => (
    <label className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-2 text-[13px]">
      <span>{label}</span>
      <input type="range" aria-label={label} min={min} max={max} step={step} value={pos[key]} onChange={(e) => setPos({ [key]: +e.target.value })} />
      <span className="text-right tabular-nums">{show}</span>
    </label>
  );
  return (
    <div className="grid gap-1">
      {row("แนวนอน", "x", -PHOTO_W, PHOTO_W, 1, `${pos.x}`)}
      {row("แนวตั้ง", "y", -PHOTO_H, PHOTO_H, 1, `${pos.y}`)}
      {row("ซูม", "zoom", 0.2, 5, 0.01, `${Math.round(pos.zoom * 100)}%`)}
      {row("หมุน", "rotate", -180, 180, 1, `${pos.rotate}°`)}
      <Button onClick={() => setPos(PhotoPosSchema.parse({}))}>รีเซ็ตตำแหน่งรูป</Button>
    </div>
  );
}
