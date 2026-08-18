import { CalendarRange } from "lucide-react";

// The term a results screen is acting on, shown beside its title.
//
// Distinct from the topbar's TermChip, which reads the school store, links to
// Sessions & Terms and hides itself below md. This one states the term the
// screen has actually resolved from useScoreSheets — the same value its
// queries are keyed on — so it belongs next to the heading, not in the shell.
export function TermBadge({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-n-200 bg-white px-2.5 py-1 text-xs text-n-600">
      <CalendarRange className="size-3.5 shrink-0 text-n-400" />
      {label}
    </span>
  );
}
