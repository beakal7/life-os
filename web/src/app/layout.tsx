import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life OS — Personal Command Center",
  description: "Life OS — your personal command center",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#100b18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
