"use client";

import { useState } from "react";
import type { Habit } from "@/types";
import { todayKey } from "@/lib/storage";

interface MonthlyCalendarProps {
  habits: Habit[];
}

export function MonthlyCalendar({ habits }: MonthlyCalendarProps) {
  const [offset, setOffset] = useState(0);

  const today = todayKey();
  const now = new Date();
  const mt = new Date(now.getFullYear(), offset, 1);
  const first = new Date(mt.getFullYear(), mt.getMonth(), 1);
  const days = new Date(mt.getFullYear(), mt.getMonth() + 1, 0).getDate();
  const skip = (first.getDay() + 6) % 7; // Mon-first
  const totalCells = Math.ceil((skip + days) / 7) * 7;

  const monthLabel = first.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Monthly Grid</h2>
          <p style={{ fontSize: 12 }}>This month at a glance</p>
        </div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>

      {/* Month navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 7 }}>
        <button className="btn-icon" onClick={() => setOffset((o) => o - 1)} aria-label="Previous month">‹</button>
        <b style={{ fontSize: 13 }}>{monthLabel}</b>
        <button className="btn-icon" onClick={() => setOffset((o) => o + 1)} aria-label="Next month">›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, textAlign: "center", fontSize: 10, color: "#a79bb2" }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - skip + 1;
          if (dayNum < 1 || dayNum > days) {
            return <span key={i} className="cal-day blank" />;
          }
          const key = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const count = habits.filter((h) => h.history[key]).length;
          const isToday = key === today;
          return (
            <button
              key={key}
              className={`cal-day${isToday ? " today" : ""}`}
              title={`${count} habit${count !== 1 ? "s" : ""} completed`}
              aria-label={`${key}: ${count} habits completed`}
            >
              {dayNum}
              {count > 0 && <i className="cal-dot" />}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "#9c92a9", marginTop: "auto" }}>
        Dots indicate a completed habit
      </p>
    </section>
  );
}
