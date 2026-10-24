"use client";

// AI helpers: context building, the /api/ai proxy client, and
// "Open in ChatGPT / Claude" prompt links (no API keys needed for those).

import { getSupabase } from "@/lib/supabase/client";
import { todayKey } from "@/lib/storage";
import { ALL_ITEMS, minutesThisWeek, studyStreak, type CyberState } from "@/lib/cyber";
import type { LifeOSData } from "@/types";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export class AIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export const COACH_SYSTEM = `You are "LifeOS Coach", a direct, encouraging productivity and career coach for Beakal.
He works a full-time job as a Cloud & Product Security Analyst and is working to become a top cyber security engineer
(cloud security, detection engineering, and offensive skills; cert path Security+ -> CySA+/AZ-500 -> OSCP).
Be concrete and realistic about limited time outside work. Prefer short bullet lists, specific next actions,
and time estimates. Never invent data that isn't in the context.`;

/** Compact plain-text snapshot of the user's dashboard for AI context. */
export function buildContext(data: LifeOSData, cyber: CyberState): string {
  const today = todayKey();
  const open = data.tasks.filter((t) => !t.done).slice(0, 25);
  const done = data.tasks.filter((t) => t.done && t.date === today).slice(0, 10);
  const habits = data.habits.map((h) => `${h.name}${h.history[today] ? " (done today)" : ""}`);
  const goals = data.goals.slice(0, 15).map((g) => `[${g.category}] ${g.name}${g.detail ? ` — ${g.detail}` : ""}`);
  const learning = ALL_ITEMS.filter((i) => cyber.skills[i.key] === "learning").map((i) => i.name);
  const mastered = ALL_ITEMS.filter((i) => cyber.skills[i.key] === "done").map((i) => i.name);
  const next = ALL_ITEMS.filter((i) => !cyber.skills[i.key] || cyber.skills[i.key] === "todo").slice(0, 5).map((i) => i.name);
  const recentLogs = cyber.logs.slice(0, 8).map((l) => `${l.date} ${l.platform}: ${l.title} (${l.minutes}m)`);
  const weekMin = minutesThisWeek(cyber.logs);
  const top3 = (data.top3 ?? []).filter(Boolean);
  const week3 = (data.week3 ?? []).filter(Boolean);

  const section = (title: string, lines: string[]) => (lines.length ? `${title}:\n- ${lines.join("\n- ")}` : `${title}: (none)`);
  return [
    `Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    `Work hours: ${cyber.workStart}–${cyber.workEnd} (weekdays)`,
    data.vision ? `Vision: ${data.vision}` : "",
    section("Today's top 3", top3),
    section("This week's top 3", week3),
    section("Open tasks", open.map((t) => t.name)),
    section("Completed today", done.map((t) => t.name)),
    section("Habits", habits),
    section("Goals", goals),
    `Cyber study: ${(weekMin / 60).toFixed(1)}h this week of ${cyber.weeklyTargetHours}h target; streak ${studyStreak(cyber.logs)} day(s).`,
    section("Cyber skills in progress", learning),
    section("Cyber skills completed", mastered),
    section("Suggested next roadmap items", next),
    section("Recent study/lab sessions", recentLogs),
  ].filter(Boolean).join("\n\n");
}

/** Call the server-side Gemini proxy. Throws AIError (code "not_configured" until the key is set). */
export async function callAI(opts: { system?: string; messages: ChatMessage[]; json?: boolean }): Promise<string> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new AIError("unauthorized", "Please sign in again.");
  let res: Response;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(opts),
    });
  } catch {
    throw new AIError("network", "Couldn't reach the AI service.");
  }
  const body = (await res.json().catch(() => null)) as { text?: string; error?: string; message?: string } | null;
  if (!res.ok || !body) {
    // 404/405 means the Pages Function isn't deployed (e.g. local `next dev`).
    if (!body?.error && (res.status === 404 || res.status === 405)) throw new AIError("not_configured", "AI is not configured yet.");
    throw new AIError(body?.error ?? "error", body?.message ?? `AI request failed (${res.status}).`);
  }
  return body.text ?? "";
}

export function planDayPrompt(context: string): string {
  return `${context}

Plan my day. Build a realistic time-blocked schedule for today around my work hours (if today is a weekday,
work hours are blocked). Include: my top priorities, the most important open tasks, at least one focused cyber
study/lab block sized to hit my weekly hours target, habits, short breaks, and a wind-down. Use a table or list
with times, keep evenings realistic after a full workday, and end with the single most important thing to finish today.`;
}

export function breakdownPrompt(task: string, context: string): string {
  return `${context}

Break this task into 3–8 concrete, sequential subtasks that each take 15–90 minutes: "${task}".
Respond ONLY with JSON: {"subtasks":[{"name":"...","minutes":30}]}`;
}

export function parseSubtasks(text: string): { name: string; minutes?: number }[] {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const obj = JSON.parse(match[0]) as { subtasks?: { name: string; minutes?: number }[] };
    return (obj.subtasks ?? []).filter((s) => typeof s?.name === "string" && s.name.trim()).slice(0, 10);
  } catch {
    return [];
  }
}

// ── External assistants (ChatGPT Plus / Claude web apps) ─────────────────────

const MAX_URL_PROMPT = 6000;

export function externalPrompt(question: string, context: string): string {
  return `${COACH_SYSTEM}\n\n--- My LifeOS dashboard ---\n${context}\n\n--- Request ---\n${question}`;
}

export type ExternalTarget = "chatgpt" | "claude";

/**
 * Open the prompt in ChatGPT or Claude. The prompt is also copied to the
 * clipboard so it can be pasted if the ?q= prefill isn't honored or is too long.
 */
export async function openExternal(target: ExternalTarget, prompt: string): Promise<"opened" | "copied"> {
  let copied = false;
  try {
    await navigator.clipboard.writeText(prompt);
    copied = true;
  } catch {
    /* clipboard may be unavailable */
  }
  const q = encodeURIComponent(prompt.length > MAX_URL_PROMPT ? prompt.slice(0, MAX_URL_PROMPT) : prompt);
  const url = target === "chatgpt" ? `https://chatgpt.com/?q=${q}` : `https://claude.ai/new?q=${q}`;
  const win = window.open(url, "_blank", "noopener,noreferrer");
  return win || !copied ? "opened" : "copied";
}

// ── Optional chat history (Supabase table ai_messages) ───────────────────────

const HISTORY_PREF = "lifeos-save-chat";

export const historyPref = {
  get: () => typeof window !== "undefined" && localStorage.getItem(HISTORY_PREF) === "1",
  set: (on: boolean) => localStorage.setItem(HISTORY_PREF, on ? "1" : "0"),
};

export async function loadHistory(limit = 50): Promise<ChatMessage[]> {
  const { data, error } = await getSupabase()
    .from("ai_messages")
    .select("role,content,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).reverse().map((m) => ({ role: m.role as ChatMessage["role"], content: m.content }));
}

export async function saveMessages(msgs: ChatMessage[]): Promise<void> {
  if (!msgs.length) return;
  const base = Date.now();
  const { error } = await getSupabase()
    .from("ai_messages")
    .insert(msgs.map((m, i) => ({ role: m.role, content: m.content, created_at: new Date(base + i).toISOString() })));
  if (error) throw new Error(error.message);
}

export async function clearHistory(): Promise<void> {
  const { data } = await getSupabase().auth.getUser();
  if (!data.user) return;
  const { error } = await getSupabase().from("ai_messages").delete().eq("user_id", data.user.id);
  if (error) throw new Error(error.message);
}
