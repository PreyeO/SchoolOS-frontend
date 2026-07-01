// Next arm label for a class: A → B → C … based on the letters already used.
// Falls back to a numbered arm once past Z or when existing arms aren't letters.
export function nextArm(existing: string[]): string {
  const codes = existing
    .map((a) => a.trim().toUpperCase())
    .filter((a) => /^[A-Z]$/.test(a))
    .map((a) => a.charCodeAt(0));

  if (codes.length === 0) return existing.length === 0 ? "A" : String(existing.length + 1);

  const max = Math.max(...codes);
  return max < 90 ? String.fromCharCode(max + 1) : String(existing.length + 1);
}
