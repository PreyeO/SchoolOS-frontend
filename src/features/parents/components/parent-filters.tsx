import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NIGERIAN_STATES } from "@/data/nigerian-states";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  state: string;
  onStateChange: (value: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
}

export function ParentFilters({
  search,
  onSearchChange,
  state,
  onStateChange,
  showInactive,
  onShowInactiveChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        aria-label="Filter by state"
        value={state}
        onChange={(e) => onStateChange(e.target.value)}
      >
        <option value="">All states</option>
        {NIGERIAN_STATES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>

      <label className="flex items-center gap-1.5 text-sm text-n-500">
        <input
          type="checkbox"
          className="accent-primary"
          checked={showInactive}
          onChange={(e) => onShowInactiveChange(e.target.checked)}
        />
        Show inactive
      </label>

      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="ml-auto h-9 max-w-xs"
      />
    </div>
  );
}
