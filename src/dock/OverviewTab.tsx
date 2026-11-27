/** ภาพรวม: scroll the overlay, import / export the board's JSON (one race per file), save it as JPG or PDF. */
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button, buttonClass } from "@otamasing/broadcast-shared/components/Button";
import { Section, hintClass } from "@otamasing/broadcast-shared/components/Section";
import { copyText, inObs, saveFile, saveJson } from "@otamasing/broadcast-shared/lib/download";
import { cx } from "@otamasing/broadcast-shared/lib/cx";
import { exportBoard, fileStem, parseBoard, type Board as BoardData } from "../lib/model";
import { getData, setData, update, useData } from "../lib/store";
import { boardJpeg, dataUrlBlob, jpegPdf } from "../lib/exportImage";
import { Board, BOARD_W, boardHeight, ROW_H } from "../board/Board";
import { maxScroll, ScrolledBoard } from "../overlay/Overlay";
import { inputClass } from "./Field";
import type { Toast } from "./Dock";

export function OverviewTab({ toast }: { toast: Toast }) {
  return (
    <>
      <ScrollSection />
      <FileSection toast={toast} />
      <PictureSection toast={toast} />
    </>
  );
}

/** Free scrolling: slider, wheel or drag on the preview, and quick jumps. Positions are board px. */
function ScrollSection() {
  const d = useData();
  const max = maxScroll(d.runners.length);
  const setScroll = (s: number) => update((x) => ({ ...x, scroll: Math.round(Math.max(0, Math.min(max, s))) }));
  const preview = useRef<HTMLDivElement>(null);
  // preview px → board px
  const k = () => BOARD_W / (preview.current?.clientWidth || BOARD_W);
  const drag = useRef<{ y: number; s: number } | null>(null);
  useEffect(() => {
    const el = preview.current;
    if (!el) return;
    // a non-passive listener, so the dock page itself doesn't scroll
    const wheel = (e: WheelEvent) => { e.preventDefault(); setScroll(getData().scroll + e.deltaY * k()); };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  });
  const at = Math.min(d.scroll, max);
  return (
    <Section title="เลื่อนตาราง">
      <div ref={preview} data-testid="scroll-preview" className="relative aspect-video w-full cursor-grab touch-none overflow-hidden border border-line active:cursor-grabbing"
        onPointerDown={(e) => { drag.current = { y: e.clientY, s: getData().scroll }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (drag.current) setScroll(drag.current.s - (e.clientY - drag.current.y) * k()); }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
        <ScrolledBoard />
      </div>
      <input type="range" aria-label="ตำแหน่งตาราง" min={0} max={max} step={1} value={at} onChange={(e) => setScroll(+e.target.value)} />
      <div className="grid grid-cols-4 gap-1.5">
        <Button onClick={() => setScroll(0)}>บนสุด</Button>
        <Button onClick={() => setScroll(at - ROW_H)} disabled={at <= 0}>▲ ขึ้น</Button>
        <Button variant="primary" onClick={() => setScroll(at + ROW_H)} disabled={at >= max}>▼ ลง</Button>
        <Button onClick={() => setScroll(max)}>ล่างสุด</Button>
      </div>
      <span data-testid="scroll-at" className={hintClass}>{max ? `${Math.round((at / max) * 100)}%` : "ตารางสั้นพอดีจอ ไม่ต้องเลื่อน"} · ลากหรือหมุนล้อเมาส์บนภาพด้านบน หรือใช้แถบเลื่อน เลื่อนได้อิสระไม่ล็อกตามแถว (ปุ่มขึ้น/ลงเลื่อนทีละประมาณ 1 แถว) หัวตารางค้างด้านบนเสมอ</span>
    </Section>
  );
}

function FileSection({ toast }: { toast: Toast }) {
  const d = useData();
  const file = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState<string | null>(null);
  const [pending, setPending] = useState<BoardData | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const read = (text: string) => {
    const r = parseBoard(text);
    if (!r.ok) return toast(r.error, true);
    setPending(r.board);
    setPaste(null);
  };
  const apply = () => {
    if (!pending) return;
    const ok = setData({ ...pending, scroll: 0 });
    toast(ok ? `นำเข้า ${pending.race.round} ${pending.race.name} แล้ว` : "บันทึกในเบราว์เซอร์ไม่ได้ (รูปอาจใหญ่เกินไป) ข้อมูลจะหายเมื่อปิดหน้านี้", !ok);
    setPending(null);
  };
  const name = `${fileStem(d.race)}.json`;
  const text = JSON.stringify(exportBoard(d), null, 2);
  const save = async () => {
    const r = await saveJson(name, text);
    if (r === "failed") toast("บันทึกไฟล์ไม่สำเร็จ ให้กด \"คัดลอก JSON\" แทน", true);
    else if (r !== "cancelled") toast(r === "saved" ? "บันทึกไฟล์แล้ว" : `ดาวน์โหลด ${name} แล้ว`);
  };
  return (
    <Section title="ไฟล์ JSON (1 ไฟล์ = 1 รายการ)">
      <div className="flex flex-wrap gap-1.5">
        <label className={buttonClass("default")}>
          นำเข้าไฟล์…
          <input ref={file} type="file" accept=".json,application/json" className="sr-only" data-testid="import-file"
            onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) read(await f.text()); }} />
        </label>
        <Button onClick={() => setPaste(paste == null ? "" : null)}>วาง JSON</Button>
        <Button variant="primary" onClick={() => setOut(out ? null : text)}>ส่งออก JSON</Button>
      </div>
      {paste != null && (
        <div className="grid gap-1.5">
          <textarea aria-label="วาง JSON" rows={5} className={cx(inputClass, "font-mono text-[11px]")} value={paste} onChange={(e) => setPaste(e.target.value)} />
          <Button variant="primary" onClick={() => read(paste)} disabled={!paste.trim()}>ตรวจและนำเข้า</Button>
        </div>
      )}
      <AnimatePresence>
        {pending && (
          <div role="alertdialog" aria-label="ยืนยันการนำเข้า" className="grid gap-1.5 border border-yellow px-2.5 py-2 text-[13px]">
            <span>แทนที่ตารางปัจจุบันด้วย <b>{pending.race.round} {pending.race.name}</b> ({pending.runners.length} ตัว, ผู้ทายผล {pending.pundits.length} คน)?</span>
            <span className="flex gap-1.5">
              <Button variant="primary" onClick={apply}>แทนที่</Button>
              <Button onClick={() => setPending(null)}>ยกเลิก</Button>
            </span>
          </div>
        )}
      </AnimatePresence>
      {out != null && (
        <div data-testid="export-panel" className="grid gap-1.5 border border-yellow px-2.5 py-2 text-[13px]">
          <span className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="min-w-0 truncate">{name}</span>
            <span className="flex gap-1.5">
              {!inObs() && <Button variant="primary" onClick={save}>บันทึกไฟล์…</Button>}
              <Button onClick={async () => toast((await copyText(text)) ? "คัดลอกแล้ว" : "คัดลอกไม่ได้ ให้เลือกข้อความในกล่องแล้วกด Ctrl+C", false)}>คัดลอก JSON</Button>
              <Button onClick={() => setOut(null)}>ปิด</Button>
            </span>
          </span>
          <textarea readOnly aria-label="ข้อความ JSON" data-testid="export-text" rows={5} value={text} className={cx(inputClass, "font-mono text-[11px]")} onFocus={(e) => e.currentTarget.select()} />
          {inObs() && <span className={hintClass}>dock ใน OBS บันทึกไฟล์ไม่ได้ ใช้ "คัดลอก JSON" แทน</span>}
        </div>
      )}
      <span className={hintClass}>รูปซ้ายบนติดไปในไฟล์ JSON ด้วย จึงย้ายจาก Chrome เข้า OBS ได้ครบ</span>
    </Section>
  );
}

