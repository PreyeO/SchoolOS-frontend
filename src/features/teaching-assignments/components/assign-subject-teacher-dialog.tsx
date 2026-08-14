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
import type { SubjectAssignment } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classArmId: string;
  armLabel: string;
  subject: SubjectResponse;
  // Teachers already teaching this subject to this arm — excluded from the list,
  // since the backend rejects a duplicate (class_arm, subject, teacher) triple.
  alreadyAssignedIds: string[];
  // Every subject this arm offers, and every assignment already on it. Both are
  // needed for the bulk step: the first is what else a teacher could be given,
  // the second is what they already hold and so must not be sent again.
  armSubjects: SubjectResponse[];
  armAssignments: SubjectAssignment[];
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
  armSubjects,
  armAssignments,
}: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  // Subjects beyond the row this dialog was opened from. The opening subject is
  // always part of the batch and isn't held here, so it can't be unticked by
  // accident — it's the question the admin came to answer.
  const [extras, setExtras] = useState<Set<string>>(new Set());
  const create = useCreateAssignments();

  // Unlike class teacher, the backend puts no teacher_type restriction on
  // subject assignments — any teacher at the school can hold one.
  const { data: page, isPending, isError } = useTeachers({ is_active: true, page_size: 100 });

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (next) {
      setSearch("");
      setSelected(null);
      setExtras(new Set());
    }
  }

  // Changing teacher resets the extras: "already teaches it" is a fact about one
  // teacher, so a subject legitimately ticked for the first could be a duplicate
  // for the second, which the backend would reject for the whole batch.
  function pickTeacher(id: string) {
    setSelected(id);
    setExtras(new Set());
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

  const selectedTeacher = matches.find((t) => t.id === selected) ?? null;

  // What this teacher already teaches to this arm — shown as done rather than
  // hidden, so the admin can see the full picture of their load here.
  const heldByTeacher = new Set(
    armAssignments.filter((a) => a.teacher.id === selected).map((a) => a.subject.id),
  );
  const otherSubjects = armSubjects.filter((s) => s.id !== subject.id);
  const assignable = otherSubjects.filter((s) => !heldByTeacher.has(s.id));
  const allExtrasSelected = assignable.length > 0 && assignable.every((s) => extras.has(s.id));

  function toggleExtra(id: string) {
    setExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllExtras() {
    setExtras(allExtrasSelected ? new Set() : new Set(assignable.map((s) => s.id)));
  }

  const total = 1 + extras.size;

  async function submit() {
    if (!selected) return;
    try {
      // One request for the whole batch — the endpoint takes a list precisely
      // because a teacher commonly takes several subjects in the same arm. Every
      // subject is validated before any row is written, so this can't half-apply.
      await create.mutateAsync({
        class_arm_id: classArmId,
        subject_ids: [subject.id, ...extras],
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
            <ul className="max-h-52 space-y-1 overflow-y-auto pr-0.5">
              {matches.map((teacher) => {
                const isSelected = selected === teacher.id;
                return (
                  <li key={teacher.id}>
                    <button
                      type="button"
                      onClick={() => pickTeacher(teacher.id)}
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

          {/* The bulk step. Held back until a teacher is chosen, because "which
              other subjects" is meaningless before then and an unanswerable
              second list would only crowd the first. */}
          {selectedTeacher && otherSubjects.length > 0 && (
            <div className="space-y-2 border-t border-n-100 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-ink">
                  Give {selectedTeacher.user.first_name} other subjects in {armLabel}?
                </p>
                {assignable.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllExtras}
                    className="cursor-pointer text-xs font-medium text-primary hover:underline"
                  >
                    {allExtrasSelected ? "Clear" : `Select all ${assignable.length}`}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {otherSubjects.map((s) => {
                  const held = heldByTeacher.has(s.id);
                  const on = extras.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={held}
                      onClick={() => toggleExtra(s.id)}
                      aria-pressed={held || on}
                      title={held ? `Already teaches ${s.name} to ${armLabel}` : undefined}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors",
                        held
                          ? "cursor-default border-n-200 bg-n-50 text-n-400"
                          : on
                            ? "cursor-pointer border-primary/40 bg-primary/10 text-primary"
                            : "cursor-pointer border-n-200 text-n-600 hover:border-n-300",
                      )}
                    >
                      {s.name}
                      {held && " ✓"}
                    </button>
                  );
                })}
              </div>
              {assignable.length === 0 && (
                <p className="text-xs text-n-400">
                  {selectedTeacher.user.first_name} already teaches every other subject this
                  arm takes.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={!selected || create.isPending}>
            {create.isPending
              ? "Assigning…"
              : total === 1
                ? "Assign"
                : `Assign ${total} subjects`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
