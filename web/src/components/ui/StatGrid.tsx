interface StatItem {
  label: string;
  value: string | number;
  note?: string;
}

interface StatGridProps {
  stats: StatItem[];
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      {stats.map((s) => (
        <div key={s.label} className="stat">
          <small style={{ color: "#9c92a9" }}>{s.label}</small>
          <strong style={{ fontSize: 26, display: "block", marginTop: 8 }}>
            {s.value}
          </strong>
          <em style={{ fontSize: 11, color: "#c4a8f4", fontStyle: "normal" }}>
            {s.note ?? "\u00a0"}
          </em>
        </div>
      ))}
    </div>
  );
}
