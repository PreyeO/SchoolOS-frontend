import { env } from "@/config/env";

import { parseHost } from "./tenant-host";

// The school slug the current hostname addresses — "fggc" on
// fggc.myschoolos.io, on fggc-dev.myschoolos.io (hosted dev inserts a `-dev`
// hosting suffix the backend strips from the slug), and on fggc.lvh.me for
// local subdomain testing. Null on the apex, on localhost, on preview deploys,
// and on platform hosts like frontend-dev.myschoolos.io.
//
// Shares parseHost with the proxy deliberately: this answer and "does the root
// of this host redirect to /login" have to agree, and when they were computed
// by separate rules they didn't.
export function getCurrentSchoolSlug(): string | null {
  if (typeof window === "undefined") return null;
  return parseHost(window.location.hostname, env.SCHOOL_DOMAIN).slug;
}
