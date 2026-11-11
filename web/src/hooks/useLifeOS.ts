"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useLifeOS — central state hook (Supabase-backed)
//
// Every mutation updates local state immediately (optimistic) and then writes
// to Supabase. If a write fails, the error is reported and data is reloaded
// from the server so the UI never drifts from the database.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from "react";
import type { LifeOSData, QuickLink } from "@/types";
import { getDefaults, todayKey, uid, parseBackup, exportBackup } from "@/lib/storage";
import {
  loadAll, insertRow, updateRow, deleteRow, setHabitLog, updateProfile,
  importData, toRow, LIST_TABLES, type ListKey,
} from "@/lib/db";

export function useLifeOS(onError?: (msg: string) => void) {
  const [data, setData] = useState<LifeOSData>(getDefaults);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef(data);
  dataRef.current = data;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const reload = useCallback(async () => {
    try {
      setData(await loadAll());
    } catch (e) {
      onErrorRef.current?.(`Load failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  /** Apply an optimistic local update, then persist; reload on failure. */
  const mutate = useCallback(
    (updater: (prev: LifeOSData) => LifeOSData, persist: () => Promise<unknown>) => {
      setData(updater);
      persist().catch((e: Error) => {
        onErrorRef.current?.(`Save failed: ${e.message}`);
        void reload();
      });
    },
    [reload]
  );

  // ── Tasks ────────────────────────────────────────────────────────────────

  const addTask = useCallback((name: string) => {
    const task = { id: uid(), name, done: false, date: todayKey() };
    mutate((d) => ({ ...d, tasks: [task, ...d.tasks] }), () => insertRow("tasks", task));
  }, [mutate]);

  const toggleTask = useCallback((id: string) => {
    const t = dataRef.current.tasks.find((x) => x.id === id);
    if (!t) return;
    const done = !t.done;
    mutate(
      (d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === id ? { ...x, done } : x)) }),
      () => updateRow("tasks", id, { done })
    );
  }, [mutate]);

  const removeTask = useCallback((id: string) => {
    mutate((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }), () => deleteRow("tasks", id));
  }, [mutate]);

  // ── Habits ───────────────────────────────────────────────────────────────

  const toggleHabit = useCallback((id: string) => {
    const today = todayKey();
    const h = dataRef.current.habits.find((x) => x.id === id);
    if (!h) return;
    const done = !h.history[today];
    mutate(
      (d) => ({
        ...d,
        habits: d.habits.map((x) => {
          if (x.id !== id) return x;
          const history = { ...x.history };
          if (done) history[today] = true; else delete history[today];
          return { ...x, history };
        }),
      }),
      () => setHabitLog(id, today, done)
    );
  }, [mutate]);

  const addHabit = useCallback((name: string) => {
    const id = uid();
    mutate((d) => ({ ...d, habits: [...d.habits, { id, name, history: {} }] }), () => insertRow("habits", { id, name }));
  }, [mutate]);

  const removeHabit = useCallback((id: string) => {
    mutate((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) }), () => deleteRow("habits", id));
  }, [mutate]);

  // ── Generic list entities ─────────────────────────────────────────────────

  const addItem = useCallback((key: ListKey, item: Record<string, unknown>) => {
    const full = { date: todayKey(), ...item, id: (item.id as string) || uid() };
    mutate(
      (d) => ({ ...d, [key]: [full, ...(d[key] as unknown[])] }),
      () => insertRow(LIST_TABLES[key], toRow(key, full))
    );
  }, [mutate]);

  const removeItem = useCallback((key: ListKey, id: string) => {
    mutate(
      (d) => ({ ...d, [key]: (d[key] as { id: string }[]).filter((x) => x.id !== id) }),
      () => deleteRow(LIST_TABLES[key], id)
    );
  }, [mutate]);

  // ── Stocks ───────────────────────────────────────────────────────────────

  const updateStockPrice = useCallback((id: string, price: number) => {
    mutate(
      (d) => ({ ...d, stocks: d.stocks.map((s) => (s.id === id ? { ...s, price } : s)) }),
      () => updateRow("stocks", id, { price })
    );
  }, [mutate]);

  // ── Profile fields ────────────────────────────────────────────────────────

  const logFocusMinutes = useCallback((minutes: number) => {
    const total = dataRef.current.focusMinutes + minutes;
    mutate((d) => ({ ...d, focusMinutes: total }), () => updateProfile({ focus_minutes: total }));
  }, [mutate]);

  const setPriority = useCallback((key: "top3" | "week3", index: 0 | 1 | 2, value: string) => {
    const arr = [...(dataRef.current[key] ?? ["", "", ""])] as [string, string, string];
    arr[index] = value;
    mutate((d) => ({ ...d, [key]: arr }), () => updateProfile({ [key]: arr }));
  }, [mutate]);

  const setVision = useCallback((vision: string) => {
    mutate((d) => ({ ...d, vision }), () => updateProfile({ vision }));
  }, [mutate]);

  // ── Quick links ───────────────────────────────────────────────────────────

  const addLink = useCallback((link: QuickLink) => {
    const id = uid();
    const position = dataRef.current.links?.length ?? 0;
    mutate(
      (d) => ({ ...d, links: [...(d.links ?? []), { ...link, id }] }),
      () => insertRow("quick_links", { id, name: link.name, url: link.url, position })
    );
  }, [mutate]);

  const removeLink = useCallback((index: number) => {
    const link = dataRef.current.links?.[index];
    if (!link?.id) return;
    mutate(
      (d) => ({ ...d, links: (d.links ?? []).filter((_, i) => i !== index) }),
      () => deleteRow("quick_links", link.id!)
    );
  }, [mutate]);

  // ── Backup / import ───────────────────────────────────────────────────────

  const doExport = useCallback(() => exportBackup(dataRef.current), []);

  /** Import a JSON backup string or a LifeOSData object into the cloud. */
  const doImport = useCallback(async (src: string | LifeOSData) => {
    const parsed = typeof src === "string" ? parseBackup(src) : src;
    setLoading(true);
    try {
      await importData(parsed, dataRef.current);
    } finally {
      await reload();
    }
  }, [reload]);

  // ── Computed helpers ──────────────────────────────────────────────────────

  const today = todayKey();
  const habitsDoneToday = data.habits.filter((h) => h.history[today]).length;
  const tasksDoneToday = data.tasks.filter((t) => t.done).length;

  return {
    data, loading, reload,
    addTask, toggleTask, removeTask,
    addHabit, toggleHabit, removeHabit,
    addItem, removeItem,
    updateStockPrice,
    logFocusMinutes,
    setPriority,
    setVision,
    addLink, removeLink,
    doExport, doImport,
    habitsDoneToday,
    tasksDoneToday,
  };
}
