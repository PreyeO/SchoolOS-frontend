import { Input } from "@/components/ui/input";
import { toLocalIsoDate } from "@/lib/text/format-date";

interface Props {
  action: string;
  onActionChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function AuditLogFilters({
  action,
  onActionChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  search,
  onSearchChange,
}: Props) {
  // Audit entries can't be dated in the future, so neither bound should offer one.
  const today = toLocalIsoDate();
  const invalidRange = !!dateFrom && !!dateTo && dateFrom > dateTo;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* Plain free text: the backend matches ?action= with icontains, so a
            partial like "deleted" spans every category while an exact
            "grade_range.created" narrows to one. */}
        <Input
          aria-label="Filter by action"
          placeholder="Filter by action, e.g. grade_range.created"
          value={action}
          onChange={(e) => onActionChange(e.target.value)}
          className="h-9 w-full sm:w-72"
        />

        <div className="flex items-center gap-1.5">
          <label htmlFor="audit-date-from" className="text-sm text-n-500">From</label>
          <Input
            id="audit-date-from"
            type="date"
            value={dateFrom}
            max={dateTo || today}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-9 w-auto"
          />
          <label htmlFor="audit-date-to" className="text-sm text-n-500">To</label>
          <Input
            id="audit-date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            max={today}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-9 w-auto"
          />
        </div>

        {/* The backend's SearchFilter covers the ACTOR's name/email only — not
            the person or record affected — so the placeholder promises exactly
            that and nothing more. */}
        <Input
          placeholder="Search by who did it…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full sm:ml-auto sm:w-56"
        />
      </div>

      {invalidRange && (
        <p role="alert" className="text-xs text-clay">
          The “From” date is after the “To” date, so no activity can match.
        </p>
      )}
    </div>
  );
}
