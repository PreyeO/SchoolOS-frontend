// The host the VISITOR typed, which is not always the Host header.
//
// Cloudflare sits in front of Vercel here and proxies to the deployment's own
// hostname, so by the time a request reaches the app the Host header reads
// `school-os-chi.vercel.app` rather than `fggc.myschoolos.io`. The original
// survives in a forwarded header — the Cloudflare rule sets `X-SchoolOS-Host`,
// and most proxies also set the semi-standard `X-Forwarded-Host`.
//
// Reading Host alone made every tenant look like a Vercel preview, so the
// proxy classified them apex and served the landing page. That was invisible
// from the outside: the page rendered fine, it was just the wrong one.
//
// Order matters. The explicit rule header wins, then the conventional one,
// then the real Host for direct-to-Vercel or local requests.
const FORWARDED_HOST_HEADERS = ["x-schoolos-host", "x-forwarded-host"];

// A forwarded header can carry a comma-separated chain when several proxies
// have appended to it; the first entry is the original client-facing host.
function firstHost(value: string): string {
  return value.split(",")[0].trim();
}

export function resolveRequestHost(headers: Headers): string {
  for (const name of FORWARDED_HOST_HEADERS) {
    const value = headers.get(name);
    if (value) {
      const host = firstHost(value);
      if (host) return host;
    }
  }
  return headers.get("host") ?? "";
}
