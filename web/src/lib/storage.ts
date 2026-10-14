// ─────────────────────────────────────────────────────────────────────────────
// Life OS — Data layer
//
// This module is the ONLY place that touches localStorage.
// Phase 2: swap `loadData` / `saveData` for Supabase calls without touching
// any component. All other modules import from here, never from localStorage
// directly.
//
// API boundary for Kiro Crew agents:
//   GET  /api/data        → returns LifeOSData as JSON (Phase 2)
//   POST /api/data        → replaces LifeOSData (Phase 2)
// ─────────────────────────────────────────────────────────────────────────────

import type { LifeOSData, QuickLink } from "@/types";

const STORAGE_KEY = "lifeos-v1";

// ── Default quick-links (matches the original index.html defaults) ─────────────
const DEFAULT_LINKS: QuickLink[] = [
  { name: "ChatGPT",          url: "https://chatgpt.com" },
  { name: "Google Calendar",  url: "https://calendar.google.com" },
  { name: "GitHub",           url: "https://github.com" },
  { name: "Supabase",         url: "https://supabase.com/dashboard" },
];

// ── Factory defaults ───────────────────────────────────────────────────────────
export function getDefaults(): LifeOSData {
  return {
    tasks: [],
    habits: [
      { id: "h1", name: "Bible reading",              history: {} },
      { id: "h2", name: "Workout or active recovery", history: {} },
      { id: "h3", name: "Deep work / study",          history: {} },
      { id: "h4", name: "Morning routine",            history: {} },
    ],
    workouts:     [],
    weight:       [],
    prayers:      [],
    readings:     [],
    skills:       [],
    goals:        [],
    budget:       [],
    stocks:       [],
    journal:      [],
    focusMinutes: 0,
    links:        DEFAULT_LINKS,
    top3:         ["", "", ""],
    week3:        ["", "", ""],
  };
}

// ── Read / write ───────────────────────────────────────────────────────────────

/** Load data from localStorage, merging with defaults for any missing keys. */
export function loadData(): LifeOSData {
  if (typeof window === "undefined") return getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaults();
    const parsed = JSON.parse(raw) as Partial<LifeOSData>;
    return { ...getDefaults(), ...parsed };
  } catch {
    return getDefaults();
  }
}

/** Persist data to localStorage. */
export function saveData(data: LifeOSData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Backup / restore (export / import) ────────────────────────────────────────

export interface BackupEnvelope {
  exportedAt: string;       // ISO timestamp
  appVersion: string;       // "life-os-web@0.1.0"
  data: LifeOSData;
}

/** Serialise current data to a JSON backup blob and trigger browser download. */
export function exportBackup(data: LifeOSData): void {
  const envelope: BackupEnvelope = {
    exportedAt: new Date().toISOString(),
    appVersion: "life-os-web@0.1.0",
    data,
  };
  const blob = new Blob([JSON.stringify(envelope, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toLocaleDateString("en-CA");
  a.href = url;
  a.download = `life-os-backup-${today}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse an uploaded backup file.
 * Accepts both the new envelope format and the legacy `{exportedAt, data}` shape
 * from the original index.html, so existing backups keep working.
 */
export function parseBackup(raw: string): LifeOSData {
  const parsed = JSON.parse(raw) as Partial<BackupEnvelope & LifeOSData>;

  // New envelope format
  if (parsed.data && Array.isArray(parsed.data.tasks)) {
    return { ...getDefaults(), ...parsed.data };
  }

  // Legacy / raw format (the object IS the data)
  if (Array.isArray((parsed as unknown as LifeOSData).tasks)) {
    return { ...getDefaults(), ...(parsed as unknown as Partial<LifeOSData>) };
  }

  throw new Error("Unrecognised backup format");
}

// ── Utility helpers ────────────────────────────────────────────────────────────

/** Today's key in YYYY-MM-DD format. */
export function todayKey(): string {
  return new Date().toLocaleDateString("en-CA");
}

/** Short random UID (matches original). */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Format a number as USD currency. */
export function money(n: number | string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}

/** Safe integer percentage. */
export function percent(a: number, b: number): number {
  return b ? Math.round((100 * a) / b) : 0;
}

/** Format MM:SS from total seconds. */
export function formatTimer(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/** Escape HTML entities. */
export function h(s: string | number | undefined | null): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (x) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[x] ?? x)
  );
}
