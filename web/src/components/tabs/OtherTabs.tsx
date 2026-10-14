"use client";

import { useRef } from "react";
import type { LifeOSData } from "@/types";
import { StatGrid }   from "@/components/ui/StatGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { todayKey, uid } from "@/lib/storage";

// ── Reusable simple list form ─────────────────────────────────────────────────
function SimpleList({
  items, onRemove,
}: {
  items: { id: string; name: string; detail?: string; date?: string }[];
  onRemove: (id: string) => void;
}) {
  if (!items.length) return <EmptyState message="No entries yet. Add your first one above." />;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.map(item => (
        <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: 11, border: "1px solid #382b40", borderRadius: 11, background: "#16101d" }}>
          <label style={{ flex: 1, overflowWrap: "anywhere" }}>
            <b>{item.name}</b>
            {item.detail && <div style={{ color: "#9c92a9", fontSize: 12 }}>{item.detail}</div>}
            {item.date   && <div style={{ color: "#9c92a9", fontSize: 12 }}>{item.date}</div>}
          </label>
          <button onClick={() => onRemove(item.id)} style={{ background: "none", border: 0, color: "#a48caf", fontSize: 18 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// ── Faith Tab ─────────────────────────────────────────────────────────────────
export function FaithTab({ data, onAddItem, onRemoveItem }: {
  data: LifeOSData;
  onAddItem:    (key: "readings" | "prayers", item: Record<string, unknown>) => void;
  onRemoveItem: (key: "readings" | "prayers", id: string) => void;
}) {
  const rNameRef   = useRef<HTMLInputElement>(null);
  const rDetailRef = useRef<HTMLInputElement>(null);
  const pRef       = useRef<HTMLInputElement>(null);

  const addReading = (e: React.FormEvent) => {
    e.preventDefault();
    const name = rNameRef.current?.value.trim(); const detail = rDetailRef.current?.value.trim();
    if (!name || !detail) return;
    onAddItem("readings", { id: uid(), name, detail, date: todayKey() });
    if (rNameRef.current) rNameRef.current.value = "";
    if (rDetailRef.current) rDetailRef.current.value = "";
  };

  const addPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    const name = pRef.current?.value.trim();
    if (!name) return;
    onAddItem("prayers", { id: uid(), name, date: todayKey() });
    if (pRef.current) pRef.current.value = "";
  };

  const bibleHabit = data.habits.find(h => h.name === "Bible reading");
  const bibleToday = bibleHabit?.history[todayKey()] ? "Done" : "Not checked";

  return (
    <>
      <StatGrid stats={[
        { label: "Scripture notes", value: data.readings.length,  note: "Reading log" },
        { label: "Prayer entries",  value: data.prayers.length,   note: "Journal" },
        { label: "Daily reading",   value: bibleToday,            note: "From Habits" },
        { label: "Focus",           value: "Consistency",         note: "Stay grounded" },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <section className="card">
          <h2>Bible reading & sermon notes</h2>
          <form onSubmit={addReading} style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
            <input ref={rNameRef}   className="life-input" placeholder="Book and passage"          required style={{ flex: 1, minWidth: 120 }} />
            <input ref={rDetailRef} className="life-input" placeholder="Reflection or sermon insight" required style={{ flex: 1, minWidth: 120 }} />
            <button className="btn-action" type="submit">Add</button>
          </form>
          <SimpleList items={data.readings} onRemove={id => onRemoveItem("readings", id)} />
        </section>
        <section className="card">
          <h2>Prayer & gratitude journal</h2>
          <form onSubmit={addPrayer} style={{ display: "flex", gap: 8, margin: "12px 0" }}>
            <input ref={pRef} className="life-input" placeholder="Prayer, intention, or gratitude" required style={{ flex: 1 }} />
            <button className="btn-action" type="submit">Add</button>
          </form>
          <SimpleList items={data.prayers} onRemove={id => onRemoveItem("prayers", id)} />
        </section>
      </div>
    </>
  );
}

// ── Career Tab ────────────────────────────────────────────────────────────────
export function CareerTab({ data, onAddItem, onRemoveItem }: {
  data: LifeOSData;
  onAddItem:    (key: "skills", item: Record<string, unknown>) => void;
  onRemoveItem: (key: "skills", id: string) => void;
}) {
  const nameRef   = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value.trim(); const detail = detailRef.current?.value.trim();
    if (!name || !detail) return;
    onAddItem("skills", { id: uid(), name, detail, date: todayKey() });
    if (nameRef.current) nameRef.current.value = "";
    if (detailRef.current) detailRef.current.value = "";
  };

  return (
    <>
      <StatGrid stats={[
        { label: "Learning logs",   value: data.skills.length,                                      note: "Skills and projects" },
        { label: "Career goals",    value: data.goals.filter(g => g.category === "Career").length,  note: "Goal entries" },
        { label: "Current focus",   value: "Growth",                                                note: "Log learning consistently" },
        { label: "Next step",       value: "Build",                                                 note: "One skill at a time" },
      ]} />
      <section className="card">
        <h2>Career and learning tracker</h2>
        <p style={{ fontSize: 12, marginBottom: 12 }}>Track cybersecurity, cloud, engineering, certifications, interview preparation, and projects.</p>
        <form onSubmit={addSkill} style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
          <input ref={nameRef}   className="life-input" placeholder="Skill, course, certification, or project" required style={{ flex: 1, minWidth: 160 }} />
          <input ref={detailRef} className="life-input" placeholder="Progress / next milestone"                 required style={{ flex: 1, minWidth: 120 }} />
          <button className="btn-action" type="submit">Add</button>
        </form>
        <SimpleList items={data.skills} onRemove={id => onRemoveItem("skills", id)} />
      </section>
    </>
  );
}

// ── Habits Tab ────────────────────────────────────────────────────────────────
export function HabitsTab({ data, onAddHabit, onToggleHabit, onRemoveHabit }: {
  data: LifeOSData;
  onAddHabit:    (name: string) => void;
  onToggleHabit: (id: string) => void;
  onRemoveHabit: (id: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const today = todayKey();
  const done = data.habits.filter(h => h.history[today]).length;
  const allDays = new Set(data.habits.flatMap(h => Object.keys(h.history ?? {}).filter(k => h.history[k]))).size;

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = ref.current?.value.trim();
    if (!name) return;
    onAddHabit(name);
    if (ref.current) ref.current.value = "";
  };

  return (
    <>
      <StatGrid stats={[
        { label: "Active habits",    value: data.habits.length,                         note: "Current checklist" },
        { label: "Completed today",  value: done,                                        note: "Daily progress" },
        { label: "Consistency",      value: data.habits.length ? Math.round(100 * done / data.habits.length) + "%" : "0%", note: "Today" },
        { label: "Tracked days",     value: allDays,                                     note: "With at least one completion" },
      ]} />
      <section className="card">
        <h2>Daily disciplines</h2>
        <form onSubmit={addHabit} style={{ display: "flex", gap: 8, margin: "12px 0" }}>
          <input ref={ref} className="life-input" placeholder="New daily habit" required style={{ flex: 1 }} />
          <button className="btn-action" type="submit">Add</button>
        </form>
        <div style={{ display: "grid", gap: 8 }}>
          {data.habits.length > 0 ? data.habits.map(h => (
            <div key={h.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: 11, border: `1px solid ${h.history[today] ? "#9773cc" : "#382b40"}`, borderRadius: 11, background: h.history[today] ? "#2d1e3e" : "#16101d" }}>
              <input type="checkbox" checked={!!h.history[today]} onChange={() => onToggleHabit(h.id)} aria-label={`Complete habit: ${h.name}`} />
              <label style={{ flex: 1 }}>{h.name}</label>
              <span className="tag">{Object.values(h.history ?? {}).filter(Boolean).length} total</span>
              <button onClick={() => onRemoveHabit(h.id)} style={{ background: "none", border: 0, color: "#a48caf", fontSize: 18 }}>×</button>
            </div>
          )) : <EmptyState message="Add a daily habit to start tracking." />}
        </div>
      </section>
    </>
  );
}

// ── Goals Tab ─────────────────────────────────────────────────────────────────
import type { GoalCategory } from "@/types";
const GOAL_CATEGORIES: GoalCategory[] = ["Fitness", "Finance", "Faith", "Career", "Habits", "Personal"];

export function GoalsTab({ data, onAddItem, onRemoveItem }: {
  data: LifeOSData;
  onAddItem:    (key: "goals", item: Record<string, unknown>) => void;
  onRemoveItem: (key: "goals", id: string) => void;
}) {
  const nameRef   = useRef<HTMLInputElement>(null);
  const catRef    = useRef<HTMLSelectElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const name     = nameRef.current?.value.trim();
    const category = catRef.current?.value as GoalCategory;
    const detail   = detailRef.current?.value.trim();
    if (!name || !category || !detail) return;
    onAddItem("goals", { id: uid(), name, category, detail, date: todayKey() });
    if (nameRef.current)   nameRef.current.value   = "";
    if (detailRef.current) detailRef.current.value = "";
  };

  return (
    <>
      <StatGrid stats={[
        { label: "Active goals",   value: data.goals.length,                                        note: "Across life areas" },
        { label: "Fitness goals",  value: data.goals.filter(g => g.category === "Fitness").length,  note: "Long-term" },
        { label: "Finance goals",  value: data.goals.filter(g => g.category === "Finance").length,  note: "Long-term" },
        { label: "Career goals",   value: data.goals.filter(g => g.category === "Career").length,   note: "Long-term" },
      ]} />

      <section className="card" style={{ marginBottom: 14 }}>
        <h2>Goals by life area</h2>
        <form onSubmit={addGoal} style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
          <input ref={nameRef}   className="life-input" placeholder="Goal name"              required style={{ flex: 1, minWidth: 140 }} />
          <select ref={catRef}   className="life-input" aria-label="Category"                style={{ flex: "0 0 140px" }}>
            {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input ref={detailRef} className="life-input" placeholder="Target date / milestone" required style={{ flex: 1, minWidth: 120 }} />
          <button className="btn-action" type="submit">Add goal</button>
        </form>
        <div style={{ display: "grid", gap: 8 }}>
          {data.goals.length > 0 ? data.goals.map(g => (
            <div key={g.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: 11, border: "1px solid #382b40", borderRadius: 11, background: "#16101d" }}>
              <span className="tag">{g.category}</span>
              <label style={{ flex: 1, overflowWrap: "anywhere" }}>
                <b>{g.name}</b>
                <div style={{ fontSize: 12, color: "#9c92a9" }}>{g.detail}</div>
              </label>
              <button onClick={() => onRemoveItem("goals", g.id)} style={{ background: "none", border: 0, color: "#a48caf", fontSize: 18 }}>×</button>
            </div>
          )) : <EmptyState message="Define your first quarterly or long-term goal." />}
        </div>
      </section>

      <section className="card">
        <h2>Weekly review prompts</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {[
            "What moved forward this week?",
            "What distracted me or slowed me down?",
            "What are my top 3 priorities next week?",
          ].map((prompt, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: 11, border: "1px solid #382b40", borderRadius: 11, background: "#16101d" }}>
              <label>
                <span className="tag">0{i + 1}</span>
                <div style={{ marginTop: 7 }}>{prompt}</div>
              </label>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
