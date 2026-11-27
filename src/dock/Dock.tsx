/** The OBS Custom Browser Dock: ภาพรวม (scroll, files, JPG/PDF), การแข่งขัน, ผู้ทายผล, ม้า. */
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@otamasing/broadcast-shared/lib/cx";
import { OverviewTab } from "./OverviewTab";
import { RaceTab } from "./RaceTab";
import { PunditsTab } from "./PunditsTab";
import { HorsesTab } from "./HorsesTab";

export type Toast = (msg: string, bad?: boolean) => void;

const TABS = [["overview", "ภาพรวม"], ["race", "การแข่งขัน"], ["pundits", "ผู้ทายผล"], ["horses", "ม้า"]] as const;
type Tab = (typeof TABS)[number][0];

export function Dock() {
  const [tab, setTab] = useState<Tab>("overview");
  const [toastMsg, setToast] = useState<{ msg: string; bad: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const toast = useCallback<Toast>((msg, bad = false) => {
    setToast({ msg, bad });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), bad ? 6000 : 2500);
  }, []);
  useEffect(() => { document.body.classList.add("bg-panel"); document.title = "โอตะม้าซิ่ง Broadcast Predict · Dock"; }, []);
  return (
    <div className="grid min-h-screen grid-rows-[auto_auto_1fr] bg-panel">
      <div className="bg-navy px-3.5 py-2.5 font-display text-[15px] font-bold tracking-[.06em] uppercase">โอตะม้าซิ่ง Broadcast Predict</div>
      <div className="grid grid-cols-4 border-b border-line" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cx("relative px-1 py-2.5 text-sm font-medium", tab === k ? "text-ink" : "text-ink-muted")}>
            {label}
            {tab === k && <motion.span layoutId="dock-tab" className="absolute inset-x-0 -bottom-px h-[3px] bg-yellow" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        ))}
      </div>
      <div className="grid content-start gap-3 p-3">
        {tab === "overview" ? <OverviewTab toast={toast} /> : tab === "race" ? <RaceTab toast={toast} /> : tab === "pundits" ? <PunditsTab /> : <HorsesTab />}
      </div>
      <AnimatePresence>
        {toastMsg && (
          <motion.div key="toast" role={toastMsg.bad ? "alert" : "status"}
            className={cx("fixed inset-x-3 bottom-3 z-60 border px-3 py-2.5 text-[13px] shadow-[0_8px_24px_rgb(0_0_0/.5)]", toastMsg.bad ? "border-danger-ink bg-danger-bg" : "border-ok bg-ok-bg")}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.2 }}>
            {toastMsg.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
