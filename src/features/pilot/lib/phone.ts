// Accepts a leading 0, unlike the stricter E.164 pattern used on the invite
// forms. "08012345678" is how a Nigerian writes their own number, and this is a
// marketing form: rejecting the most natural spelling loses the lead rather
// than improving the data.
const PHONE_PATTERN = /^\+?\d{7,15}$/;

export function stripPhoneSpacing(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

export function isValidPhone(value: string): boolean {
  const cleaned = stripPhoneSpacing(value);
  // "+234" alone is the prefilled default, so it counts as empty rather than
  // passing as a seven-character "number".
  if (!cleaned || cleaned === "+234") return false;
  return PHONE_PATTERN.test(cleaned);
}

// Normalises the one unambiguous local case: a standard 11-digit Nigerian
// mobile written with a leading 0 becomes +234…, so leads arrive in a
// consistent format.
//
// Deliberately narrow. Anything else — a number already in +234 form, a foreign
// number, an unusual length — is passed through untouched, because guessing a
// country code onto it would corrupt a real number to make a tidier string.
export function normalisePhone(value: string): string {
  const cleaned = stripPhoneSpacing(value);
  if (/^0\d{10}$/.test(cleaned)) return `+234${cleaned.slice(1)}`;
  return cleaned;
}
