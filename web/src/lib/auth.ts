// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers — thin wrappers around Supabase Auth
//
// All server-side. Import from Client Components only where marked.
// Never store credentials here; read them from env vars at call time.
// ─────────────────────────────────────────────────────────────────────────────

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ── Shared error helper ───────────────────────────────────────────────────────
// Converts any thrown value (network error, Supabase AuthError, unknown) into a
// plain string that the UI can display.  A raw "fetch failed" from Node.js is
// caught here and replaced with an actionable message.

function toMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    // Node.js fetch failure — DNS / TLS / network unreachable
    if (msg.includes("fetch failed") || msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) {
      return "Cannot reach the authentication server. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set to real values in .env.local, then restart the dev server.";
    }
    return msg;
  }
  return "An unexpected error occurred. Please try again.";
}

// ── Sign up ───────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // After email confirmation the user lands back on the dashboard.
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message, pendingConfirmation: false };
    }

    return { error: null, pendingConfirmation: true };
  } catch (err) {
    return { error: toMessage(err), pendingConfirmation: false };
  }
}

// ── Sign in ───────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    return { error: toMessage(err) };
  }

  // redirect() must be called outside try/catch — it throws internally.
  redirect("/");
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Sign-out failure is non-critical — redirect to login regardless.
  }
  redirect("/login");
}

// ── Get verified user (server-side) ──────────────────────────────────────────
//
// Uses getUser() — verifies the JWT with the Supabase Auth server.
// Use this anywhere server-side identity must be trusted.
// Never use getSession() alone for authorization.

export async function getVerifiedUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
