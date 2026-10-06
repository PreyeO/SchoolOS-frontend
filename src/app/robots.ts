import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://myschoolos.io";

// Marketing pages are crawlable; everything behind a login is not — those pages
// would only show Google a redirect to /login, and indexing them wastes crawl.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard", "/platform", "/api/", "/auth-handoff", "/accept-invite/",
        "/onboarding", "/verify-otp", "/reset-password", "/offline",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
