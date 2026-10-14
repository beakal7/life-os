import { AppShell } from "@/components/AppShell";

// Root page — server component (no client state here).
// All interactivity lives inside AppShell (client component).
export default function Home() {
  return <AppShell />;
}
