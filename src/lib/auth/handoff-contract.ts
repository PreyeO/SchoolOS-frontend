import { env } from "@/config/env";

// The two halves of the cross-subdomain session hand-off share this file so the
// message shape and the origin allowlist can't drift apart. Getting either
// wrong fails closed (no hand-off, stay on the apex) rather than open, but a
// silent mismatch would be hard to spot from the outside.

export const HANDOFF_REQUEST = "schoolos:auth-handoff" as const;
export const HANDOFF_ACK = "schoolos:auth-handoff:ok" as const;

export const HANDOFF_PATH = "/auth-bridge";

// How long the apex waits for the subdomain to confirm it stored the tokens.
// On timeout the caller stays put with a working session, so this only trades a
// nicer URL for a short delay — never access.
export const HANDOFF_TIMEOUT_MS = 2500;

export interface HandoffMessage {
  type: typeof HANDOFF_REQUEST;
  access: string;
  refresh: string;
}

// Origins allowed to hand a session TO a subdomain: the apex only.
//
// This is the security boundary. Any page that can postMessage to the bridge
// can plant a session, so the bridge accepts messages from nowhere else — and
// notably not from another school's subdomain, which would otherwise let one
// tenant write tokens into another's origin.
export function isTrustedHandoffOrigin(origin: string): boolean {
  const domain = env.SCHOOL_DOMAIN;
  const allowed = [`https://${domain}`, `https://www.${domain}`];

  // Local development, where subdomain routing is tested over lvh.me.
  if (process.env.NODE_ENV !== "production") {
    allowed.push("http://localhost:3000", "http://lvh.me:3000", "http://www.lvh.me:3000");
  }

  return allowed.includes(origin);
}

export function handoffUrl(slug: string): string {
  return `https://${slug}.${env.SCHOOL_DOMAIN}${HANDOFF_PATH}`;
}

export function schoolOrigin(slug: string): string {
  return `https://${slug}.${env.SCHOOL_DOMAIN}`;
}
