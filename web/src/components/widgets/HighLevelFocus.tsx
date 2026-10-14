"use client";

interface HighLevelFocusProps {
  top3: [string, string, string];
  week3: [string, string, string];
  onSet: (key: "top3" | "week3", index: 0 | 1 | 2, value: string) => void;
  onToast: (msg: string) => void;
}

export function HighLevelFocus({ top3, week3, onSet, onToast }: HighLevelFocusProps) {
  const PriorityRow = ({
    label,
    storeKey,
    values,
  }: {
    label: string;
    storeKey: "top3" | "week3";
    values: [string, string, string];
  }) => (
    <div
      style={{
        background: "#17111e",
        border: "1px solid #35283e",
        borderRadius: 18,
        padding: 15,
        display: "grid",
        gap: 9,
      }}
    >
      <div style={{ color: "#bfb0ce", fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
        {label}
      </div>
      {values.map((val, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span
            style={{
              background: "#382a49",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 12,
              color: "#c8abef",
              flexShrink: 0,
            }}
          >
            {i + 1}
          </span>
          <input
            className="life-input"
            placeholder={`Priority ${i + 1}`}
            defaultValue={val}
            aria-label={`${label} priority ${i + 1}`}
            onBlur={(e) => {
              onSet(storeKey, i as 0 | 1 | 2, e.target.value);
              onToast("Priority saved");
            }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      className="card widget"
      style={{
        gridColumn: "span 2",
        minHeight: 250,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>High-Level Focus</h2>
          <p style={{ fontSize: 12 }}>Your daily and weekly priorities</p>
        </div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <PriorityRow label="◎ TOP 3 TODAY"        storeKey="top3"  values={top3} />
        <PriorityRow label="▣ TOP 3 THIS WEEK"    storeKey="week3" values={week3} />
      </div>

      <p style={{ fontSize: 11, color: "#9c92a9" }}>
        Priorities are saved automatically when you finish editing.
      </p>
    </section>
  );
}
