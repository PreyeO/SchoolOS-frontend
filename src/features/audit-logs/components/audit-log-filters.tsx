import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toLocalIsoDate } from "@/lib/text/format-date";

import { ACTION_FILTER_GROUPS } from "../lib/action-options";

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
        {/* A grouped picker of the exact 82 action strings the catalog knows
            about (see action-options.ts), rather than free text — an admin
            was never going to type "grade_range.created" from memory. Still
            sends one exact string through the backend's ?action= icontains
            filter, so no backend change was needed. */}
        <Select
          aria-label="Filter by action"
          value={action}
          onChange={(e) => onActionChange(e.target.value)}
          className="h-9 w-full sm:w-64"
        >
          <option value="">All actions</option>
          {ACTION_FILTER_GROUPS.map((group) => (
            <optgroup key={group.key} label={group.label}>
              {group.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>

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
