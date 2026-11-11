"use client";

import type { LifeOSData, QuickLink } from "@/types";
import { MonthlyCalendar }  from "@/components/widgets/MonthlyCalendar";
import { MotivationTracker } from "@/components/widgets/MotivationTracker";
import { DailyInspiration } from "@/components/widgets/DailyInspiration";
import { VisionBoard }      from "@/components/widgets/VisionBoard";
import { QuickLinks }       from "@/components/widgets/QuickLinks";
import { HabitStreaks }     from "@/components/widgets/HabitStreaks";
import { HighLevelFocus }   from "@/components/widgets/HighLevelFocus";
import { FocusMode }        from "@/components/widgets/FocusMode";
import { TaskInbox }        from "@/components/widgets/TaskInbox";
import {
  Reflection, GoalsPreview,
} from "@/components/widgets/TodayWidgets";

interface TodayTabProps {
  data: LifeOSData;
  userId: string;
  onAddWorkout: (name: string, detail: string) => void;
  onRemoveWorkout: (id: string) => void;
  onAddTask:      (name: string) => void;
  onToggleTask:   (id: string) => void;
  onRemoveTask:   (id: string) => void;
  onToggleHabit:  (id: string) => void;
  onLogMinutes:   (n: number) => void;
  onSetPriority:  (key: "top3" | "week3", i: 0 | 1 | 2, v: string) => void;
  onSetVision:    (v: string) => void;
  onAddLink:      (link: QuickLink) => void;
  onRemoveLink:   (i: number) => void;
  onAddJournal:   (text: string) => void;
  onRemoveJournal:(id: string) => void;
  onNavigate:     (tab: string) => void;
  onToast:        (msg: string) => void;
}

export function TodayTab({
  data, userId, onAddWorkout, onRemoveWorkout,
  onAddTask, onToggleTask, onRemoveTask,
  onToggleHabit, onLogMinutes, onSetPriority, onSetVision,
  onAddLink, onRemoveLink,
  onAddJournal, onRemoveJournal,
  onNavigate, onToast,
}: TodayTabProps) {
  const top3  = data.top3  ?? ["", "", ""];
  const week3 = data.week3 ?? ["", "", ""];
  const links = data.links ?? [];

  return (
    <>
    <MotivationTracker data={data} userId={userId} onAddWorkout={onAddWorkout} onRemoveWorkout={onRemoveWorkout} />
    <div className="home-essentials">
      <MonthlyCalendar habits={data.habits} workouts={data.workouts} />
      <TaskInbox tasks={data.tasks} onAdd={onAddTask} onToggle={onToggleTask} onRemove={onRemoveTask} limit={6} />
      <FocusMode tasks={data.tasks} focusMinutes={data.focusMinutes} onToggleTask={onToggleTask} onLogMinutes={onLogMinutes} onToast={onToast} />
    </div>
    <details className="more-tools">
    <summary>More tools for your day <span>Priorities, habits, vision & reflection</span></summary>
    <div className="home-widgets" style={{ display: "grid", gap: 13 }}>
      <DailyInspiration />
      <VisionBoard vision={data.vision ?? ""} onEdit={onSetVision} />
      <QuickLinks links={links} onAdd={onAddLink} onRemove={onRemoveLink} onToast={onToast} />
      <HabitStreaks habits={data.habits} onToggle={onToggleHabit} onNavigate={() => onNavigate("habits")} />
      <HighLevelFocus
        top3={top3 as [string,string,string]}
        week3={week3 as [string,string,string]}
        onSet={onSetPriority}
        onToast={onToast}
      />
      <GoalsPreview goals={data.goals} onNavigate={() => onNavigate("goals")} />
      <Reflection
        journal={data.journal}
        onAdd={onAddJournal}
        onRemove={onRemoveJournal}
      />
    </div>
    </details>
    </>
  );
}