/** Saves the full-height board (not the scrolled view) as a JPG or a one-page PDF. */
function PictureSection({ toast }: { toast: Toast }) {
  const d = useData();
  const [busy, setBusy] = useState<"jpg" | "pdf" | null>(null);
  const node = useRef<HTMLDivElement>(null);
  const run = async (kind: "jpg" | "pdf") => {
    setBusy(kind);
    // let the off-screen board mount and lay out first
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      const el = node.current?.firstElementChild as HTMLElement | null;
      if (!el) throw new Error("no board");
      const jpeg = await boardJpeg(el);
      const stem = fileStem(d.race);
      const w = BOARD_W, h = el.offsetHeight || boardHeight(d.runners.length);
      const r = kind === "jpg"
        ? await saveFile(`${stem}.jpg`, await dataUrlBlob(jpeg), { description: "JPEG", mime: "image/jpeg", ext: ".jpg" })
        : await saveFile(`${stem}.pdf`, await jpegPdf(jpeg, w, h), { description: "PDF", mime: "application/pdf", ext: ".pdf" });
      if (r === "failed") toast("บันทึกไฟล์ไม่สำเร็จ (dock ใน OBS บันทึกไฟล์ไม่ได้ ให้ทำใน Chrome)", true);
      else if (r !== "cancelled") toast(`บันทึก ${stem}.${kind} แล้ว`);
    } catch {
      toast("สร้างรูปไม่สำเร็จ", true);
    } finally {
      setBusy(null);
    }
  };
  return (
    <Section title="ส่งออกเป็นรูป">
      <div className="flex flex-wrap gap-1.5">
        <Button onClick={() => run("jpg")} disabled={!!busy}>{busy === "jpg" ? "กำลังสร้าง…" : "บันทึก JPG"}</Button>
        <Button onClick={() => run("pdf")} disabled={!!busy}>{busy === "pdf" ? "กำลังสร้าง…" : "บันทึก PDF"}</Button>
      </div>
      <span className={hintClass}>ได้ตารางเต็มความยาวทุกแถว (ไม่ขึ้นกับตำแหน่งที่เลื่อนไว้) {inObs() ? "· dock ใน OBS บันทึกไฟล์ไม่ได้ ให้เปิด dock ใน Chrome แทน" : ""}</span>
      {busy && <div ref={node} aria-hidden="true" className="pointer-events-none fixed top-0 left-[-20000px]"><Board b={d} /></div>}
    </Section>
  );
}
