"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Life OS — Supabase data layer
//
// Maps the in-memory LifeOSData shape to the 14 Supabase tables. Every table
// has user_id defaulting to auth.uid() and per-user RLS, so the client never
// sends user_id explicitly.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabase } from "@/lib/supabase/client";
import { getDefaults } from "@/lib/storage";
import type { LifeOSData, Habit, QuickLink } from "@/types";

export type ListKey =
  | "workouts" | "weight" | "prayers" | "readings" | "skills"
  | "goals" | "budget" | "stocks" | "journal";

export const LIST_TABLES: Record<ListKey, string> = {
  workouts: "workouts",
  weight: "weight_entries",
  prayers: "prayers",
  readings: "readings",
  skills: "skills",
  goals: "goals",
  budget: "budget_entries",
  stocks: "stocks",
  journal: "journal_entries",
};

// App field name → DB column name (only where they differ)
const RENAMES: Partial<Record<ListKey, Record<string, string>>> = {
  weight: { name: "value" },
  journal: { name: "body" },
};

const COLUMNS: Record<ListKey, string[]> = {
  workouts: ["id", "name", "detail", "date"],
  weight: ["id", "name", "date"],
  prayers: ["id", "name", "date"],
  readings: ["id", "name", "detail", "date"],
  skills: ["id", "name", "detail", "date"],
  goals: ["id", "name", "category", "detail", "date"],
  budget: ["id", "name", "amount", "date"],
  stocks: ["id", "ticker", "shares", "cost", "price", "date"],
  journal: ["id", "name", "date"],
};

export function toRow(key: ListKey, item: Record<string, unknown>): Record<string, unknown> {
  const ren = RENAMES[key] ?? {};
  const row: Record<string, unknown> = {};
  for (const col of COLUMNS[key]) {
    if (item[col] !== undefined) row[ren[col] ?? col] = item[col];
  }
  return row;
}

