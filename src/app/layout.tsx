// Root layout — loads fonts and wires providers. No page chrome here.
// Fonts are served from node_modules via @fontsource (zero network requests).
import type { Metadata } from "next";

import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource/jetbrains-mono";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SchoolOS", template: "%s | SchoolOS" },
  description:
    "The operating system for Nigerian K–12 schools. Results, fees, attendance — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
