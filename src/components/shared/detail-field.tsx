// Shared label/value pair used across the Staff/Student/Parent detail pages.
// wrap-break-word: a value with no spaces (a student's synthetic email) would
// otherwise run past the card on a phone instead of wrapping.
export function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-n-400">{label}</p>
      <p className="mt-0.5 text-sm text-ink wrap-break-word">{value || "—"}</p>
    </div>
  );
}
