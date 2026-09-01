// Partially hides an email for display where the reader needs to recognise a
// record but has no business contacting the person or correlating them
// elsewhere — the platform directory, where SchoolOS staff browse a school's
// teachers and parents.
//
// The domain is kept deliberately. It's the part that helps support ("they're
// on the school's own domain, not a personal address") and the part that
// identifies nobody on its own.
//
// A fixed three asterisks rather than one per hidden character, so the mask
// doesn't leak how long the address is.
const VISIBLE_PREFIX = 2;

export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  // No domain to preserve, so there is nothing safe to show.
  if (at <= 0) return "***";

  const local = email.slice(0, at);
  const domain = email.slice(at);

  // Too short to reveal any of without giving up most of it.
  if (local.length <= VISIBLE_PREFIX) return `***${domain}`;

  return `${local.slice(0, VISIBLE_PREFIX)}***${domain}`;
}
