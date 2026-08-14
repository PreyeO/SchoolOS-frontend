import type { MetadataRoute } from "next";

// Next 16 convention: app/manifest.ts, not public/manifest.json — the docs are
// explicit that a manifest in public/ is ignored.
//
// The point of installing SchoolOS is attendance: a teacher opening a register
// on a phone in a classroom with no signal. Hence start_url and the shortcut
// both point at /attendance rather than the dashboard.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SchoolOS",
    short_name: "SchoolOS",
    description:
      "Run your school — attendance, classes, results and fees. Mark registers even with no network.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0E2A24",
    theme_color: "#0E2A24",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Take register",
        short_name: "Register",
        description: "Mark today's attendance",
        url: "/attendance",
      },
    ],
  };
}
