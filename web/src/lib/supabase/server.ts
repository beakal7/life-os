// ─────────────────────────────────────────────────────────────────────────────
// Supabase server client
//
// Use this in Server Components, API routes, and middleware only.
// Creates a NEW instance per request — never share across requests.
// Uses @supabase/ssr with getAll/setAll cookie handlers per the docs.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component where cookies cannot be
            // written. The middleware handles session refresh, so this is safe.
          }
        },
      },
    }
  );
}
