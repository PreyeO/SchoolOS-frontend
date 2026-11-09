// A fresh key for one billed or PIN-issuing write (card issuance, replace,
// resolve). Make it once when the admin opens the action, and send the SAME
// key on every retry of that action: the server treats a repeated key as the
// same request, and a new key as a new issuance that takes another card or
// spends more credits.
//
// crypto.randomUUID exists only in secure contexts. Local school subdomains
// run on plain-http lvh.me, where it is undefined, so fall back to building a
// v4 UUID from getRandomValues, which works everywhere.
export function newIdempotencyKey(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
