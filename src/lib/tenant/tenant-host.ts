// What a SchoolOS hostname means — the one place that decides.
//
// Two callers read hostnames and used to do it by different rules: proxy.ts
// (server, landing page vs /login) parsed by shape, getCurrentSchoolSlug
// (client, scoping a login to a school) by matching NEXT_PUBLIC_SCHOOL_DOMAIN.
// Different rules means they can disagree about the same host — a stale
// SCHOOL_DOMAIN had the proxy send a tenant to /login while the client then
// read no slug off that identical host. Both now come through here.
//
// The host SHAPE is the backend's, not ours. accounts/models.py computes
// School.subdomain as {slug}{SCHOOL_SUBDOMAIN_SUFFIX}.{SCHOOL_DOMAIN}, so a
// tenant host is not always {slug}.{apex}: hosted backend-dev sets that suffix
// to "-dev", making its tenants {slug}-dev.myschoolos.io — one DNS label, so
// the existing *.myschoolos.io wildcard still covers them.

// Mirrors RESERVED_SLUGS in the backend's accounts/constants.py, enforced by
// both School.clean() and SchoolCreateSerializer.validate_slug. No school can
// hold one of these, so a host built on one is platform infrastructure and
// never a tenant.
//
// `frontend` is the entry that matters right now. The dev frontend is deployed
// at frontend-dev.myschoolos.io, which under the rule above parses as slug
// `frontend` + the `-dev` hosting suffix — so without this list the whole dev
// environment would quietly try to be a school called "frontend": the landing
// page redirected to /login, and every login scoped to a school_slug the
// backend has never heard of.
const RESERVED_SLUGS = new Set([
  "api",
  "www",
  "app",
  "admin",
  "mail",
  "ftp",
  "staging",
  "dev",
  "test",
  "schoolos",
  "frontend",
]);

// The backend's RESERVED_SLUG_SUFFIX — the value hosted backend-dev gives
// SCHOOL_SUBDOMAIN_SUFFIX.
//
// Stripped unconditionally rather than read from an env var, and that is the
// point: the backend REJECTS any slug ending in `-dev` (School.clean and
// validate_slug both), so a trailing `-dev` on a host label can only be the
// hosting suffix — never part of a school's own slug. Config that has to be
// set correctly in two places is the failure this app has already had three
// times; an invariant the backend enforces cannot go stale.
const HOSTING_SUFFIX = "-dev";

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]", "lvh.me", "www.lvh.me"];

// Subdomains by shape, but never a school: preview deploys and tunnels.
// Without this every *.vercel.app preview would bounce its own landing page to
// /login and scope logins to a school named after the deployment.
const NON_TENANT_SUFFIXES = [".vercel.app", ".netlify.app", ".ngrok.io", ".ngrok-free.app"];

export interface HostInfo {
  /** The school this host addresses, or null when it addresses none. */
  slug: string | null;
  /** Hosting environment baked into the host: "" in production and locally, "-dev" on hosted dev. */
  environment: string;
}

function stripPort(host: string): string {
  return host.split(":")[0].toLowerCase().replace(/\.$/, "");
}

// Which deployment a host belongs to, read off the first label after
// stripping a `www.` prefix — www.fgc-dev.myschoolos.io is the same "-dev"
// environment as fgc-dev.myschoolos.io, the label just isn't first until www
// is peeled off. The pair frontend-dev.myschoolos.io / fgc-dev.myschoolos.io
// are the same environment; frontend-dev.myschoolos.io / fgc.myschoolos.io are
// not, despite sharing a registrable domain. Used to keep a session from being
// handed across that line — see lib/auth/handoff.
export function hostingEnvironment(host: string): string {
  const hostname = stripPort(host);
  const bare = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  const labels = bare.split(".");
  if (labels.length < 3) return "";
  return labels[0].endsWith(HOSTING_SUFFIX) ? HOSTING_SUFFIX : "";
}

// Decided by SHAPE first, configuration second — deliberately.
//
// The obvious implementation is "a tenant is anything ending in
// .{SCHOOL_DOMAIN}". That reads well and fails silently: point
// NEXT_PUBLIC_SCHOOL_DOMAIN at the wrong value (it was `schoolos.com` long
// after the real domain became `myschoolos.io`) and every tenant host stops
// matching, falls through to "no school", and quietly renders the landing
// page. No error, no log — just the wrong page, which is exactly how that was
// first reported.
//
// So instead: a host with three or more labels addresses a school unless it is
// explicitly known not to. Configuration can still name an apex, but getting
// it wrong no longer breaks the common case.
export function parseHost(host: string, schoolDomain: string): HostInfo {
  // Strip the port; both `localhost:3002` and `gcu.lvh.me:3002` arrive with one.
  const hostname = stripPort(host);
  if (!hostname) return { slug: null, environment: "" };

  const environment = hostingEnvironment(hostname);

  // Checked before the label count, since 127.0.0.1 has four.
  if (LOCAL_HOSTS.includes(hostname)) return { slug: null, environment };
  if (NON_TENANT_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return { slug: null, environment };
  }

  // `www` is a prefix, not an identity — strip it and judge what's underneath.
  //
  // Treating any `www.*` host as apex was wrong: `www.fggc.myschoolos.io` is a
  // school someone typed a `www.` in front of, not the marketing site, and it
  // was landing them on the marketing page. Stripping first means
  // `www.myschoolos.io` → `myschoolos.io` (no school) while
  // `www.fggc.myschoolos.io` → `fggc.myschoolos.io` (a school), which is what
  // both actually mean.
  const bare = hostname.startsWith("www.") ? hostname.slice(4) : hostname;

  // The configured apex. Still honoured — it's just no longer the only thing
  // keeping tenant detection working. Port-stripped because the backend's own
  // SCHOOL_DOMAIN carries one locally (`lvh.me:3002`) and the two settings are
  // meant to hold the same value.
  const apex = stripPort(schoolDomain);
  if (apex && bare === apex) return { slug: null, environment };

  // A bare registrable domain (`myschoolos.io`) has two labels; anything with
  // three or more (`fggc.myschoolos.io`) is a subdomain, i.e. a school.
  const labels = bare.split(".");
  if (labels.length < 3) return { slug: null, environment };

  // Peel the hosting suffix off before reading the slug: on hosted dev the
  // label is `fggc-dev`, and the school is `fggc`. Sending `fggc-dev` as
  // school_slug is a 400 from a backend that has no such school.
  const label = labels[0];
  const slug = environment ? label.slice(0, -environment.length) : label;
  if (!slug || RESERVED_SLUGS.has(slug)) return { slug: null, environment };

  return { slug, environment };
}
