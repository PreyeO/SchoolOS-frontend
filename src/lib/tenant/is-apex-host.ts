// Whether a Host header is the marketing apex (landing page) or a school's
// tenant subdomain (straight to /login).
//
// Decided by SHAPE first, configuration second — deliberately.
//
// The obvious implementation is "a tenant is anything ending in
// .{SCHOOL_DOMAIN}". That reads well and fails silently: point
// NEXT_PUBLIC_SCHOOL_DOMAIN at the wrong value (it was `schoolos.com` long
// after the real domain became `myschoolos.io`) and every tenant host stops
// matching, falls through to "unrecognised", and quietly renders the landing
// page. No error, no log — just the wrong page, which is exactly how this was
// first reported.
//
// So instead: a host with three or more labels is a tenant unless it is
// explicitly known not to be. Configuration can still add an apex, but getting
// it wrong no longer breaks the common case.
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]", "lvh.me", "www.lvh.me"];

// Platform hosts that are subdomains by shape but never a school: preview
// deploys and the like. Without this, every *.vercel.app preview would bounce
// its own landing page to /login.
const NON_TENANT_SUFFIXES = [".vercel.app", ".netlify.app", ".ngrok.io", ".ngrok-free.app"];

export function isApexHost(host: string, schoolDomain: string): boolean {
  // Strip the port; both `localhost:3002` and `gcu.lvh.me:3002` arrive with one.
  const hostname = host.split(":")[0].toLowerCase().replace(/\.$/, "");
  if (!hostname) return true;

  // Checked before the label count, since 127.0.0.1 has four.
  if (LOCAL_HOSTS.includes(hostname)) return true;

  if (NON_TENANT_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) return true;

  // `www` is a prefix, not an identity — strip it and judge what's underneath.
  //
  // Treating any `www.*` host as apex was wrong: `www.fggc.myschoolos.io` is a
  // school someone typed a `www.` in front of, not the marketing site, and it
  // was landing them on the marketing page. Stripping first means
  // `www.myschoolos.io` → `myschoolos.io` (apex) while
  // `www.fggc.myschoolos.io` → `fggc.myschoolos.io` (tenant), which is what
  // both actually mean.
  const bare = hostname.startsWith("www.") ? hostname.slice(4) : hostname;

  // The configured apex. Still honoured — it's just no longer the only thing
  // keeping tenant detection working.
  const apex = schoolDomain.toLowerCase();
  if (apex && bare === apex) return true;

  // A bare registrable domain (`myschoolos.io`) has two labels; anything with
  // three or more (`fggc.myschoolos.io`) is a subdomain, i.e. a school.
  return bare.split(".").length < 3;
}
