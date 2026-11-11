"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { insertRow, deleteRow, updateProfile } from "@/lib/db";
import { todayKey, uid } from "@/lib/storage";
import type { CyberLog, CyberState, SkillStatus } from "@/lib/cyber";

const EMPTY: CyberState = { skills: {}, logs: [], workStart: "09:00", workEnd: "17:00", weeklyTargetHours: 8, planningConstraints: "" };

export function useCyber(onError?: (msg: string) => void) {
  const [state, setState] = useState<CyberState>(EMPTY);
  const ref = useRef(state);
  ref.current = state;
  const errRef = useRef(onError);
  errRef.current = onError;

  const reload = useCallback(async () => {
    const sb = getSupabase();
    const [skills, logs, profile] = await Promise.all([
      sb.from("cyber_skills").select("key,status"),
      sb.from("cyber_logs").select("*").order("date", { ascending: false }).order("created_at", { ascending: false }),
      sb.from("profiles").select("work_start,work_end,cyber_weekly_target_hours,planning_constraints").maybeSingle(),
    ]);
    const err = skills.error || logs.error || profile.error;
    if (err) {
      errRef.current?.(`Cyber data load failed: ${err.message}`);
      return;
    }
    setState({
      skills: Object.fromEntries((skills.data ?? []).map((s) => [s.key, s.status as SkillStatus])),
      logs: (logs.data ?? []).map((l) => ({ ...l, minutes: Number(l.minutes) })) as CyberLog[],
      workStart: profile.data?.work_start ?? "09:00",
      workEnd: profile.data?.work_end ?? "17:00",
      weeklyTargetHours: Number(profile.data?.cyber_weekly_target_hours ?? 8),
      planningConstraints: profile.data?.planning_constraints ?? "",
    });
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const run = useCallback((p: PromiseLike<unknown>) => {
    Promise.resolve(p).catch((e: Error) => {
      errRef.current?.(`Save failed: ${e.message}`);
      void reload();
    });
  }, [reload]);

  const setSkillStatus = useCallback((key: string, status: SkillStatus) => {
    setState((s) => ({ ...s, skills: { ...s.skills, [key]: status } }));
    run(
      getSupabase()
        .from("cyber_skills")
        .upsert({ key, status, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" })
        .then(({ error }) => { if (error) throw new Error(error.message); })
    );
  }, [run]);

  const addLog = useCallback((log: Omit<CyberLog, "id" | "date"> & { date?: string }) => {
    const row: CyberLog = { id: uid(), date: log.date || todayKey(), ...log } as CyberLog;
    setState((s) => ({ ...s, logs: [row, ...s.logs] }));
    run(insertRow("cyber_logs", { ...row }));
  }, [run]);

  const removeLog = useCallback((id: string) => {
    setState((s) => ({ ...s, logs: s.logs.filter((l) => l.id !== id) }));
    run(deleteRow("cyber_logs", id));
  }, [run]);

  const setSettings = useCallback((patch: Partial<Pick<CyberState, "workStart" | "workEnd" | "weeklyTargetHours" | "planningConstraints">>) => {
    setState((s) => ({ ...s, ...patch }));
    const db: Record<string, unknown> = {};
    if (patch.workStart !== undefined) db.work_start = patch.workStart;
    if (patch.workEnd !== undefined) db.work_end = patch.workEnd;
    if (patch.weeklyTargetHours !== undefined) db.cyber_weekly_target_hours = patch.weeklyTargetHours;
    if (patch.planningConstraints !== undefined) db.planning_constraints = patch.planningConstraints;
    run(updateProfile(db));
  }, [run]);

  return { cyber: state, setSkillStatus, addLog, removeLog, setSettings, reloadCyber: reload };
}
