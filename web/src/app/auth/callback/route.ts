// ─────────────────────────────────────────────────────────────────────────────
// /auth/callback — email-confirmation and OAuth callback handler
//
// Supabase sends the user here after they click the confirmation link in their
// email. This route exchanges the one-time `code` for a persistent session
// (PKCE flow) and redirects to the dashboard.
//
// The redirect URL registered in Supabase must match this route:
//   Local:      http://localhost:3000/auth/callback
//   Production: https://<your-vercel-domain>/auth/callback
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  // `next` lets Supabase (or your own emails) deep-link after confirmation.
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Use the request origin so the redirect works both locally and on Vercel.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send the user to an error state on the login page.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
