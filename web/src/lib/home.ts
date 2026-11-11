export type WorkoutDay = { name: string; exercises: string; training: boolean };
export type CalendarEvent = { id: string; summary: string; start: string; end: string; allDay: boolean; url?: string };
export type HomeSettings = {
  weeklyGymTarget: number;
  plan: WorkoutDay[];
  faith: { title: string; completed: number[]; endDate: string; notes: string };
};
export function dateKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function defaultHome(now = new Date()): HomeSettings {
  const saturday = new Date(now); saturday.setDate(now.getDate() + (6-now.getDay()+7)%7);
  return {
    weeklyGymTarget: 4,
    plan: [
      { name: 'Recovery & reset', training: false, exercises: 'Easy walk · 20–30 min\nGentle mobility · 10 min\nPrepare for the week ahead' },
      { name: 'Upper body · strength', training: true, exercises: 'Warm up · 5–10 min\nBench press or push-ups · 3 × 8–12\nSeated row · 3 × 8–12\nShoulder press · 2 × 8–12\nLat pulldown · 3 × 10–12\nPlank · 3 × 30 sec' },
      { name: 'Lower body · power & strength', training: true, exercises: 'Warm up · 5–10 min\nSquat jumps · 3 × 3, full recovery\nSquat or leg press · 3 × 6–10\nRomanian deadlift · 3 × 8–10\nWalking lunges · 2 × 10 each side\nCalf raises · 3 × 12–15\nDead bug · 3 × 10' },
      { name: 'Active recovery', training: false, exercises: 'Easy walk or cycle · 20–30 min\nHip and shoulder mobility · 10 min\nKeep it easy; recovery supports your next session' },
      { name: 'Upper body · muscle', training: true, exercises: 'Warm up · 5–10 min\nIncline dumbbell press · 3 × 8–12\nAssisted pull-ups or pulldown · 3 × 8–12\nCable row · 3 × 10–12\nLateral raises · 2 × 12–15\nBiceps curls + triceps pressdown · 2 × 12' },
      { name: 'Rest & recharge', training: false, exercises: 'Optional relaxed walk · 20 min\nLight stretching · 10 min\nPrioritize sleep and your next training session' },
      { name: 'Lower body · athletic muscle', training: true, exercises: 'Warm up · 5–10 min\nBroad jumps · 3 × 3, full recovery\nGoblet squat · 3 × 10–12\nHip thrust · 3 × 10–12\nLeg curl · 3 × 10–12\nStep-ups · 2 × 10 each side\nSide plank · 2 × 30 sec each side' },
    ],
    faith: { title: 'Church knowledge', completed: [], endDate: dateKey(saturday), notes: '' },
  };
}
export function readHome(value: unknown): HomeSettings {
  const defaults = defaultHome();
  if (!value || typeof value !== 'object') return defaults;
  const v = value as Partial<HomeSettings>;
  return {
    weeklyGymTarget: typeof v.weeklyGymTarget === 'number' && v.weeklyGymTarget >= 1 && v.weeklyGymTarget <= 7 ? Math.round(v.weeklyGymTarget) : 4,
    plan: Array.isArray(v.plan) && v.plan.length === 7 ? v.plan.map((d,i) => d && typeof d.name === 'string' && typeof d.exercises === 'string' && typeof d.training === 'boolean' ? d : defaults.plan[i]) : defaults.plan,
    faith: {
      title: typeof v.faith?.title === 'string' ? v.faith.title : defaults.faith.title,
      completed: Array.isArray(v.faith?.completed) ? [...new Set(v.faith.completed.filter(n => Number.isInteger(n) && n>=1 && n<=6))] : defaults.faith.completed,
      endDate: typeof v.faith?.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.faith.endDate) ? v.faith.endDate : defaults.faith.endDate,
      notes: typeof v.faith?.notes === 'string' ? v.faith.notes : '',
    },
  };
}
export function gymStats(workouts: {date:string}[], target: number, now = new Date()) {
  const monday = new Date(now); monday.setHours(0,0,0,0); monday.setDate(now.getDate()-(now.getDay()+6)%7);
  const today = dateKey(now);
  const days = new Set(workouts.map(w=>w.date).filter(d=>d<=today));
  const weekDays = [...days].filter(d=>d>=dateKey(monday)).length;
  let weeks = 0;
  const cursor = new Date(monday);
  if (weekDays < target) cursor.setDate(cursor.getDate()-7);
  for (;;) {
    const start = dateKey(cursor); const end = new Date(cursor); end.setDate(cursor.getDate()+7);
    if ([...days].filter(d=>d>=start && d<dateKey(end)).length < target) break;
    weeks++; cursor.setDate(cursor.getDate()-7);
  }
  return { weekDays, weeks, todayDone: days.has(today), dates: days };
}
/** Date overlap, including multiday events. All-day end dates are exclusive. */
export function eventOnDay(event: CalendarEvent, day: string): boolean {
  if (event.allDay) return event.start <= day && event.end > day;
  const start = new Date(`${day}T00:00:00`); const end = new Date(start); end.setDate(start.getDate()+1);
  const a = new Date(event.start).getTime(), b = new Date(event.end).getTime();
  return a < end.getTime() && (b > start.getTime() || a === start.getTime());
}
