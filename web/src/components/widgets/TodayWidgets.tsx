"use client";

import { useRef } from "react";
import type { JournalEntry } from "@/types";
import { money, percent } from "@/lib/storage";

// ── CEO Radar ─────────────────────────────────────────────────────────────────
interface CEORadarProps {
  tasksDone: number;
  tasksTotal: number;
  habitsDone: number;
  habitsTotal: number;
  focusMinutes: number;
}
export function CEORadar({ tasksDone, tasksTotal, habitsDone, habitsTotal, focusMinutes }: CEORadarProps) {
  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>CEO Radar</h2><p style={{ fontSize: 12 }}>Today&apos;s calendar overview</p></div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>
      {[
        { icon: "✓", label: `${tasksDone} / ${tasksTotal} tasks completed` },
        { icon: "♨", label: `${habitsDone} / ${habitsTotal} habits completed` },
        { icon: "◷", label: `${focusMinutes} minutes of focused work` },
      ].map((row) => (
        <div key={row.label} style={{ borderBottom: "1px solid #302539", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 9 }}>
          <span>{row.icon}</span>
          <b style={{ fontSize: 12, flex: 1 }}>{row.label}</b>
        </div>
      ))}
      <p style={{ fontSize: 12, color: "#9c92a9", marginTop: "auto" }}>Calendar sync comes after cloud setup.</p>
    </section>
  );
}

// ── Daily Briefing ─────────────────────────────────────────────────────────────
interface DailyBriefingProps {
  tasksDone: number;
  tasksTotal: number;
  habitsDone: number;
  habitsTotal: number;
  portfolioValue: number;
  workoutCount: number;
  onNavigate: () => void;
}
export function DailyBriefing({ tasksDone, tasksTotal, habitsDone, habitsTotal, portfolioValue, workoutCount, onNavigate }: DailyBriefingProps) {
  const done = tasksDone + habitsDone;
  const total = tasksTotal + habitsTotal;
  const pct = percent(done, total);
  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Daily Briefing</h2><p style={{ fontSize: 12 }}>Your progress, at a glance</p></div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>
      <div style={{ fontSize: 35, fontWeight: 800, color: "#d6bdff" }}>
        {pct}%&nbsp;<small style={{ fontSize: 12, color: "#a999b7", fontWeight: 400 }}>daily execution</small>
      </div>
      <div className="meter"><div className="meter-fill" style={{ width: `${pct}%` }} /></div>
      {[
        { label: "Portfolio (manual)", value: money(portfolioValue) },
        { label: "Workout logs",       value: workoutCount },
      ].map((row) => (
        <div key={row.label} style={{ borderBottom: "1px solid #302539", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 9 }}>
          <span style={{ fontSize: 12, color: "#9c92a9" }}>{row.label}</span>
          <b style={{ fontSize: 12 }}>{row.value}</b>
        </div>
      ))}
      <button className="btn-subtle" style={{ marginTop: "auto" }} onClick={onNavigate}>Open financial overview →</button>
    </section>
  );
}

// ── Reflection ─────────────────────────────────────────────────────────────────
interface ReflectionProps {
  journal: JournalEntry[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}
export function Reflection({ journal, onAdd, onRemove }: ReflectionProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = ref.current?.value.trim();
    if (!val) return;
    onAdd(val);
    if (ref.current) ref.current.value = "";
  };
  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Reflection</h2><p style={{ fontSize: 12 }}>Close your day with intention</p></div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea ref={ref} className="life-input" rows={3} placeholder="What went well today?" required aria-label="Daily reflection" />
        <button className="btn-action" type="submit">Save reflection</button>
      </form>
      {journal.slice(0, 2).map((e) => (
        <div key={e.id} style={{ borderBottom: "1px solid #302539", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 9 }}>
          <span style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
          <button className="btn-ghost" onClick={() => onRemove(e.id)} style={{ padding: "4px 10px", fontSize: 12 }}>×</button>
        </div>
      ))}
    </section>
  );
}

// ── Goals Preview ──────────────────────────────────────────────────────────────
import type { Goal } from "@/types";
interface GoalsPreviewProps {
  goals: Goal[];
  onNavigate: () => void;
}
export function GoalsPreview({ goals, onNavigate }: GoalsPreviewProps) {
  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>My Goals</h2><p style={{ fontSize: 12 }}>Your bigger picture</p></div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>
      {goals.slice(0, 3).length > 0 ? goals.slice(0, 3).map((g) => (
        <div key={g.id} style={{ borderBottom: "1px solid #302539", padding: "10px 0", display: "flex", alignItems: "center", gap: 9 }}>
          <span className="tag">{g.category}</span>
          <b style={{ fontSize: 12 }}>{g.name}</b>
        </div>
      )) : <div className="empty-state">Your goals will appear here.</div>}
      <button className="btn-subtle" style={{ marginTop: "auto" }} onClick={onNavigate}>View all goals →</button>
    </section>
  );
}
