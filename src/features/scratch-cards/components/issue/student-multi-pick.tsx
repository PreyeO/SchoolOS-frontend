"use client";

import { X } from "lucide-react";

import { PersonSearchSelect } from "@/components/shared/person-search-select";
import { getStudents } from "@/features/students/api/students-api";

export interface PickedStudent {
  id: string;
  name: string;
  admission_number: string;
}

interface Props {
  value: PickedStudent[];
  onChange: (next: PickedStudent[]) => void;
}

// Hand-picked students for a "selection" send: search, add, remove.
export function StudentMultiPick({ value, onChange }: Props) {
  const chosen = new Set(value.map((s) => s.id));
  return (
    <div className="space-y-2">
      <PersonSearchSelect
        queryKey="students"
        search={(q) => getStudents({ search: q, page_size: 10 }).then((r) => r.results.filter((s) => !chosen.has(s.id)))}
        getId={(s) => s.id}
        getLabel={(s) => `${s.user.first_name} ${s.user.last_name}`}
        getSubLabel={(s) => `Admission no. ${s.admission_number}`}
        onSelect={(s) =>
          onChange([...value, { id: s.id, name: `${s.user.first_name} ${s.user.last_name}`, admission_number: s.admission_number }])
        }
        placeholder="Student name or admission no."
      />
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Chosen students">
          {value.map((s) => (
            <li key={s.id} className="flex items-center gap-1 rounded-full border border-n-200 bg-n-50 py-0.5 pl-2.5 pr-1 text-xs text-ink">
              {s.name}
              <button
                type="button"
                aria-label={`Remove ${s.name}`}
                className="rounded-full p-0.5 text-n-400 hover:bg-n-100 hover:text-ink"
                onClick={() => onChange(value.filter((x) => x.id !== s.id))}
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
