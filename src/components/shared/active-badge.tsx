// Shared across the Staff/Student/Parent directories — reflects
// membership.is_active, the single source of truth for whether a person's
// school relationship is active (not a school-color concept, so grass/n-400
// rather than primary/accent — same rule as InviteStatusBadge).
export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        isActive ? "bg-grass/10 text-grass" : "bg-n-100 text-n-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
