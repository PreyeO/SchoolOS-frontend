import type { Metadata, Viewport } from "next";

import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource/jetbrains-mono";

import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

// One description for the search snippet, Open Graph and Twitter so the three
// never drift apart. Kept under ~160 characters: WhatsApp and LinkedIn cut
// longer previews off mid-sentence.
const DESCRIPTION =
  "SchoolOS helps Nigerian schools compile results, collect fees and track attendance in one place, built for three terms and NERDC subjects.";
const SHARE_TITLE = "SchoolOS: School management built for Nigeria";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://myschoolos.io",
  ),
  title: { default: "SchoolOS", template: "%s | SchoolOS" },
  description: DESCRIPTION,
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
  // iOS reads these rather than the manifest for a home-screen web app.
  //
  // `title` is the one that matters most: without it the home-screen label comes
  // from the page <title>, and this app's template is "%s | SchoolOS" — so
  // installing from /dashboard would label the icon "Dashboard". `capable` keeps
  // it launching chrome-free on iOS below 16.4, where Safari doesn't yet read
  // the manifest's display: standalone.
  //
  // statusBarStyle stays "default" deliberately: "black-translucent" pushes the
  // page content up under the notch, which needs safe-area padding this layout
  // doesn't have.
  appleWebApp: {
    capable: true,
    title: "SchoolOS",
    statusBarStyle: "default",
  },
  // og:image comes from app/opengraph-image.tsx (1200x630), picked up by file
  // convention — don't also list `images` here or it's emitted twice.
  openGraph: {
    type: "website",
    siteName: "SchoolOS",
    url: "/",
    locale: "en_NG",
    title: SHARE_TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: DESCRIPTION,
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
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
