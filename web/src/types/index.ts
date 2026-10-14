// ─────────────────────────────────────────────────────────────────────────────
// Life OS — Core data types
//
// These match the localStorage schema in index.html (lifeos-v1) exactly so
// existing browser data is not lost when users open the Next.js app.
//
// Phase 2: these same interfaces will map 1-to-1 to Supabase table rows once
// auth is added. Each entity already has an `id` field for that migration.
// ─────────────────────────────────────────────────────────────────────────────

/** ISO date string YYYY-MM-DD */
export type ISODate = string;

/** Unique identifier — random base-36 string */
export type UID = string;

// ── Entities ──────────────────────────────────────────────────────────────────

export interface Task {
  id: UID;
  name: string;
  done: boolean;
  date: ISODate;
  detail?: string;
}

export interface Habit {
  id: UID;
  name: string;
  /** Map of ISODate → boolean (true = completed that day) */
  history: Record<ISODate, boolean>;
}

export interface Workout {
  id: UID;
  name: string;
  detail: string;
  date: ISODate;
}

export interface WeightEntry {
  id: UID;
  name: string; // "185 lb" — free-form string matching original
  date: ISODate;
}

export interface Prayer {
  id: UID;
  name: string;
  date: ISODate;
}

export interface Reading {
  id: UID;
  name: string;
  detail: string;
  date: ISODate;
}

export interface Skill {
  id: UID;
  name: string;
  detail: string;
  date: ISODate;
}

export interface Goal {
  id: UID;
  name: string;
  category: GoalCategory;
  detail: string;
  date: ISODate;
}

export type GoalCategory =
  | "Fitness"
  | "Finance"
  | "Faith"
  | "Career"
  | "Habits"
  | "Personal";

export interface BudgetEntry {
  id: UID;
  name: string;
  amount: number;
  date: ISODate;
}

export interface Stock {
  id: UID;
  ticker: string;
  shares: number;
  cost: number;
  price: number;
  date: ISODate;
}

export interface JournalEntry {
  id: UID;
  name: string; // free-form reflection text
  date: ISODate;
}

export interface QuickLink {
  name: string;
  url: string;
}

// ── Root data store ────────────────────────────────────────────────────────────

/**
 * The complete Life OS data store.
 * Serialised to / from localStorage under the key `lifeos-v1`.
 * Phase 2: this becomes the shape returned by the Supabase data layer.
 */
export interface LifeOSData {
  tasks: Task[];
  habits: Habit[];
  workouts: Workout[];
  weight: WeightEntry[];
  prayers: Prayer[];
  readings: Reading[];
  skills: Skill[];
  goals: Goal[];
  budget: BudgetEntry[];
  stocks: Stock[];
  journal: JournalEntry[];
  focusMinutes: number;
  /** Editable vision statement */
  vision?: string;
  /** Saved quick-access links */
  links?: QuickLink[];
  /** Today's top-3 priorities */
  top3?: [string, string, string];
  /** This week's top-3 priorities */
  week3?: [string, string, string];
}

// ── Navigation ────────────────────────────────────────────────────────────────

export type TabId =
  | "today"
  | "fitness"
  | "finance"
  | "faith"
  | "career"
  | "habits"
  | "goals";

export interface TabConfig {
  id: TabId;
  icon: string;
  name: string;
  description: string;
}

export const TAB_CONFIG: TabConfig[] = [
  { id: "today",   icon: "◈", name: "Today",              description: "Your daily command center." },
  { id: "fitness", icon: "◉", name: "Fitness",            description: "Train smarter and track your recovery." },
  { id: "finance", icon: "▤", name: "Finances & Stocks",  description: "Manage money and monitor investments." },
  { id: "faith",   icon: "✦", name: "Faith",              description: "Bible reading, prayer, and spiritual growth." },
  { id: "career",  icon: "⌘", name: "Career & Learning",  description: "Grow your skills and move toward bigger opportunities." },
  { id: "habits",  icon: "◷", name: "Habits & Discipline","description": "Build consistency, one day at a time." },
  { id: "goals",   icon: "◎", name: "Goals & Reviews",    description: "Turn long-term objectives into progress." },
];
