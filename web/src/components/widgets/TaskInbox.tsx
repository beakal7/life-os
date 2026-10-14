"use client";

import { useRef } from "react";
import type { Task } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

interface TaskInboxProps {
  tasks: Task[];
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  limit?: number;
}

export function TaskInbox({ tasks, onAdd, onToggle, onRemove, limit }: TaskInboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayed = limit ? tasks.slice(0, limit) : tasks;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputRef.current?.value.trim();
    if (!val) return;
    onAdd(val);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Inbox</h2>
          <p style={{ fontSize: 12 }}>Tasks to process</p>
        </div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          className="life-input"
          placeholder="Add a task..."
          aria-label="New task"
          required
          style={{ flex: 1 }}
        />
        <button className="btn-action" type="submit">Add</button>
      </form>

      <div style={{ display: "grid", gap: 8 }}>
        {displayed.length > 0 ? (
          displayed.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: 11,
                border: "1px solid #382b40",
                borderRadius: 11,
                background: "#16101d",
                opacity: t.done ? 0.6 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => onToggle(t.id)}
                aria-label={`Mark "${t.name}" complete`}
              />
              <label
                style={{
                  flex: 1,
                  overflowWrap: "anywhere",
                  textDecoration: t.done ? "line-through" : "none",
                  color: t.done ? "#867b91" : undefined,
                }}
              >
                {t.name}
              </label>
              <button
                onClick={() => onRemove(t.id)}
                aria-label={`Delete task: ${t.name}`}
                style={{ background: "none", border: 0, color: "#a48caf", fontSize: 18 }}
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <EmptyState message="Your task list is clear. Add a priority." />
        )}
      </div>
    </section>
  );
}
