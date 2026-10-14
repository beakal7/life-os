"use client";

import { useState, useCallback, useRef } from "react";
import { useLifeOS } from "@/hooks/useLifeOS";
import { Toast, useToast } from "@/components/ui/Toast";
import { TAB_CONFIG, type TabId } from "@/types";

import { TodayTab }   from "@/components/tabs/TodayTab";
import { FitnessTab } from "@/components/tabs/FitnessTab";
import { FinanceTab } from "@/components/tabs/FinanceTab";
import {
  FaithTab, CareerTab, HabitsTab, GoalsTab,
} from "@/components/tabs/OtherTabs";

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const { toast, showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data,
    addTask, toggleTask, removeTask,
    addHabit, toggleHabit, removeHabit,
    addItem, removeItem,
    updateStockPrice,
    logFocusMinutes,
    setPriority,
    setVision,
    addLink, removeLink,
    doExport, doImport,
  } = useLifeOS();

  // ── Tab navigation ───────────────────────────────────────────────────────
  const navigate = useCallback((tab: string) => {
    setActiveTab(tab as TabId);
    window.scrollTo(0, 0);
  }, []);

  // ── Journal helpers ───────────────────────────────────────────────────────
  const addJournal = useCallback((text: string) => {
    addItem("journal", { name: text });
  }, [addItem]);

  const removeJournal = useCallback((id: string) => {
    removeItem("journal", id);
  }, [removeItem]);

  // ── Import handler ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        doImport(reader.result as string);
        showToast("Backup restored ✓");
      } catch {
        showToast("Invalid Life OS backup file");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  // ── Active tab config ─────────────────────────────────────────────────────
  const tabCfg = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── Sidebar / top nav ────────────────────────────────────────────── */}
      <header
        style={{
          padding: "16px 22px 12px",
          display: "flex",
          alignItems: "center",
          gap: 30,
          borderBottom: "1px solid #35243b",
          background: "rgba(18, 12, 26, 0.79)",
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ fontWeight: 850, fontSize: 21, letterSpacing: "-.8px", whiteSpace: "nowrap" }}>
            LIFE<span style={{ color: "#d5a4f6" }}>OS</span> ✦
          </div>
          <div style={{ fontSize: 11, color: "#9c92a9" }}>YOUR PERSONAL COMMAND CENTER</div>
        </div>

        {/* Navigation tabs */}
        <nav
          aria-label="Main navigation"
          style={{ display: "flex", alignItems: "center", gap: 4, overflow: "auto", flex: 1, scrollbarWidth: "thin" }}
        >
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              style={{
                border: activeTab === tab.id ? "1px solid #493855" : "1px solid transparent",
                background: activeTab === tab.id ? "#2b2038" : "none",
                color: activeTab === tab.id ? "#fff" : "#b5aabd",
                borderRadius: 10,
                whiteSpace: "nowrap",
                padding: "9px 11px",
                fontSize: 12,
                transition: "all .15s",
              }}
            >
              {tab.icon}&nbsp; {tab.name}
            </button>
          ))}
        </nav>

        {/* Utility actions */}
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginLeft: "auto" }}>
          <button
            onClick={doExport}
            title="Download a backup"
            style={{ fontSize: 11, background: "#251a31", border: "1px solid #453352", borderRadius: 9, padding: "8px 10px", color: "#cfc0db" }}
          >
            ↓ Backup
          </button>
          <label
            title="Restore from a backup"
            style={{ fontSize: 11, background: "#251a31", border: "1px solid #453352", borderRadius: 9, padding: "8px 10px", color: "#cfc0db", cursor: "pointer" }}
          >
            ↑ Restore
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main
        style={{
          padding: "24px clamp(14px, 2vw, 32px) 60px",
          maxWidth: 1700,
          margin: "auto",
        }}
      >
        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 21 }}>
          <div>
            <div style={{ color: "#a89ab6", fontSize: 11, textTransform: "uppercase", letterSpacing: 2 }}>
              MAKE TODAY COUNT · YOUR COMMAND CENTER
            </div>
            <h1>
              {activeTab === "today" ? "Hello, CEO ✦" : tabCfg.name}
            </h1>
            <p>
              {activeTab === "today" ? "Own your day. Build your future." : tabCfg.description}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                background: "#201828",
                border: "1px solid #392d42",
                borderRadius: 100,
                padding: "9px 13px",
                fontSize: 12,
                color: "#cbb9df",
              }}
            >
              {dateLabel}
            </span>
            <button
              aria-label="App settings"
              onClick={() => showToast("Data is saved in this browser. Use Backup to export it.")}
              style={{ border: "1px solid #44334f", background: "#251a30", padding: "10px 12px", borderRadius: 12, color: "#cdbdde" }}
            >
              ⚙
            </button>
          </div>
        </div>

        {/* ── Tab content ───────────────────────────────────────────────── */}
        {activeTab === "today" && (
          <TodayTab
            data={data}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onRemoveTask={removeTask}
            onToggleHabit={toggleHabit}
            onLogMinutes={logFocusMinutes}
            onSetPriority={setPriority}
            onSetVision={setVision}
            onAddLink={addLink}
            onRemoveLink={removeLink}
            onAddJournal={addJournal}
            onRemoveJournal={removeJournal}
            onNavigate={navigate}
            onToast={showToast}
          />
        )}

        {activeTab === "fitness" && (
          <FitnessTab
            data={data}
            onAddItem={(key, item) => addItem(key as "workouts" | "weight", item)}
            onRemoveItem={(key, id) => removeItem(key as "workouts" | "weight", id)}
            onToast={showToast}
          />
        )}

        {activeTab === "finance" && (
          <FinanceTab
            data={data}
            onAddItem={(key, item) => addItem(key as "stocks" | "budget", item)}
            onRemoveItem={(key, id) => removeItem(key as "stocks" | "budget", id)}
            onUpdateStockPrice={updateStockPrice}
            onToast={showToast}
          />
        )}

        {activeTab === "faith" && (
          <FaithTab
            data={data}
            onAddItem={(key, item) => addItem(key as "readings" | "prayers", item)}
            onRemoveItem={(key, id) => removeItem(key as "readings" | "prayers", id)}
          />
        )}

        {activeTab === "career" && (
          <CareerTab
            data={data}
            onAddItem={(key, item) => addItem(key as "skills", item)}
            onRemoveItem={(key, id) => removeItem(key as "skills", id)}
          />
        )}

        {activeTab === "habits" && (
          <HabitsTab
            data={data}
            onAddHabit={addHabit}
            onToggleHabit={toggleHabit}
            onRemoveHabit={removeHabit}
          />
        )}

        {activeTab === "goals" && (
          <GoalsTab
            data={data}
            onAddItem={(key, item) => addItem(key as "goals", item)}
            onRemoveItem={(key, id) => removeItem(key as "goals", id)}
          />
        )}
      </main>

      {/* ── Toast notification ────────────────────────────────────────────── */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
