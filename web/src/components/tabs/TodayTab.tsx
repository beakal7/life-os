"use client";

import type { LifeOSData, QuickLink } from "@/types";
import { MonthlyCalendar }  from "@/components/widgets/MonthlyCalendar";
import { DailyInspiration } from "@/components/widgets/DailyInspiration";
import { VisionBoard }      from "@/components/widgets/VisionBoard";
import { QuickLinks }       from "@/components/widgets/QuickLinks";
import { HabitStreaks }     from "@/components/widgets/HabitStreaks";
import { HighLevelFocus }   from "@/components/widgets/HighLevelFocus";
import { FocusMode }        from "@/components/widgets/FocusMode";
import { TaskInbox }        from "@/components/widgets/TaskInbox";
import {
  CEORadar, DailyBriefing, Reflection, GoalsPreview,
} from "@/components/widgets/TodayWidgets";

interface TodayTabProps {
  data: LifeOSData;
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
  data,
  onAddTask, onToggleTask, onRemoveTask,
  onToggleHabit, onLogMinutes, onSetPriority, onSetVision,
  onAddLink, onRemoveLink,
  onAddJournal, onRemoveJournal,
  onNavigate, onToast,
}: TodayTabProps) {
  const portfolioValue = data.stocks.reduce((s, x) => s + x.shares * x.price, 0);
  const top3  = data.top3  ?? ["", "", ""];
  const week3 = data.week3 ?? ["", "", ""];
  const links = data.links ?? [];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 13,
        alignItems: "stretch",
      }}
    >
      <MonthlyCalendar habits={data.habits} />
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
      <FocusMode
        tasks={data.tasks}
        focusMinutes={data.focusMinutes}
        onToggleTask={onToggleTask}
        onLogMinutes={onLogMinutes}
        onToast={onToast}
      />
      <GoalsPreview goals={data.goals} onNavigate={() => onNavigate("goals")} />
      <CEORadar
        tasksDone={data.tasks.filter(t => t.done).length}
        tasksTotal={data.tasks.length}
        habitsDone={data.habits.filter(h => h.history[new Date().toLocaleDateString("en-CA")]).length}
        habitsTotal={data.habits.length}
        focusMinutes={data.focusMinutes}
      />
      <DailyBriefing
        tasksDone={data.tasks.filter(t => t.done).length}
        tasksTotal={data.tasks.length}
        habitsDone={data.habits.filter(h => h.history[new Date().toLocaleDateString("en-CA")]).length}
        habitsTotal={data.habits.length}
        portfolioValue={portfolioValue}
        workoutCount={data.workouts.length}
        onNavigate={() => onNavigate("finance")}
      />
      <TaskInbox
        tasks={data.tasks}
        onAdd={onAddTask}
        onToggle={onToggleTask}
        onRemove={onRemoveTask}
        limit={6}
      />
      <Reflection
        journal={data.journal}
        onAdd={onAddJournal}
        onRemove={onRemoveJournal}
      />
    </div>
  );
}
