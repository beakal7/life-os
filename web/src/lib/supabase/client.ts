// ─────────────────────────────────────────────────────────────────────────────
// Supabase browser client
//
// Use this in Client Components ("use client") only.
// Creates one instance per browser tab via module-level singleton.
// ─────────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
