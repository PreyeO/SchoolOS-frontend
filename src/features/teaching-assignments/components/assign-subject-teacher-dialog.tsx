"use client";

import { useState } from "react";
import { Check, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTeachers } from "@/features/staff/hooks/use-teachers";
import { teacherTypeLabel } from "@/features/staff/lib/teacher-type-label";
import type { SubjectResponse } from "@/features/onboarding/types";

import { useCreateAssignments } from "../hooks/use-assignment-mutations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classArmId: string;
  armLabel: string;
  subject: SubjectResponse;
  // Teachers already teaching this subject to this arm — excluded from the list,
  // since the backend rejects a duplicate (class_arm, subject, teacher) triple.
  alreadyAssignedIds: string[];
}

// Controlled rather than trigger-based: the coverage table opens it for whichever
// subject row was clicked, so one dialog instance serves every row.
export function AssignSubjectTeacherDialog({
  open,
  onOpenChange,
  classArmId,
  armLabel,
  subject,
  alreadyAssignedIds,
}: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const create = useCreateAssignments();

  // Unlike class teacher, the backend puts no teacher_type restriction on
  // subject assignments — any teacher at the school is eligible.
  const { data: page, isPending, isError } = useTeachers({ is_active: true, page_size: 100 });

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (next) {
      setSearch("");
      setSelected(null);
    }
  }

  const query = search.trim().toLowerCase();
  const matches = (page?.results ?? [])
    .filter((t) => !alreadyAssignedIds.includes(t.id))
    .filter(
      (t) =>
        !query ||
        `${t.user.first_name} ${t.user.last_name}`.toLowerCase().includes(query) ||
        t.user.email.toLowerCase().includes(query),
    );

  async function submit() {
    if (!selected) return;
    try {
      // The endpoint takes a list so one teacher can be given several subjects
      // at once; this dialog is opened from a single subject row, so it sends
      // that one.
      await create.mutateAsync({
        class_arm_id: classArmId,
        subject_ids: [subject.id],
        teacher_profile_id: selected,
      });
      onOpenChange(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Who teaches {subject.name} to {armLabel}?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-n-400" />
            <Input
              placeholder="Search teachers by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              aria-label="Search teachers"
            />
          </div>

          {isPending ? (
            <p className="py-6 text-center text-sm text-n-400" role="status">Loading teachers…</p>
          ) : isError ? (
            <p className="py-6 text-center text-sm text-clay">Couldn&rsquo;t load teachers. Try again.</p>
          ) : matches.length === 0 ? (
            <p className="py-6 text-center text-sm text-n-500">
              {query
                ? "No teachers match that search."
                : alreadyAssignedIds.length > 0
                  ? "Every teacher is already assigned to this subject for this arm."
                  : "No active teachers yet."}
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-0.5">
              {matches.map((teacher) => {
                const isSelected = selected === teacher.id;
                return (
                  <li key={teacher.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(teacher.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
                        isSelected ? "border-primary/40 bg-primary/5" : "border-n-200 hover:border-n-300",
                      )}
                    >
                      <UserRound className="size-4 shrink-0 text-n-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">
                          {teacher.user.first_name} {teacher.user.last_name}
                        </span>
                        <span className="block truncate text-xs text-n-400">
                          {teacherTypeLabel(teacher.teacher_type)}
                          {teacher.specialization ? ` · ${teacher.specialization}` : ""}
                        </span>
                      </span>
                      {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={!selected || create.isPending}>
            {create.isPending ? "Assigning…" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
