"use client";

import { useRef } from "react";
import type { LifeOSData } from "@/types";
import { StatGrid }   from "@/components/ui/StatGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { uid, todayKey } from "@/lib/storage";

interface FitnessTabProps {
  data: LifeOSData;
  onAddItem:    (key: "workouts" | "weight", item: Record<string, unknown>) => void;
  onRemoveItem: (key: "workouts" | "weight", id: string) => void;
  onToast:      (msg: string) => void;
}

export function FitnessTab({ data, onAddItem, onRemoveItem, onToast }: FitnessTabProps) {
  const wRef  = useRef<HTMLInputElement>(null);
  const wdRef = useRef<HTMLInputElement>(null);
  const wtRef = useRef<HTMLInputElement>(null);

  const addWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const name   = wRef.current?.value.trim();
    const detail = wdRef.current?.value.trim();
    if (!name || !detail) { onToast("Please fill in all fields"); return; }
    onAddItem("workouts", { id: uid(), name, detail, date: todayKey() });
    if (wRef.current)  wRef.current.value  = "";
    if (wdRef.current) wdRef.current.value = "";
  };

  const addWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const name = wtRef.current?.value.trim();
    if (!name) { onToast("Please fill in all fields"); return; }
    onAddItem("weight", { id: uid(), name, date: todayKey() });
    if (wtRef.current) wtRef.current.value = "";
  };

  // todayHabits reserved for future habit-linked fitness display

  return (
    <>
      <StatGrid stats={[
        { label: "Workouts logged",  value: data.workouts.length,    note: "All-time entries" },
        { label: "Weight entries",   value: data.weight.length,       note: "Manual log" },
        { label: "Latest weight",    value: data.weight[0]?.name ?? "—", note: "Use your preferred unit" },
        { label: "Training focus",   value: "Strength",               note: "Customize in your log" },
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <section className="card">
          <h2>Workout log</h2>
          <form onSubmit={addWorkout} style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
            <input ref={wRef}  className="life-input" placeholder="Workout name / day"        aria-label="Workout name" required style={{ flex: 1, minWidth: 120 }} />
            <input ref={wdRef} className="life-input" placeholder="Exercises, sets, or notes" aria-label="Workout details" required style={{ flex: 1, minWidth: 120 }} />
            <button className="btn-action" type="submit">Add</button>
          </form>
          <div style={{ display: "grid", gap: 8 }}>
            {data.workouts.length > 0 ? data.workouts.map(w => (
              <div key={w.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: 11, border: "1px solid #382b40", borderRadius: 11, background: "#16101d" }}>
                <label style={{ flex: 1, overflowWrap: "anywhere" }}>
                  <b>{w.name}</b>
                  <div style={{ color: "#9c92a9", fontSize: 12 }}>{w.detail}</div>
                  <div style={{ color: "#9c92a9", fontSize: 12 }}>{w.date}</div>
                </label>
                <button onClick={() => onRemoveItem("workouts", w.id)} aria-label="Delete workout" style={{ background: "none", border: 0, color: "#a48caf", fontSize: 18 }}>×</button>
              </div>
            )) : <EmptyState message="No entries yet. Add your first one above." />}
          </div>
        </section>

        <section className="card">
          <h2>Body weight tracker</h2>
          <form onSubmit={addWeight} style={{ display: "flex", gap: 8, margin: "12px 0" }}>
            <input ref={wtRef} className="life-input" placeholder="Weight and unit, e.g. 185 lb" aria-label="Weight entry" required style={{ flex: 1 }} />
            <button className="btn-action" type="submit">Add</button>
          </form>
          <div style={{ display: "grid", gap: 8 }}>
            {data.weight.length > 0 ? data.weight.map(w => (
              <div key={w.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: 11, border: "1px solid #382b40", borderRadius: 11, background: "#16101d" }}>
                <label style={{ flex: 1 }}><b>{w.name}</b><div style={{ color: "#9c92a9", fontSize: 12 }}>{w.date}</div></label>
                <button onClick={() => onRemoveItem("weight", w.id)} aria-label="Delete entry" style={{ background: "none", border: 0, color: "#a48caf", fontSize: 18 }}>×</button>
              </div>
            )) : <EmptyState message="No entries yet. Add your first one above." />}
          </div>
        </section>
      </div>
    </>
  );
}
