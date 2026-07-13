// Arm names are full labels now (e.g. "Primary 1 A"), not bare letters — this
// extracts the trailing letter so the next-letter logic still works.
function trailingLetter(armName: string): string {
  const match = armName.trim().match(/([A-Za-z])$/);
  return match ? match[1].toUpperCase() : "";
}

// Next letter given the ones already used: A → B → C … Falls back to a number
// once past Z or when existing arms don't end in a plain letter.
function nextLetter(existingLetters: string[]): string {
  const codes = existingLetters.filter((a) => /^[A-Z]$/.test(a)).map((a) => a.charCodeAt(0));

  if (codes.length === 0) return existingLetters.length === 0 ? "A" : String(existingLetters.length + 1);

  const max = Math.max(...codes);
  return max < 90 ? String.fromCharCode(max + 1) : String(existingLetters.length + 1);
}

// Builds the next full arm label for a class, e.g. ("Primary 1", ["Primary 1 A"]) → "Primary 1 B".
export function nextArmName(className: string, existingArmNames: string[]): string {
  const letters = existingArmNames.map(trailingLetter);
  return `${className} ${nextLetter(letters)}`.trim();
}
