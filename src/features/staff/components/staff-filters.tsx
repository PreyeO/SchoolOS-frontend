import { Input } from "@/components/ui/input";
import { teacherTypeLabel } from "../lib/teacher-type-label";
import type { TeacherType } from "../types";

const TEACHER_TYPES: TeacherType[] = ["class", "subject", "both"];

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  teacherType: TeacherType | "all";
  onTeacherTypeChange: (value: TeacherType | "all") => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
}

export function StaffFilters({
  search,
  onSearchChange,
  teacherType,
  onTeacherTypeChange,
  showInactive,
  onShowInactiveChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Filter by teacher type"
        value={teacherType}
        onChange={(e) => onTeacherTypeChange(e.target.value as TeacherType | "all")}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
      >
        <option value="all">All types</option>
        {TEACHER_TYPES.map((type) => (
          <option key={type} value={type}>
            {teacherTypeLabel(type)}
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
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="ml-auto h-9 max-w-xs"
      />
    </div>
  );
}
