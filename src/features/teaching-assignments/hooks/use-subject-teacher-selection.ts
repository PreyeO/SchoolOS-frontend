"use client";

import { useState } from "react";

import type { SubjectResponse } from "@/features/onboarding/types";

import { useCreateAssignments } from "./use-assignment-mutations";
import type { SubjectAssignment } from "../types";

interface Args {
  classArmId: string;
  subject: SubjectResponse;
  armSubjects: SubjectResponse[];
  armAssignments: SubjectAssignment[];
  onDone: () => void;
}

// Selection state and submit for AssignSubjectTeacherDialog.
//
// Split out because it's the part with rules rather than markup: which subjects
// a chosen teacher may additionally be given, what resets when the teacher
// changes, and the fact that the whole batch goes in one request.
export function useSubjectTeacherSelection({
  classArmId,
  subject,
  armSubjects,
  armAssignments,
  onDone,
}: Args) {
  const [selected, setSelected] = useState<string | null>(null);
  // Subjects beyond the row the dialog was opened from. That one is always in
  // the batch and isn't held here, so it can't be unticked by accident — it's
  // the question the admin came to answer.
  const [extras, setExtras] = useState<Set<string>>(new Set());
  const create = useCreateAssignments();

  function reset() {
    setSelected(null);
    setExtras(new Set());
  }

  // Changing teacher clears the extras: "already teaches it" is a fact about one
  // teacher, so a subject legitimately ticked for the first could be a duplicate
  // for the second — which the backend rejects for the whole batch.
  function pickTeacher(id: string) {
    setSelected(id);
    setExtras(new Set());
  }

  const heldByTeacher = new Set(
    armAssignments.filter((a) => a.teacher.id === selected).map((a) => a.subject.id),
  );
  const otherSubjects = armSubjects.filter((s) => s.id !== subject.id);
  const assignable = otherSubjects.filter((s) => !heldByTeacher.has(s.id));

  function toggleExtra(id: string) {
    setExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setExtras(
      assignable.every((s) => extras.has(s.id)) ? new Set() : new Set(assignable.map((s) => s.id)),
    );
  }

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
      onDone();
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return {
    selected,
    pickTeacher,
    reset,
    extras,
    toggleExtra,
    toggleAll,
    heldByTeacher,
    otherSubjects,
    submit,
    isSaving: create.isPending,
    total: 1 + extras.size,
  };
}
