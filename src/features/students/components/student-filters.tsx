import { Input } from "@/components/ui/input";
import { enrollmentStatusLabel, genderLabel } from "../lib/labels";
import type { EnrollmentStatus, Gender } from "../types";

const GENDERS: Gender[] = ["male", "female", "other"];
const STATUSES: EnrollmentStatus[] = ["active", "graduated", "transferred", "withdrawn", "suspended", "expelled"];

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  gender: Gender | "all";
  onGenderChange: (value: Gender | "all") => void;
  status: EnrollmentStatus | "all";
  onStatusChange: (value: EnrollmentStatus | "all") => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
}

export function StudentFilters({
  search,
  onSearchChange,
  gender,
  onGenderChange,
  status,
  onStatusChange,
  showInactive,
  onShowInactiveChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Filter by enrollment status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as EnrollmentStatus | "all")}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
      >
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {enrollmentStatusLabel(s)}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by gender"
        value={gender}
        onChange={(e) => onGenderChange(e.target.value as Gender | "all")}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
      >
        <option value="all">All genders</option>
        {GENDERS.map((g) => (
          <option key={g} value={g}>
            {genderLabel(g)}
          </option>
        ))}
      </select>

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
        placeholder="Search by name, email, or admission no…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="ml-auto h-9 max-w-xs"
      />
    </div>
  );
}
