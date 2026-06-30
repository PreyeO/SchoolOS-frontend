import { env } from "@/config/env";

// Use slug.lvh.me:PORT locally to test subdomain routing — lvh.me resolves to 127.0.0.1.
export function buildSchoolUrl(slug: string, path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${slug}.${env.SCHOOL_DOMAIN}${normalizedPath}`;
}
