// ─────────────────────────────────────────────────────────────────────────────
// Auth layout — centers the login/signup card, no dashboard navigation.
// Preserves the dark purple Life OS design tokens.
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #100b18)",
        padding: "1rem",
      }}
    >
      {children}
    </div>
  );
}
