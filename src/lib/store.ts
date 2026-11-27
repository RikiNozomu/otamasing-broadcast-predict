/**
 * The board lives in localStorage (one key), shared by the dock and the overlay: OBS docks and browser sources
 * share one browser profile. Changes reach other pages through the storage event, a BroadcastChannel and a 1 s poll.
 */
import { useSyncExternalStore } from "react";
import { BoardSchema, type AppData } from "./model";
import { sampleData } from "./sample";

// own key: this site shares the rikinozomu.github.io origin (and its storage) with the other broadcast sites
export const STORAGE_KEY = "otamasing-broadcast-predict/v1";
const CHANNEL = "otamasing-broadcast-predict";

let raw: string | null | undefined;
let cache: AppData | undefined;
const listeners = new Set<() => void>();

function safeGet(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
/** False when the browser refused (private mode or quota: the picture may be too big). */
function safeSet(v: string): boolean {
  try { localStorage.setItem(STORAGE_KEY, v); return true; } catch { return false; }
}

/** Read storage, seeding the sample on first open (or when the stored value is unusable). */
export function getData(): AppData {
  const r = safeGet();
  if (cache && r === raw) return cache;
  let d: AppData | null = null;
  try {
    const j = r ? JSON.parse(r) : null;
    const res = BoardSchema.safeParse(j);
    if (res.success) d = { ...res.data, scroll: typeof j.scroll === "number" ? j.scroll : 0 };
  } catch { d = null; }
  if (!d) {
    d = sampleData();
    raw = JSON.stringify(d);
    safeSet(raw);
  } else raw = r;
  cache = d;
  return cache;
}

let channel: BroadcastChannel | null = null;
const notify = () => listeners.forEach((l) => l());
const check = () => { if (safeGet() !== raw) notify(); };

let started = false;
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  addEventListener("storage", (e) => { if (e.key === STORAGE_KEY) check(); });
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = () => check();
  } catch { channel = null; }
  setInterval(check, 1000);
}

/** Saves; false when storage refused it (the change still shows in this page). */
export function setData(next: AppData): boolean {
  raw = JSON.stringify(next);
  cache = next;
  const ok = safeSet(raw);
  channel?.postMessage("changed");
  notify();
  return ok;
}

export const update = (fn: (d: AppData) => AppData) => setData(fn(getData()));

export function subscribe(l: () => void) {
  start();
  listeners.add(l);
  return () => listeners.delete(l);
}

export const useData = () => useSyncExternalStore(subscribe, getData, getData);
