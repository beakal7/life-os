"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /login — email/password sign-in
// useSearchParams must be inside a <Suspense> boundary (Next.js 15 requirement).
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth";

// Inner component that reads searchParams — wrapped in Suspense below.
function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(
    callbackError === "auth_callback_failed"
      ? "Email confirmation failed. Please try again."
      : null
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const result = await signIn(email, password);
      if (result?.error) {
        setFormError(result.error);
      }
      // On success, signIn() calls redirect("/") server-side.
    });
  }

  return (
    <div style={cardStyle}>
      {/* Logo / title */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>◈</div>
        <h1 style={{ color: "var(--text, #e8e0f0)", fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          Life OS
        </h1>
        <p style={{ color: "var(--text-muted, #9b8fb0)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Sign in to your dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        {formError && (
          <p role="alert" style={errorStyle}>{formError}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            ...buttonStyle,
            opacity: isPending ? 0.7 : 1,
            cursor: isPending ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-muted, #9b8fb0)", fontSize: "0.875rem" }}>
        No account?{" "}
        <Link href="/signup" style={{ color: "var(--accent, #af8bf3)", textDecoration: "none" }}>
          Create one
        </Link>
      </p>
    </div>
  );
}

// Page export — wraps LoginForm in Suspense as required by Next.js 15.
export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ ...cardStyle, textAlign: "center", color: "var(--text-muted, #9b8fb0)" }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "var(--panel, #1a1228)",
  border: "1px solid var(--border, #2d2440)",
  borderRadius: "1rem",
  padding: "2.5rem",
  width: "100%",
  maxWidth: "400px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--text-muted, #9b8fb0)",
  fontSize: "0.8125rem",
  marginBottom: "0.375rem",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg, #100b18)",
  border: "1px solid var(--border, #2d2440)",
  borderRadius: "0.5rem",
  color: "var(--text, #e8e0f0)",
  fontSize: "0.9375rem",
  padding: "0.625rem 0.75rem",
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  background: "var(--accent, #af8bf3)",
  color: "#100b18",
  border: "none",
  borderRadius: "0.5rem",
  fontWeight: 700,
  fontSize: "0.9375rem",
  padding: "0.75rem",
  width: "100%",
  transition: "opacity 0.15s",
};

const errorStyle: React.CSSProperties = {
  color: "#f87171",
  fontSize: "0.875rem",
  margin: 0,
  padding: "0.5rem 0.75rem",
  background: "rgba(248,113,113,0.1)",
  borderRadius: "0.375rem",
};
