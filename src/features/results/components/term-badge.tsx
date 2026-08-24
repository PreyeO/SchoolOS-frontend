import { CalendarRange } from "lucide-react";

// The term a results screen is acting on, shown beside its title.
//
// Distinct from the topbar's TermChip, which reads the school store, links to
// Sessions & Terms and hides itself below md. This one states the term the
// screen has actually resolved — the same value its queries are keyed on — so
// it belongs next to the heading, not in the shell.
//
// `isCurrent` matters now that the reading screens carry a term picker: someone
// looking at last term's broadsheet, or about to publish it, must not mistake it
// for the term the school is running. Entry screens have no picker and always
// pass true.
export function TermBadge({ label, isCurrent = true }: { label: string; isCurrent?: boolean }) {
  if (isCurrent) {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-n-200 bg-white px-2.5 py-1 text-xs text-n-600">
        <CalendarRange className="size-3.5 shrink-0 text-n-400" />
        {label}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-amber/50 bg-amber/10 px-2.5 py-1 text-xs text-ink">
      <CalendarRange className="size-3.5 shrink-0 text-amber" />
      {label}
      <span className="text-n-500">· not the current term</span>
    </span>
  );
}
