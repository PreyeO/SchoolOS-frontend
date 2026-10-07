import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://myschoolos.io";

// Public marketing and legal pages only — the signed-in app is deliberately
// absent (see robots.ts), and so are /login and /signup: utility pages with
// nothing for a searcher to land on.
const PATHS = ["/", "/book-demo", "/privacy", "/terms", "/data-protection"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    priority: path === "/" ? 1 : path === "/book-demo" ? 0.8 : 0.4,
  }));
}
