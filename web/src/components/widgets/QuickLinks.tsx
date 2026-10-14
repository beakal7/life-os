"use client";

import type { QuickLink } from "@/types";

interface QuickLinksProps {
  links: QuickLink[];
  onAdd: (link: QuickLink) => void;
  onRemove: (index: number) => void;
  onToast: (msg: string) => void;
}

export function QuickLinks({ links, onAdd, onRemove, onToast }: QuickLinksProps) {
  const handleAdd = () => {
    const name = window.prompt("Link name");
    if (!name) return;
    const rawUrl = window.prompt("URL (https://...)");
    if (!rawUrl) return;
    try {
      const u = new URL(rawUrl);
      if (!["https:", "http:"].includes(u.protocol)) throw new Error();
      onAdd({ name: name.trim(), url: u.href });
    } catch {
      onToast("Enter a valid http or https URL");
    }
  };

  return (
    <section className="card widget" style={{ minHeight: 250, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Favorite Links</h2>
          <p style={{ fontSize: 12 }}>Your quick access shortcuts</p>
        </div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {links.map((link, i) => (
          <div key={i} style={{ position: "relative", minWidth: 0 }}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textDecoration: "none",
                color: "#ded2e8",
                background: "#241a2e",
                border: "1px solid #322640",
                padding: "9px 20px 9px 9px",
                borderRadius: 9,
                fontSize: 11,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              ↗ {link.name}
            </a>
            <button
              onClick={() => onRemove(i)}
              aria-label={`Remove ${link.name}`}
              style={{ position: "absolute", right: 4, top: 5, background: "transparent", border: 0, color: "#83728f", cursor: "pointer" }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        style={{
          border: "1px dashed #51415e",
          background: "#201829",
          borderRadius: 10,
          padding: 9,
          color: "#a891b9",
          marginTop: "auto",
          width: "100%",
        }}
      >
        ＋ Add Link
      </button>
    </section>
  );
}
