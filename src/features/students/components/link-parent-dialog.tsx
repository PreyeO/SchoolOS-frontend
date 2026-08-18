"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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
import { getParents } from "@/features/parents/api/parents-api";
import type { ParentListItem } from "@/features/parents/types";
import { useCreateParentStudentLink } from "@/features/parent-student-links/hooks/use-create-parent-student-link";
import type { RelationshipType } from "@/features/parent-student-links/types";

import { STUDENT_DETAIL_QUERY_KEY } from "../hooks/use-student-detail";

const RELATIONSHIPS: RelationshipType[] = ["father", "mother", "guardian", "other"];

export function LinkParentDialog({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ParentListItem | null>(null);
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
        parent_profile_id: selected.id,
        student_profile_id: studentId,
        relationship,
        is_primary_contact: isPrimaryContact,
      });
      queryClient.invalidateQueries({ queryKey: STUDENT_DETAIL_QUERY_KEY(studentId) });
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">Link a parent</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link a parent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {selected ? (
            <div className="flex items-center justify-between rounded-lg border border-n-200 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {selected.user.first_name} {selected.user.last_name}
                </p>
                <p className="truncate text-xs text-n-500">{selected.user.email}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Change
              </Button>
            </div>
          ) : (
            <PersonSearchSelect
              queryKey="parents"
              search={(q) => getParents({ search: q }).then((r) => r.results)}
              getId={(p) => p.id}
              getLabel={(p) => `${p.user.first_name} ${p.user.last_name}`}
              getSubLabel={(p) => p.user.email}
              onSelect={(parent) => setSelected(parent)}
              placeholder="Search parents by name or email…"
            />
          )}

          {selected && (
            <>
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">Relationship</p>
                <Select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm capitalize"
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r} className="capitalize">
                      {r}
                    </option>
                  ))}
                </Select>
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
