/** Landing page (#/): what the two URLs are for, with a live preview. */
import { Section, hintClass } from "@otamasing/broadcast-shared/components/Section";
import { ScrolledBoard } from "./overlay/Overlay";

export function Landing() {
  const base = `${location.origin}${location.pathname}`;
  const links = [
    ["Dock", "OBS → Docks → Custom Browser Docks", "#/dock"],
    ["Browser Source (1920×1080)", "OBS → Sources → Browser", "#/overlay"],
  ] as const;
  return (
    <main className="mx-auto grid max-w-[1100px] gap-5 px-4 pt-8 pb-14">
      <header>
        <h1 className="m-0 mb-2 font-display text-[44px] leading-none font-extrabold uppercase">โอตะม้าซิ่ง Broadcast Predict</h1>
        <p className="m-0 max-w-[70ch] text-ink-muted">ตารางรายชื่อม้าแบบยาวพร้อมช่องทายผลของผู้ทัศนะ 1–4 คน เลื่อนขึ้นลงจาก dock ได้ (หัวตารางค้างไว้ด้านบน) ส่งออกเป็น JPG / PDF ได้ ข้อมูลเก็บในเบราว์เซอร์ของเครื่องนี้เท่านั้น ไฟล์ JSON หนึ่งไฟล์ = หนึ่งรายการ</p>
      </header>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {links.map(([title, where, hash]) => (
          <Section key={hash} title={title}>
            <span className={hintClass}>{where}</span>
            <a href={hash}><code className="text-[13px] break-all">{base}{hash}</code></a>
          </Section>
        ))}
      </div>
      <div className="relative aspect-video w-full overflow-hidden border border-line"><ScrolledBoard /></div>
      <p className={hintClass}>ข้อมูลใน OBS แยกจาก Chrome ปกติ ถ้าเตรียมข้อมูลใน Chrome ให้ส่งออก JSON แล้วนำเข้าใน dock ของ OBS (รูปซ้ายบนติดไปในไฟล์ JSON ด้วย) · ใน OBS ใช้ "คัดลอก JSON" แทนการบันทึกไฟล์ · รูปแบบไฟล์ดูได้ที่ <a href="https://github.com/RikiNozomu/otamasing-broadcast-predict/blob/main/docs/board-json.md">docs/board-json.md</a></p>
    </main>
  );
}
