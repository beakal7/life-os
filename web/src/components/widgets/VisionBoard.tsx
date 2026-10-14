"use client";

interface VisionBoardProps {
  vision: string;
  onEdit: (v: string) => void;
}

export function VisionBoard({ vision, onEdit }: VisionBoardProps) {
  const display = vision || "Build a life of purpose, strength and freedom.";

  const handleEdit = () => {
    const next = window.prompt("What vision are you working toward?", display);
    if (next !== null && next.trim()) onEdit(next.trim());
  };

  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Vision Board</h2>
          <p style={{ fontSize: 12 }}>Keep your why in sight</p>
        </div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>

      <div className="vision-card">
        <span style={{ fontSize: 10, letterSpacing: 2, color: "#d1b8eb" }}>
          YOUR FUTURE IS BUILT TODAY
        </span>
        <strong style={{ fontSize: 15, maxWidth: 230, lineHeight: 1.35, position: "relative", zIndex: 1, color: "#f4eef9" }}>
          {display}
        </strong>
      </div>

      <button className="btn-subtle" onClick={handleEdit}>
        ✎ Edit your vision
      </button>
    </section>
  );
}
