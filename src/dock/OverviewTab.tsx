/** ภาพรวม: scroll the overlay, import / export the board's JSON (one race per file), save it as JPG or PDF. */
import { AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { Button, buttonClass } from "@otamasing/broadcast-shared/components/Button";
import { Section, hintClass } from "@otamasing/broadcast-shared/components/Section";
import { copyText, inObs, saveFile, saveJson } from "@otamasing/broadcast-shared/lib/download";
import { cx } from "@otamasing/broadcast-shared/lib/cx";
import { exportBoard, fileStem, parseBoard, type Board as BoardData } from "../lib/model";
import { setData, update, useData } from "../lib/store";
import { boardJpeg, dataUrlBlob, jpegPdf } from "../lib/exportImage";
import { Board, BOARD_W, boardHeight } from "../board/Board";
import { ScrolledBoard } from "../overlay/Overlay";
import { inputClass } from "./Field";
import type { Toast } from "./Dock";

export function OverviewTab({ toast }: { toast: Toast }) {
  const d = useData();
  const n = d.runners.length;
  const setScroll = (s: number) => update((x) => ({ ...x, scroll: Math.max(0, Math.min(n, s)) }));
  const at = d.scroll > 0 ? d.runners[d.scroll - 1] : null;
  return (
    <>
      <Section title="เลื่อนตาราง">
        <div className="relative aspect-video w-full overflow-hidden border border-line"><ScrolledBoard /></div>
        <span data-testid="scroll-at" className="text-[13px]">{at ? `แถวบนสุด: เบอร์ ${at.number} ${at.name}` : "บนสุด (เห็นชื่อรายการ)"}</span>
        <input type="range" aria-label="ตำแหน่งตาราง" min={0} max={n} step={1} value={Math.min(d.scroll, n)} onChange={(e) => setScroll(+e.target.value)} />
        <div className="grid grid-cols-4 gap-1.5">
          <Button onClick={() => setScroll(0)}>บนสุด</Button>
          <Button onClick={() => setScroll(d.scroll - 1)} disabled={d.scroll <= 0}>▲ ขึ้น</Button>
          <Button variant="primary" onClick={() => setScroll(d.scroll + 1)} disabled={d.scroll >= n}>▼ ลง</Button>
          <Button onClick={() => setScroll(n)}>ล่างสุด</Button>
        </div>
        <span className={hintClass}>หัวตารางค้างอยู่ด้านบนเมื่อเลื่อนลง ถ้าตารางสั้นกว่าจอจะเลื่อนได้แค่ถึงแถวสุดท้าย</span>
      </Section>
      <FileSection toast={toast} />
      <PictureSection toast={toast} />
    </>
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
