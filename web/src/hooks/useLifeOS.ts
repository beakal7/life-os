"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useLifeOS — central state hook
//
// Every component that reads or mutates Life OS data goes through this hook.
// Phase 2: replace `loadData` / `saveData` calls with Supabase queries here
// and every component automatically gets cloud data without changes.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";
import type { LifeOSData, QuickLink } from "@/types";
import {
  loadData,
  saveData,
  todayKey,
  uid,
  parseBackup,
  exportBackup,
} from "@/lib/storage";

export function useLifeOS() {
  const [data, setData] = useState<LifeOSData>(() => loadData());

  // Persist every time data changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // ── Generic mutators ─────────────────────────────────────────────────────

  const update = useCallback((updater: (prev: LifeOSData) => LifeOSData) => {
    setData((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  // ── Tasks ────────────────────────────────────────────────────────────────

  const addTask = useCallback(
    (name: string) => {
      update((d) => ({
        ...d,
        tasks: [
          { id: uid(), name, done: false, date: todayKey() },
          ...d.tasks,
        ],
      }));
    },
    [update]
  );

  const toggleTask = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === id ? { ...t, done: !t.done } : t
        ),
      }));
    },
    [update]
  );

  const removeTask = useCallback(
    (id: string) => {
      update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
    },
    [update]
  );

  // ── Habits ───────────────────────────────────────────────────────────────

  const toggleHabit = useCallback(
    (id: string) => {
      const today = todayKey();
      update((d) => ({
        ...d,
        habits: d.habits.map((h) =>
          h.id === id
            ? {
                ...h,
                history: {
                  ...h.history,
                  [today]: !h.history[today],
                },
              }
            : h
        ),
      }));
    },
    [update]
  );

  const addHabit = useCallback(
    (name: string) => {
      update((d) => ({
        ...d,
        habits: [...d.habits, { id: uid(), name, history: {} }],
      }));
    },
    [update]
  );

  const removeHabit = useCallback(
    (id: string) => {
      update((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) }));
    },
    [update]
  );

  // ── Generic add/remove for list-based entities ────────────────────────────

  type ListKey = keyof Pick<
    LifeOSData,
    | "workouts"
    | "weight"
    | "prayers"
    | "readings"
    | "skills"
    | "goals"
    | "budget"
    | "stocks"
    | "journal"
  >;

  const addItem = useCallback(
    (key: ListKey, item: Record<string, unknown>) => {
      update((d) => ({
        ...d,
        [key]: [
          { id: uid(), date: todayKey(), ...item },
          ...(d[key] as { id: string }[]),
        ],
      }));
    },
    [update]
  );

  const removeItem = useCallback(
    (key: ListKey, id: string) => {
      update((d) => ({
        ...d,
        [key]: (d[key] as { id: string }[]).filter((x) => x.id !== id),
      }));
    },
    [update]
  );

  // ── Stocks ───────────────────────────────────────────────────────────────

  const updateStockPrice = useCallback(
    (id: string, price: number) => {
      update((d) => ({
        ...d,
        stocks: d.stocks.map((s) => (s.id === id ? { ...s, price } : s)),
      }));
    },
    [update]
  );

  // ── Focus timer logging ───────────────────────────────────────────────────

  const logFocusMinutes = useCallback(
    (minutes: number) => {
      update((d) => ({ ...d, focusMinutes: d.focusMinutes + minutes }));
    },
    [update]
  );

  // ── Priorities ───────────────────────────────────────────────────────────

  const setPriority = useCallback(
    (key: "top3" | "week3", index: 0 | 1 | 2, value: string) => {
      update((d) => {
        const arr: [string, string, string] = [...(d[key] ?? ["", "", ""])] as [
          string,
          string,
          string
        ];
        arr[index] = value;
        return { ...d, [key]: arr };
      });
    },
    [update]
  );

  // ── Vision ───────────────────────────────────────────────────────────────

  const setVision = useCallback(
    (vision: string) => {
      update((d) => ({ ...d, vision }));
    },
    [update]
  );

  // ── Quick links ───────────────────────────────────────────────────────────

  const addLink = useCallback(
    (link: QuickLink) => {
      update((d) => ({ ...d, links: [...(d.links ?? []), link] }));
    },
    [update]
  );

  const removeLink = useCallback(
    (index: number) => {
      update((d) => ({
        ...d,
        links: (d.links ?? []).filter((_, i) => i !== index),
      }));
    },
    [update]
  );

  // ── Backup / restore ──────────────────────────────────────────────────────

  const doExport = useCallback(() => {
    exportBackup(data);
  }, [data]);

  const doImport = useCallback(
    (raw: string) => {
      const fresh = parseBackup(raw);
      setData(fresh);
      saveData(fresh);
    },
    []
  );

  // ── Computed helpers ──────────────────────────────────────────────────────

  const today = todayKey();
  const habitsDoneToday = data.habits.filter((h) => h.history[today]).length;
  const tasksDoneToday = data.tasks.filter((t) => t.done).length;

  return {
    data,
    // tasks
    addTask, toggleTask, removeTask,
    // habits
    addHabit, toggleHabit, removeHabit,
    // generic lists — item is plain object; key narrows the list
    addItem, removeItem,
    // stocks
    updateStockPrice,
    // focus
    logFocusMinutes,
    // priorities
    setPriority,
    // vision
    setVision,
    // links
    addLink, removeLink,
    // backup
    doExport, doImport,
    // computed
    habitsDoneToday,
    tasksDoneToday,
  };
}
