// ─────────────────────────────────────────────────────────────────────────────
// Next.js middleware — session refresh + route protection
//
// Runs on every request matched by config.matcher.
// Responsibilities:
//   1. Refresh the Supabase session if expired — writes updated cookies to the
//      response BEFORE any rendering happens.
//   2. Protect the dashboard (/): unauthenticated → redirect to /login.
//   3. Redirect authenticated users away from /login and /signup → /.
//
// SECURITY: uses getUser(), not getSession(). getUser() calls the Supabase
// Auth server to verify the JWT — it cannot be spoofed by a tampered cookie.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto both the forwarded request and the response so
          // the refreshed session reaches the next handler AND the browser.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Call getUser() unconditionally so token refresh (if needed) runs and the
  // updated session cookies are committed to the response.
  // NEVER use getSession() here — it trusts the cookie without server-side
  // verification.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isAuthCallback = pathname.startsWith("/auth/callback");

  // Always allow the email-confirmation callback through.
  if (isAuthCallback) {
    return supabaseResponse;
  }

  // Unauthenticated user trying to reach the protected dashboard.
  if (!user && !isAuthRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting a sign-in or sign-up page — send to dashboard.
  if (user && isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match every path except:
     *   _next/static   — static file serving
     *   _next/image    — image optimisation
     *   favicon.ico
     *   public assets  — svg, png, jpg, jpeg, gif, webp, ico, txt
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)",
  ],
};
