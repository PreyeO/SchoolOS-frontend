import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://myschoolos.io";

// Public pages only — the signed-in app is deliberately absent (see robots.ts).
const PATHS = ["/", "/book-demo", "/signup", "/login", "/privacy", "/terms", "/data-protection"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    priority: path === "/" ? 1 : path === "/book-demo" ? 0.8 : 0.4,
  }));
}
