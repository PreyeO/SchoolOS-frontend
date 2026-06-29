// Static site-wide config (nav structure, social links, SEO defaults).
// TODO (Phase 2): populate with real nav items and metadata.
import { env } from "@/config/env";

export const siteConfig = {
  name: env.appName,
  url: env.appUrl,
  description: "Smart school management for Nigerian K–12 schools.",
  ogImage: `${env.appUrl}/images/og.png`,
} as const;
