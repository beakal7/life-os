"use client";

import { useState, useEffect, useRef } from "react";
import type { Task } from "@/types";
import { formatTimer } from "@/lib/storage";

const DEFAULT_SECS = 25 * 60;

interface FocusModeProps {
  tasks: Task[];
  focusMinutes: number;
  onToggleTask: (id: string) => void;
  onLogMinutes: (n: number) => void;
  onToast: (msg: string) => void;
}

export function FocusMode({
  tasks,
  focusMinutes,
  onToggleTask,
  onLogMinutes,
  onToast,
}: FocusModeProps) {
  const [secs, setSecs] = useState(DEFAULT_SECS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secsRef = useRef(secs);
  secsRef.current = secs;

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      if (secsRef.current <= 0) {
        clearInterval(intervalRef.current!);
        setRunning(false);
        setSecs(DEFAULT_SECS);
        onLogMinutes(25);
        onToast("Focus session completed! 🎯");
        return;
      }
      setSecs((s) => s - 1);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, onLogMinutes, onToast]);

  const toggle = () => setRunning((r) => !r);
  const reset = () => {
    setRunning(false);
    setSecs(DEFAULT_SECS);
  };

  const focusTasks = tasks.filter((t) => !t.done).slice(0, 4);

  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Focus Mode</h2>
          <p style={{ fontSize: 12 }}>Today&apos;s execution</p>
        </div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>

      <div className="timer-display">{formatTimer(secs)}</div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button className="btn-action" onClick={toggle}>
          {running ? "Pause" : "Start focus"}
        </button>
        <button className="btn-ghost" onClick={reset}>Reset</button>
      </div>

      <div style={{ fontSize: 12, color: "#9c92a9", margin: "4px 0" }}>
        {focusMinutes} total focused minutes logged
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {focusTasks.length > 0 ? (
          focusTasks.map((t) => (
            <div key={t.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
              <input
                type="checkbox"
                aria-label={`Complete: ${t.name}`}
                onChange={() => onToggleTask(t.id)}
              />
              <span>{t.name}</span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 12, color: "#9c92a9" }}>Add a task below to focus on.</p>
        )}
      </div>

      <button
        className="btn-subtle"
        style={{ marginTop: "auto" }}
        onClick={() => { onLogMinutes(25); onToast("25-minute session logged ✓"); }}
      >
        Log a completed 25-minute session +
      </button>
    </section>
  );
}
