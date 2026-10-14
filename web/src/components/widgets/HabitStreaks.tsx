"use client";

import type { Habit } from "@/types";
import { todayKey } from "@/lib/storage";

interface HabitStreaksProps {
  habits: Habit[];
  onToggle: (id: string) => void;
  onNavigate: () => void;
}

function computeStreak(habit: Habit, today: string): number {
  const hist = habit.history ?? {};
  let n = 0;
  const cur = new Date();
  if (!hist[today]) cur.setDate(cur.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const key = cur.toLocaleDateString("en-CA");
    if (!hist[key]) break;
    n++;
    cur.setDate(cur.getDate() - 1);
  }
  return n;
}

export function HabitStreaks({ habits, onToggle, onNavigate }: HabitStreaksProps) {
  const today = todayKey();
  const displayed = habits.slice(0, 8);

  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Habit Streaks</h2>
          <p style={{ fontSize: 12 }}>Consistency tracker</p>
        </div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7 }}>
        {displayed.map((habit) => {
          const streak = computeStreak(habit, today);
          const done = !!habit.history[today];
          return (
            <button
              key={habit.id}
              className={`habit-tile${done ? " checked" : ""}`}
              onClick={() => onToggle(habit.id)}
              aria-pressed={done}
              aria-label={`${habit.name}: ${streak}-day streak${done ? ", done today" : ""}`}
            >
              <strong style={{ color: "#c5ade5" }}>♨ {streak}</strong>
              <span style={{ fontSize: 11, lineHeight: 1.2, overflowWrap: "anywhere" }}>{habit.name}</span>
              <small style={{ fontSize: 9, color: "#877b94" }}>{done ? "✓ Done today" : "Tap to check off"}</small>
            </button>
          );
        })}
      </div>

      <button className="btn-subtle" onClick={onNavigate} style={{ marginTop: "auto" }}>
        Manage all habits →
      </button>
    </section>
  );
}