function fromRow(key: ListKey, row: Record<string, unknown>): Record<string, unknown> {
  const ren = RENAMES[key] ?? {};
  const out: Record<string, unknown> = {};
  for (const col of COLUMNS[key]) {
    const v = row[ren[col] ?? col];
    out[col] = ["amount", "shares", "cost", "price"].includes(col) ? Number(v) : v ?? (col === "detail" ? "" : v);
  }
  return out;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** Load the whole data set for the signed-in user. */
export async function loadAll(): Promise<LifeOSData> {
  const sb = getSupabase();
  const d = getDefaults();
  const order = { ascending: false } as const;

  const [tasks, habits, logs, links, profile, ...lists] = await Promise.all([
    sb.from("tasks").select("*").order("created_at", order),
    sb.from("habits").select("*").order("created_at", { ascending: true }),
    sb.from("habit_logs").select("habit_id,date,done"),
    sb.from("quick_links").select("*").order("position", { ascending: true }),
    sb.from("profiles").select("*").maybeSingle(),
    ...(Object.keys(LIST_TABLES) as ListKey[]).map((k) =>
      sb.from(LIST_TABLES[k]).select("*").order("created_at", order)
    ),
  ]);

  const logRows = check(logs) as { habit_id: string; date: string; done: boolean }[];
  const habitList: Habit[] = (check(habits) as { id: string; name: string }[]).map((h) => ({
    id: h.id,
    name: h.name,
    history: Object.fromEntries(logRows.filter((l) => l.habit_id === h.id && l.done).map((l) => [l.date, true])),
  }));

  const out: LifeOSData = {
    ...d,
    tasks: (check(tasks) as Record<string, unknown>[]).map((t) => ({
      id: t.id as string, name: t.name as string, done: !!t.done, date: t.date as string,
      detail: (t.detail as string) ?? undefined,
    })),
    habits: habitList,
    links: (check(links) as { id: string; name: string; url: string }[]).map((l) => ({ id: l.id, name: l.name, url: l.url })),
  };

  (Object.keys(LIST_TABLES) as ListKey[]).forEach((k, i) => {
    const rows = check(lists[i]) as Record<string, unknown>[];
    (out as unknown as Record<string, unknown>)[k] = rows.map((r) => fromRow(k, r));
  });

  const p = check(profile) as null | { vision: string | null; top3: string[]; week3: string[]; focus_minutes: number };
  if (p) {
    out.vision = p.vision ?? undefined;
    out.top3 = (p.top3?.length === 3 ? p.top3 : ["", "", ""]) as [string, string, string];
    out.week3 = (p.week3?.length === 3 ? p.week3 : ["", "", ""]) as [string, string, string];
    out.focusMinutes = p.focus_minutes ?? 0;
  }
  return out;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function insertRow(table: string, row: Record<string, unknown>) {
  check(await getSupabase().from(table).insert(row));
}
export async function updateRow(table: string, id: string, patch: Record<string, unknown>) {
  check(await getSupabase().from(table).update(patch).eq("id", id));
}
export async function deleteRow(table: string, id: string) {
  check(await getSupabase().from(table).delete().eq("id", id));
}

export async function setHabitLog(habitId: string, date: string, done: boolean) {
  const sb = getSupabase();
  if (done) {
    check(await sb.from("habit_logs").upsert({ habit_id: habitId, date, done: true }, { onConflict: "habit_id,date" }));
  } else {
    check(await sb.from("habit_logs").delete().eq("habit_id", habitId).eq("date", date));
  }
}

export async function updateProfile(patch: Record<string, unknown>) {
  const sb = getSupabase();
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  check(await sb.from("profiles").upsert({ user_id: data.user.id, ...patch, updated_at: new Date().toISOString() }));
}

// ── One-time import (localStorage lifeos-v1 or JSON backup) ───────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const newId = (id?: string) => (id && UUID_RE.test(id) ? id : crypto.randomUUID());

/**
 * Append imported data to the user's cloud data. Legacy (non-uuid) ids are
 * replaced with fresh uuids. Habits whose name already exists are merged.
 */
export async function importData(src: LifeOSData, current: LifeOSData): Promise<void> {
  const sb = getSupabase();
  const ins = async (table: string, rows: Record<string, unknown>[]) => {
    if (rows.length) check(await sb.from(table).upsert(rows, { onConflict: "id", ignoreDuplicates: true }));
  };

  await ins("tasks", (src.tasks ?? []).map((t) => ({
    id: newId(t.id), name: t.name, done: !!t.done, date: t.date || undefined, detail: t.detail ?? null,
  })));

  // Habits: reuse an existing habit with the same name
  const byName = new Map(current.habits.map((h) => [h.name.trim().toLowerCase(), h.id]));
  const habitRows: Record<string, unknown>[] = [];
  const logRows: Record<string, unknown>[] = [];
  for (const h of src.habits ?? []) {
    let id = byName.get(h.name.trim().toLowerCase());
    if (!id) {
      id = newId(h.id);
      byName.set(h.name.trim().toLowerCase(), id);
      habitRows.push({ id, name: h.name });
    }
    for (const [date, done] of Object.entries(h.history ?? {})) {
      if (done) logRows.push({ habit_id: id, date, done: true });
    }
  }
  await ins("habits", habitRows);
  if (logRows.length) {
    check(await sb.from("habit_logs").upsert(logRows, { onConflict: "habit_id,date", ignoreDuplicates: true }));
  }

  for (const k of Object.keys(LIST_TABLES) as ListKey[]) {
    const items = ((src as unknown as Record<string, unknown[]>)[k] ?? []) as Record<string, unknown>[];
    await ins(LIST_TABLES[k], items.map((it) => {
      const row = toRow(k, { ...it, id: newId(it.id as string) });
      if (!row.date) delete row.date;
      return row;
    }));
  }

  const existingUrls = new Set((current.links ?? []).map((l) => l.url));
  const start = current.links?.length ?? 0;
  await ins("quick_links", (src.links ?? [])
    .filter((l: QuickLink) => !existingUrls.has(l.url))
    .map((l, i) => ({ id: crypto.randomUUID(), name: l.name, url: l.url, position: start + i })));

  const patch: Record<string, unknown> = {};
  if (src.vision) patch.vision = src.vision;
  if (src.top3?.some(Boolean)) patch.top3 = src.top3;
  if (src.week3?.some(Boolean)) patch.week3 = src.week3;
  if (src.focusMinutes) patch.focus_minutes = (current.focusMinutes ?? 0) + src.focusMinutes;
  if (Object.keys(patch).length) await updateProfile(patch);
}
