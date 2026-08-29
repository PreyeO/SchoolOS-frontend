import { env } from "@/config/env";

// Derives the school slug from the current hostname when on a school subdomain
// (e.g. gcu.myschoolos.io → "gcu", or gcu.lvh.me for local testing). Returns null
// on the apex domain, localhost, or the www subdomain.
export function getCurrentSchoolSlug(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return null;

  const bases = [env.SCHOOL_DOMAIN, "lvh.me"];
  for (const base of bases) {
    if (host === base) return null;
    if (host.endsWith(`.${base}`)) {
      const sub = host.slice(0, -(base.length + 1)).split(".")[0];
      return sub && sub !== "www" ? sub : null;
    }
  }
  return null;
}
