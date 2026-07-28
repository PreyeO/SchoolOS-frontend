"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PersonSearchSelect } from "@/components/shared/person-search-select";
import { getStudents } from "@/features/students/api/students-api";
import type { StudentListItem } from "@/features/students/types";
import { useCreateParentStudentLink } from "@/features/parent-student-links/hooks/use-create-parent-student-link";
import type { RelationshipType } from "@/features/parent-student-links/types";

import { PARENT_DETAIL_QUERY_KEY } from "../hooks/use-parent-detail";

const RELATIONSHIPS: RelationshipType[] = ["father", "mother", "guardian", "other"];

export function LinkStudentDialog({ parentId }: { parentId: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StudentListItem | null>(null);
  const [relationship, setRelationship] = useState<RelationshipType>("father");
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const createLink = useCreateParentStudentLink();
  const queryClient = useQueryClient();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setSelected(null);
      setRelationship("father");
      setIsPrimaryContact(false);
    }
  }

  async function submit() {
    if (!selected) return;
    try {
      await createLink.mutateAsync({
        parent_profile_id: parentId,
        student_profile_id: selected.id,
        relationship,
        is_primary_contact: isPrimaryContact,
      });
      queryClient.invalidateQueries({ queryKey: PARENT_DETAIL_QUERY_KEY(parentId) });
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">Link a student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link a student</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {selected ? (
            <div className="flex items-center justify-between rounded-lg border border-n-200 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {selected.user.first_name} {selected.user.last_name}
                </p>
                <p className="truncate text-xs text-n-500">Admission no. {selected.admission_number}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Change
              </Button>
            </div>
          ) : (
            <PersonSearchSelect
              queryKey="students"
              search={(q) => getStudents({ search: q }).then((r) => r.results)}
              getId={(s) => s.id}
              getLabel={(s) => `${s.user.first_name} ${s.user.last_name}`}
              getSubLabel={(s) => `Admission no. ${s.admission_number}`}
              onSelect={(student) => setSelected(student)}
              placeholder="Search students by name or admission no…"
            />
          )}

          {selected && (
            <>
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">Relationship</p>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm capitalize"
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r} className="capitalize">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={isPrimaryContact}
                  onChange={(e) => setIsPrimaryContact(e.target.checked)}
                />
                Primary contact
              </label>
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={!selected || createLink.isPending}>
            {createLink.isPending ? "Linking…" : "Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
