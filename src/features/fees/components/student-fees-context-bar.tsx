"use client";

import { X } from "lucide-react";

import { PersonSearchSelect } from "@/components/shared/person-search-select";
import { TermPicker } from "@/components/shared/term-picker";
import { Button } from "@/components/ui/button";
import { getStudents } from "@/features/students/api/students-api";
import type { StudentListItem } from "@/features/students/types";
import type { PeriodOptionGroup } from "@/lib/school/period-options";

interface Props {
  student: StudentListItem | null;
  onStudentChange: (student: StudentListItem | null) => void;
  termGroups: PeriodOptionGroup[];
  periodId: string | null;
  onPeriodChange: (id: string) => void;
  // True for the one-render window between arriving via a deep link (?student=)
  // and that id resolving to a full record. Without it the search box flashes
  // before flipping to "Showing fees for X", which reads as the link failing
  // rather than loading.
  isResolvingStudent?: boolean;
}

// Which child, which term. The student is searched rather than picked from a
// list: a school has hundreds, the bursar already knows who is standing there,
// and the directory's ?search= covers name, email and admission number — so an
// admission number typed off a slip resolves in one go.
export function StudentFeesContextBar({
  student,
  onStudentChange,
  termGroups,
  periodId,
  onPeriodChange,
  isResolvingStudent,
}: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-n-200 bg-white p-4">
      {isResolvingStudent ? (
        <p className="text-sm text-n-400" role="status">
          Loading student…
        </p>
      ) : student ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-n-500">
            Showing fees for{" "}
            <span className="font-medium text-ink">
              {student.user.first_name} {student.user.last_name}
            </span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onStudentChange(null)}
          >
            <X className="size-3.5 mr-1" /> Change student
          </Button>
        </div>
      ) : (
        <PersonSearchSelect<StudentListItem>
          queryKey="students"
          search={async (query) => (await getStudents({ search: query, page_size: 10 })).results}
          getId={(s) => s.id}
          getLabel={(s) => `${s.user.first_name} ${s.user.last_name}`}
          getSubLabel={(s) =>
            s.current_class ? `${s.admission_number} · ${s.current_class.class_name}` : s.admission_number
          }
          onSelect={onStudentChange}
          placeholder="Search by name or admission number…"
        />
      )}

      <TermPicker groups={termGroups} value={periodId} onChange={onPeriodChange} label="Term" />
    </div>
  );
}
