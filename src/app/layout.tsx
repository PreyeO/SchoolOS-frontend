import type { Metadata, Viewport } from "next";

import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource/jetbrains-mono";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolos.com",
  ),
  title: { default: "SchoolOS", template: "%s | SchoolOS" },
  description:
    "The operating system for Nigerian K–12 schools. Results, fees, attendance — all in one place.",
  keywords: [
    "school management software Nigeria",
    "school management system",
    "Nigerian school software",
    "results management",
    "school fees collection",
    "attendance tracking",
    "NERDC",
    "WAEC",
    "NECO",
  ],
  authors: [{ name: "SchoolOS" }],
  creator: "SchoolOS",
  openGraph: {
    type: "website",
    siteName: "SchoolOS",
    title: "SchoolOS — School management built for Nigeria",
    description:
      "Compile a term's results in an afternoon. Collect fees online. Track attendance with one tap. Built for three terms, NERDC subjects, and the Nigerian school year.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SchoolOS — School management built for Nigeria",
    description:
      "Compile a term's results in an afternoon. Collect fees online. Track attendance with one tap.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0E2A24",
  width: "device-width",
  initialScale: 1,
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
