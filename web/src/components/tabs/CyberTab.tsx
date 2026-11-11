"use client";

import { useState } from "react";
import { StatGrid } from "@/components/ui/StatGrid";
import { todayKey } from "@/lib/storage";
import {
  ROADMAP, ALL_ITEMS, PLATFORMS, minutesThisWeek, studyStreak,
  type CyberLog, type CyberState, type SkillStatus,
} from "@/lib/cyber";

const NEXT: Record<SkillStatus, SkillStatus> = { todo: "learning", learning: "done", done: "todo" };
const LABEL: Record<SkillStatus, string> = { todo: "To do", learning: "Learning", done: "Done ✓" };
const COLOR: Record<SkillStatus, string> = { todo: "#3a2d45", learning: "#6b4a8a", done: "#2f6b55" };

export function CyberTab({ cyber, onSetStatus, onAddLog, onRemoveLog, onSetTarget }: {
  cyber: CyberState;
  onSetStatus: (key: string, status: SkillStatus) => void;
  onAddLog: (log: Omit<CyberLog, "id" | "date"> & { date?: string }) => void;
  onRemoveLog: (id: string) => void;
  onSetTarget: (hours: number) => void;
}) {
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("60");
  const [skillKey, setSkillKey] = useState("");
  const [date, setDate] = useState(todayKey());
  const [notes, setNotes] = useState("");

  const done = ALL_ITEMS.filter((i) => cyber.skills[i.key] === "done").length;
  const weekMin = minutesThisWeek(cyber.logs);
  const targetMin = cyber.weeklyTargetHours * 60;
  const pct = targetMin ? Math.min(100, Math.round((100 * weekMin) / targetMin)) : 0;
  const streak = studyStreak(cyber.logs);
  const nextCert = ROADMAP.find((a) => a.id === "certs")!.items.find((i) => cyber.skills[i.key] !== "done");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Math.max(0, Math.min(1440, parseInt(minutes, 10) || 0));
    if (!title.trim()) return;
    onAddLog({ platform, title: title.trim(), minutes: m, skill_key: skillKey || null, notes: notes.trim() || null, date });
    setTitle(""); setNotes("");
  };

  return (
    <>
      <StatGrid stats={[
        { label: "This week", value: `${(weekMin / 60).toFixed(1)}h`, note: `of ${cyber.weeklyTargetHours}h target (${pct}%)` },
        { label: "Study streak", value: `${streak} day${streak === 1 ? "" : "s"}`, note: "Consecutive days with a session" },
        { label: "Roadmap", value: `${done}/${ALL_ITEMS.length}`, note: "Skills completed" },
        { label: "Next cert", value: nextCert?.name.replace("CompTIA ", "").replace("Microsoft ", "").replace("OffSec ", "") ?? "All done 🎉", note: nextCert?.hint ?? "Keep sharpening" },
      ]} />

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2>Weekly study target</h2>
          <label style={{ fontSize: 12, color: "#b5aabd", display: "flex", alignItems: "center", gap: 6 }}>
            Hours / week
            <input className="life-input" type="number" min={1} max={60} step={0.5} value={cyber.weeklyTargetHours}
              onChange={(e) => { const v = parseFloat(e.target.value); if (v > 0 && v <= 60) onSetTarget(v); }}
              style={{ width: 80 }} />
          </label>
        </div>
        <div className="meter" style={{ marginTop: 10 }}><div className="meter-fill" style={{ width: `${pct}%` }} /></div>
        <p style={{ fontSize: 12, marginTop: 6 }}>
          {weekMin >= targetMin ? "Target hit — great work this week." : `${((targetMin - weekMin) / 60).toFixed(1)}h to go this week.`}
        </p>
      </section>

      <section className="card">
        <h2>Skills roadmap</h2>
        <p style={{ fontSize: 12, marginBottom: 12 }}>Click a skill to cycle To do → Learning → Done.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {ROADMAP.map((area) => {
            const areaDone = area.items.filter((i) => cyber.skills[i.key] === "done").length;
            return (
              <div key={area.id} style={{ border: "1px solid #35283f", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong style={{ fontSize: 14 }}>{area.name}</strong>
                  <span className="tag">{areaDone}/{area.items.length}</span>
                </div>
                {area.items.map((item) => {
                  const st = cyber.skills[item.key] ?? "todo";
                  return (
                    <button key={item.key} type="button" onClick={() => onSetStatus(item.key, NEXT[st])}
                      title={item.hint}
                      style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", gap: 8,
                        textAlign: "left", background: "none", border: "none", borderTop: "1px solid #2b2234", padding: "8px 2px", color: "#e8def0" }}>
                      <span style={{ fontSize: 13 }}>
                        {item.name}
                        <span style={{ display: "block", fontSize: 11, color: "#8f85a0" }}>{item.hint}</span>
                      </span>
                      <span style={{ fontSize: 11, background: COLOR[st], borderRadius: 999, padding: "3px 8px", whiteSpace: "nowrap" }}>{LABEL[st]}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>Lab & study log</h2>
        <form onSubmit={submit} style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
          <select className="life-input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <input className="life-input" placeholder="Room / box / chapter (e.g. THM: Pre-Security)" value={title}
            onChange={(e) => setTitle(e.target.value)} required style={{ flex: 2, minWidth: 200 }} />
          <input className="life-input" type="number" min={0} max={1440} value={minutes}
            onChange={(e) => setMinutes(e.target.value)} style={{ width: 90 }} aria-label="Minutes" />
          <select className="life-input" value={skillKey} onChange={(e) => setSkillKey(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
            <option value="">Skill (optional)</option>
            {ALL_ITEMS.map((i) => <option key={i.key} value={i.key}>{i.area}: {i.name}</option>)}
          </select>
          <input className="life-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="life-input" placeholder="Notes / key takeaway" value={notes}
            onChange={(e) => setNotes(e.target.value)} style={{ flex: 2, minWidth: 200 }} />
          <button className="btn-action" type="submit">Log session</button>
        </form>
        {cyber.logs.length === 0 ? (
          <p style={{ fontSize: 13 }}>No sessions yet. Log your first TryHackMe room or study block.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="life-table">
              <thead><tr><th>Date</th><th>Platform</th><th>Session</th><th>Minutes</th><th>Skill</th><th /></tr></thead>
              <tbody>
                {cyber.logs.slice(0, 50).map((l) => (
                  <tr key={l.id}>
                    <td>{l.date}</td>
                    <td>{l.platform}</td>
                    <td>{l.title}{l.notes && <div style={{ fontSize: 11, color: "#8f85a0" }}>{l.notes}</div>}</td>
                    <td>{l.minutes}</td>
                    <td style={{ fontSize: 12 }}>{ALL_ITEMS.find((i) => i.key === l.skill_key)?.name ?? "—"}</td>
                    <td><button className="btn-icon" aria-label="Delete session" onClick={() => onRemoveLog(l.id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
