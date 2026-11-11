"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/auth/AuthGate";

// Static-exported page: auth is enforced client-side; data is protected by RLS.
export default function Home() {
  return <AuthGate>{(session) => <AppShell key={session.user.id} session={session} />}</AuthGate>;
}
