// Marks a class arm or subject that was removed while history depended on it.
//
// The row is still there because its scores, attendance and results still point
// at it — deleting it would have orphaned them, which is exactly what this
// backend change stopped doing. So it has to stay visible on management
// screens, and it has to be obviously not-live, or an admin reads a stale arm
// as a current one.
//
// Neutral grey, not clay: nothing is wrong here and nobody needs to act. It's
// a state, not a warning — and it's permanent, since there is no reactivate
// endpoint. Restoring means creating a new arm or subject with the same name,
// which the backend now allows because uniqueness only applies to active rows.
export function DeactivatedBadge() {
  return (
    <span
      className="shrink-0 rounded-full bg-n-100 px-2 py-0.5 text-[11px] font-medium text-n-500"
      title="Removed, but kept because past records depend on it"
    >
      Deactivated
    </span>
  );
}
