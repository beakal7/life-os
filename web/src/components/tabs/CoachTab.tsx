"use client";

import { useEffect, useRef, useState } from "react";
import type { LifeOSData } from "@/types";
import type { CyberState } from "@/lib/cyber";
import {
  AIError, COACH_SYSTEM, buildContext, callAI, planDayPrompt, breakdownPrompt, parseSubtasks,
  externalPrompt, openExternal, historyPref, loadHistory, saveMessages, clearHistory,
  type ChatMessage, type ExternalTarget,
} from "@/lib/ai";

export function CoachTab({ data, cyber, onAddTask, onSetWorkHours, onToast }: {
  data: LifeOSData;
  cyber: CyberState;
  onAddTask: (name: string) => void;
  onSetWorkHours: (start: string, end: string) => void;
  onToast: (msg: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [saveHistory, setSaveHistory] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [taskToSplit, setTaskToSplit] = useState("");
  const [subtasks, setSubtasks] = useState<{ name: string; minutes?: number }[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = historyPref.get();
    setSaveHistory(on);
    if (on) loadHistory().then(setMessages).catch(() => {});
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages]);

  const context = () => buildContext(data, cyber);

  const handleError = (e: unknown) => {
    if (e instanceof AIError && e.code === "not_configured") setNotConfigured(true);
    else onToast((e as Error).message);
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const userMsg: ChatMessage = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const sys = `${COACH_SYSTEM}\n\n--- Current dashboard ---\n${context()}`;
      const reply = await callAI({ system: sys, messages: history.slice(-20) });
      const botMsg: ChatMessage = { role: "assistant", content: reply || "(no response)" };
      setMessages((m) => [...m, botMsg]);
      if (saveHistory) saveMessages([userMsg, botMsg]).catch((e: Error) => onToast(`History not saved: ${e.message}`));
    } catch (e) {
      handleError(e);
      setMessages((m) => m.slice(0, -1));
      setInput(content);
    } finally {
      setBusy(false);
    }
  };

  const planDay = async () => {
    setBusy(true); setPlan(null);
    try {
      setPlan(await callAI({ system: COACH_SYSTEM, messages: [{ role: "user", content: planDayPrompt(context()) }] }));
    } catch (e) { handleError(e); } finally { setBusy(false); }
  };

  const breakdown = async () => {
    if (!taskToSplit.trim()) return;
    setBusy(true); setSubtasks([]);
    try {
      const text = await callAI({ system: COACH_SYSTEM, json: true, messages: [{ role: "user", content: breakdownPrompt(taskToSplit.trim(), context()) }] });
      const list = parseSubtasks(text);
      if (!list.length) onToast("Couldn't parse subtasks — try rephrasing.");
      setSubtasks(list);
    } catch (e) { handleError(e); } finally { setBusy(false); }
  };

  const external = async (target: ExternalTarget, question: string) => {
    const res = await openExternal(target, externalPrompt(question, context()));
    onToast(res === "copied" ? "Popup blocked — prompt copied, paste it into the chat." : "Prompt copied too, in case it doesn't prefill.");
  };

  const toggleHistory = (on: boolean) => {
    historyPref.set(on);
    setSaveHistory(on);
    if (on) loadHistory().then((h) => h.length && setMessages(h)).catch(() => {});
  };

  const lastQuestion = input.trim() || [...messages].reverse().find((m) => m.role === "user")?.content
    || "Review my dashboard and tell me the 3 highest-leverage things to do this week for my cyber career.";

  return (
    <>
      {notConfigured && (
        <section className="card" style={{ borderColor: "#6b4a8a" }}>
          <h2>AI not configured yet</h2>
          <p style={{ fontSize: 13 }}>
            The built-in coach needs a free Google Gemini API key added as the <code>GEMINI_API_KEY</code> secret in
            Cloudflare Pages. Until then, use <strong>Open in ChatGPT</strong> or <strong>Open in Claude</strong> below —
            they send the same dashboard context to your existing subscriptions.
          </p>
        </section>
      )}

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2>Plan my day</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: "#b5aabd" }}>Work
              <input className="life-input" type="time" value={cyber.workStart}
                onChange={(e) => onSetWorkHours(e.target.value, cyber.workEnd)} style={{ marginLeft: 6 }} />
            </label>
            <label style={{ fontSize: 12, color: "#b5aabd" }}>to
              <input className="life-input" type="time" value={cyber.workEnd}
                onChange={(e) => onSetWorkHours(cyber.workStart, e.target.value)} style={{ marginLeft: 6 }} />
            </label>
            <button className="btn-action" onClick={planDay} disabled={busy}>✦ Plan my day</button>
            <button className="btn-ghost" onClick={() => external("chatgpt", "Plan my day around my work hours.")}>ChatGPT</button>
            <button className="btn-ghost" onClick={() => external("claude", "Plan my day around my work hours.")}>Claude</button>
          </div>
        </div>
        {plan && <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.55, marginTop: 12 }}>{plan}</div>}
      </section>

      <section className="card">
        <h2>Break down a task</h2>
        <div style={{ display: "flex", gap: 8, margin: "10px 0", flexWrap: "wrap" }}>
          <input className="life-input" list="open-tasks" placeholder="e.g. Pass Security+ / Build an AWS IAM auditor" value={taskToSplit}
            onChange={(e) => setTaskToSplit(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
          <datalist id="open-tasks">{data.tasks.filter((t) => !t.done).map((t) => <option key={t.id} value={t.name} />)}</datalist>
          <button className="btn-action" onClick={breakdown} disabled={busy || !taskToSplit.trim()}>Break down</button>
        </div>
        {subtasks.length > 0 && (
          <>
            <ol style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 20 }}>
              {subtasks.map((s, i) => <li key={i}>{s.name}{s.minutes ? <span style={{ color: "#8f85a0" }}> · {s.minutes}m</span> : null}</li>)}
            </ol>
            <button className="btn-subtle" onClick={() => {
              subtasks.slice().reverse().forEach((s) => onAddTask(s.name));
              onToast(`Added ${subtasks.length} tasks`);
              setSubtasks([]);
            }}>+ Add all to task inbox</button>
          </>
        )}
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2>AI Coach</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, color: "#b5aabd" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={saveHistory} onChange={(e) => toggleHistory(e.target.checked)} />
              Save chat history
            </label>
            <button className="btn-subtle" onClick={async () => {
              setMessages([]);
              if (saveHistory) await clearHistory().catch((e: Error) => onToast(e.message));
            }}>Clear</button>
          </div>
        </div>
        <div style={{ maxHeight: 420, overflowY: "auto", margin: "12px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.length === 0 && (
            <p style={{ fontSize: 13 }}>
              Ask anything — your tasks, goals, habits and cyber progress are included automatically.
              Try: &ldquo;What should I study this week for Security+?&rdquo;
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.55,
              background: m.role === "user" ? "#3a2650" : "#221a2c", border: "1px solid #3a2d45", borderRadius: 12, padding: "10px 12px",
            }}>{m.content}</div>
          ))}
          {busy && <p style={{ fontSize: 12 }}>Thinking…</p>}
          <div ref={endRef} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void send(input); }} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="life-input" placeholder="Ask your coach…" value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
          <button className="btn-action" type="submit" disabled={busy || !input.trim()}>Send</button>
          <button className="btn-ghost" type="button" onClick={() => external("chatgpt", lastQuestion)}>Open in ChatGPT</button>
          <button className="btn-ghost" type="button" onClick={() => external("claude", lastQuestion)}>Open in Claude</button>
        </form>
      </section>
    </>
  );
}
