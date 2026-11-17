// Nigerian mobile numbers, the way the backend's messaging/utils.py reads
// them. The server is the authority (it also rejects fixed lines, which needs
// a numbering-plan lookup this doesn't do); this only catches the obvious
// typo before a round trip, and formats numbers for reading.

// 0803…, 803… (Excel dropped the zero), 234803…, +234803…, with any spaces
// or dashes. Returns the 10 national digits after the 0, or null.
function nationalDigits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && /^[789]/.test(digits)) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 13 && digits.startsWith("234")) return digits.slice(3);
  return null;
}

// Shape only: ten national digits starting 7, 8 or 9. Deliberately looser than
// the server (which checks real allocated ranges and rejects fixed lines), so
// this can never block a number the server would accept.
export function looksLikeNigerianMobile(raw: string): boolean {
  const national = nationalDigits(raw);
  return national !== null && /^[789]/.test(national);
}

// What we send. The serializer's PhoneNumberField parses the value before the
// service's own normaliser sees it, so hand it unambiguous E.164 rather than
// "803…" or "0803 123-4567". Unparseable input goes through as typed, for the
// server to reject with its own message.
export function toE164(raw: string): string {
  const national = nationalDigits(raw);
  return national ? `+234${national}` : raw.trim();
}

// "+2348031234567" → "0803 123 4567", the way people write it here. Anything
// that doesn't parse is shown as stored rather than hidden.
export function formatNigerianPhone(stored: string): string {
  const national = nationalDigits(stored);
  if (!national) return stored;
  const local = `0${national}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
