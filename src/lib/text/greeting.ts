// "Good morning" / "Good afternoon" / "Good evening", off the viewer's own
// clock. Every persona's home screen opens with one, and this was four
// byte-identical copies (admin, teacher, parent, student) before it was pulled
// out here — the same consolidation TermBadge and NoCurrentTermNotice got.
//
// Deliberately returns the greeting alone, never "greeting, name": the name is
// the caller's to supply, and a caller whose name hasn't arrived yet renders the
// bare greeting rather than a comma with nothing after it.
export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
