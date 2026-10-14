"use client";

import { useState } from "react";

const QUOTES = [
  "You don\u2019t have to be great to start, but you have to start to be great.",
  "Discipline is choosing what you want most over what you want now.",
  "Small steps every day become extraordinary results.",
  "The secret of getting ahead is getting started.",
];

export function DailyInspiration() {
  const [shift, setShift] = useState(0);
  const index = (new Date().getDate() + shift) % QUOTES.length;

  return (
    <section
      className="card widget"
      style={{
        minHeight: 250,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", textAlign: "left" }}>
        <div>
          <h2>Daily Inspiration</h2>
          <p style={{ fontSize: 12 }}>A little encouragement</p>
        </div>
        <span style={{ color: "#ad9ab9", letterSpacing: 1 }}>⠿</span>
      </div>

      <div className="inspiration-orb">✦</div>

      <blockquote
        style={{
          fontStyle: "italic",
          fontWeight: 650,
          maxWidth: 250,
          margin: "3px auto",
          lineHeight: 1.8,
          color: "#f4eef9",
        }}
      >
        &ldquo;{QUOTES[index]}&rdquo;
      </blockquote>

      <button
        className="btn-subtle"
        style={{ textAlign: "center", marginTop: "auto" }}
        onClick={() => setShift((s) => s + 1)}
      >
        New inspiration ↻
      </button>
    </section>
  );
}
