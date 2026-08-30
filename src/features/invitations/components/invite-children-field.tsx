"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PersonSearchSelect } from "@/components/shared/person-search-select";
import { getStudents } from "@/features/students/api/students-api";
import type { StudentListItem } from "@/features/students/types";
import type { RelationshipType } from "@/features/parent-student-links/types";

const RELATIONSHIPS: RelationshipType[] = ["father", "mother", "guardian", "other"];

export interface ChildDraft {
  student_profile_id: string;
  name: string;
  admissionNumber: string;
  relationship: RelationshipType;
  is_primary_contact: boolean;
}

interface Props {
  value: ChildDraft[];
  onChange: (children: ChildDraft[]) => void;
}

// Children to link while inviting a parent.
//
// relationship is per child, not one setting for the whole invite: a parent can
// be mother to one pupil and guardian to another, and the backend requires the
// field with no default — a guessed value would be wrong for someone and the
// school would have to find it later.
//
// A student already added is filtered out of the search results, because the
// backend rejects the entire invite on a duplicate rather than skipping it.
export function InviteChildrenField({ value, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const chosen = new Set(value.map((c) => c.student_profile_id));

  function add(student: StudentListItem) {
    onChange([
      ...value,
      {
        student_profile_id: student.id,
        name: `${student.user.first_name} ${student.user.last_name}`,
        admissionNumber: student.admission_number,
        // No default relationship for the same reason the backend has none.
        relationship: "guardian",
        is_primary_contact: false,
      },
    ]);
    setAdding(false);
  }

  function update(id: string, patch: Partial<ChildDraft>) {
    onChange(value.map((c) => (c.student_profile_id === id ? { ...c, ...patch } : c)));
  }

  return (
    <div className="space-y-2">
      {value.map((child) => (
        <div key={child.student_profile_id} className="rounded-xl border border-n-200 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{child.name}</p>
              <p className="truncate text-xs text-n-500">Admission no. {child.admissionNumber}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${child.name}`}
              onClick={() => onChange(value.filter((c) => c.student_profile_id !== child.student_profile_id))}
            >
              <X className="size-3.5" />
            </Button>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <Select
              aria-label={`Relationship to ${child.name}`}
              value={child.relationship}
              onChange={(e) => update(child.student_profile_id, { relationship: e.target.value as RelationshipType })}
              className="h-8 w-auto capitalize"
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </Select>
            <label className="flex items-center gap-2 text-sm text-n-600">
              <input
                type="checkbox"
                className="accent-primary"
                checked={child.is_primary_contact}
                onChange={(e) => update(child.student_profile_id, { is_primary_contact: e.target.checked })}
              />
              Primary contact
            </label>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="rounded-xl border border-n-200 p-3">
          <PersonSearchSelect
            queryKey="students"
            search={(q) => getStudents({ search: q }).then((r) => r.results.filter((s) => !chosen.has(s.id)))}
            getId={(s) => s.id}
            getLabel={(s) => `${s.user.first_name} ${s.user.last_name}`}
            getSubLabel={(s) => `Admission no. ${s.admission_number}`}
            onSelect={add}
            placeholder="Search students by name or admission no…"
          />
          <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-3.5 mr-1" />
          {value.length === 0 ? "Link a child" : "Link another child"}
        </Button>
      )}
    </div>
  );
}
