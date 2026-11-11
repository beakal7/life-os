"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

const card: React.CSSProperties = {
  width: "100%", maxWidth: 380, background: "#1b1325", border: "1px solid #3a2a46",
  borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 12,
};
const input: React.CSSProperties = {
  background: "#251a31", border: "1px solid #453352", borderRadius: 10,
  padding: "11px 12px", color: "#fff", fontSize: 14,
};
const primary: React.CSSProperties = {
  background: "#8c5fb5", border: "none", borderRadius: 10, padding: "11px 12px",
  color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
};
const secondary: React.CSSProperties = {
  ...primary, background: "#251a31", border: "1px solid #453352", color: "#cfc0db", fontWeight: 500,
};

/** Client-side auth gate: renders children only when a Supabase session exists. */
export function AuthGate({ children }: { children: (session: Session) => ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let unsub = () => {};
    try {
      const sb = getSupabase();
      sb.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setReady(true);
      });
      const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
      unsub = () => data.subscription.unsubscribe();
    } catch (e) {
      setConfigError((e as Error).message);
      setReady(true);
    }
    return () => unsub();
  }, []);

  if (!ready) return <Centered><p>Loading…</p></Centered>;
  if (configError) return <Centered><div style={card}><h2>Configuration error</h2><p>{configError}</p></div></Centered>;
  if (!session) return <LoginScreen />;
  return <>{children(session)}</>;
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {children}
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    setBusy(false);
  };

  const signUp = async () => {
    if (!email || !password) return setMsg("Enter an email and password first.");
    setBusy(true); setMsg(null);
    const { data, error } = await getSupabase().auth.signUp({
      email, password, options: { emailRedirectTo: window.location.origin },
    });
    if (error) setMsg(error.message);
    else if (!data.session) setMsg("Check your email to confirm your account.");
    setBusy(false);
  };

  const magicLink = async () => {
    if (!email) return setMsg("Enter your email first.");
    setBusy(true); setMsg(null);
    const { error } = await getSupabase().auth.signInWithOtp({
      email, options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
    });
    setMsg(error ? error.message : "Magic link sent — check your email.");
    setBusy(false);
  };

  return (
    <Centered>
      <form onSubmit={signIn} style={card}>
        <div style={{ fontWeight: 850, fontSize: 24, letterSpacing: "-.8px" }}>
          LIFE<span style={{ color: "#d5a4f6" }}>OS</span> ✦
        </div>
        <p style={{ margin: 0, color: "#9c92a9", fontSize: 13 }}>Sign in to your command center.</p>
        <input style={input} type="email" placeholder="Email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={input} type="password" placeholder="Password" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={primary} type="submit" disabled={busy || !password}>Sign in</button>
        <button style={secondary} type="button" disabled={busy} onClick={magicLink}>Email me a magic link</button>
        <button style={{ ...secondary, background: "none", border: "none", fontSize: 12 }} type="button"
          disabled={busy} onClick={signUp}>Create account</button>
        {msg && <p role="status" style={{ margin: 0, fontSize: 13, color: "#e3c9f7" }}>{msg}</p>}
      </form>
    </Centered>
  );
}
