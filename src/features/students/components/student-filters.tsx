import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ArmOptionGroup } from "@/lib/school/arm-options";
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
  armGroups: ArmOptionGroup[];
  classArmId: string | "all";
  onClassArmChange: (value: string | "all") => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
  admittedAfter: string;
  onAdmittedAfterChange: (value: string) => void;
  admittedBefore: string;
  onAdmittedBeforeChange: (value: string) => void;
}

export function StudentFilters({
  search,
  onSearchChange,
  gender,
  onGenderChange,
  status,
  onStatusChange,
  armGroups,
  classArmId,
  onClassArmChange,
  showInactive,
  onShowInactiveChange,
  admittedAfter,
  onAdmittedAfterChange,
  admittedBefore,
  onAdmittedBeforeChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Resolved server-side to each student's *current* enrolment, so a
          mid-session transfer shows up under the arm they're in now. */}
      <Select
        aria-label="Filter by class"
        value={classArmId}
        onChange={(e) => onClassArmChange(e.target.value)}
      >
        <option value="all">All classes</option>
        {armGroups.map((group) => (
          <optgroup key={group.level} label={group.levelLabel}>
            {group.options.map((option) => (
              <option key={option.armId} value={option.armId}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>

      <Select
        aria-label="Filter by enrollment status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as EnrollmentStatus | "all")}
      >
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {enrollmentStatusLabel(s)}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by gender"
        value={gender}
        onChange={(e) => onGenderChange(e.target.value as Gender | "all")}
      >
        <option value="all">All genders</option>
        {GENDERS.map((g) => (
          <option key={g} value={g}>
            {genderLabel(g)}
          </option>
        ))}
      </Select>

      {/* Admitted-between, not enrolled-between: this is when they joined the
          school, which is what an intake report asks about. A student admitted
          in 2023 is still "admitted 2023" whatever class they're in now. */}
      <label className="flex items-center gap-1.5 text-sm text-n-500">
        Admitted
        <Input
          type="date"
          aria-label="Admitted on or after"
          value={admittedAfter}
          onChange={(e) => onAdmittedAfterChange(e.target.value)}
          className="h-9 w-38"
        />
      </label>
      <label className="flex items-center gap-1.5 text-sm text-n-500">
        to
        <Input
          type="date"
          aria-label="Admitted on or before"
          value={admittedBefore}
          onChange={(e) => onAdmittedBeforeChange(e.target.value)}
          className="h-9 w-38"
        />
      </label>

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
