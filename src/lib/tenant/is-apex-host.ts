import { parseHost } from "./tenant-host";

// Whether a Host header is the marketing apex (landing page) or a school's
// tenant subdomain (straight to /login).
//
// Thin on purpose: the rules for reading a hostname — the `-dev` hosting
// suffix, reserved slugs, www, previews — live in tenant-host.ts, so the proxy
// and the client's getCurrentSchoolSlug cannot drift apart on what a given
// host means. See the notes there.
//
// "Apex" here means only "addresses no school". frontend-dev.myschoolos.io is
// apex by that definition: it is the dev frontend's own host, not a tenant.
export function isApexHost(host: string, schoolDomain: string): boolean {
  return parseHost(host, schoolDomain).slug === null;
}
