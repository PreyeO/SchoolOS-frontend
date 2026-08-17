"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { SyncStatusStrip } from "@/features/attendance/components/sync-status-strip";
import { useRoster } from "@/features/attendance/hooks/use-register";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useMyClasses } from "@/features/teacher/hooks/use-my-classes";
import { useIsSchoolAdmin } from "@/lib/auth/use-personas";
import { cn } from "@/lib/utils";

import { useScoreSheets } from "../hooks/use-score-sheets";
import {
  useBulkRate,
  useRemarks,
  useSetClassTeacherRemark,
  useTraitRatings,
  useTraits,
} from "../hooks/use-traits";
import { TRAIT_CATEGORIES, type StudentResultRemark, type TraitCategory } from "../types";
import { RatingScale } from "./rating-scale";
import { RemarkField } from "./remark-field";

const CATEGORY_LABEL: Record<TraitCategory, string> = {
  affective: "Affective",
  psychomotor: "Psychomotor",
};

// Rating is the form teacher's job — TraitRatingService refuses anyone who isn't
// the arm's assigned class teacher — so the picker offers only those arms, the
// same rule the register list follows.
export function BehaviourPage() {
  const { currentTerm, isPending: termLoading } = useScoreSheets();
  const { classes: myClasses, isPending: myClassesLoading } = useMyClasses();
  const formClasses = useMemo(() => myClasses.filter((c) => c.isFormClass), [myClasses]);

  const [armId, setArmId] = useState<string | null>(null);
  const [category, setCategory] = useState<TraitCategory>("affective");
  const arm = formClasses.find((c) => c.classArmId === armId) ?? formClasses[0] ?? null;

  const { data: traits, isPending: traitsLoading, isPaused: traitsPaused } = useTraits();
  const {
    data: roster,
    isPending: rosterLoading,
    isPaused: rosterPaused,
  } = useRoster(arm?.classArmId ?? null);
  const {
    data: ratingData,
    isPending: ratingsLoading,
    isPaused: ratingsPaused,
  } = useTraitRatings(arm?.classArmId, currentTerm?.id);
  const bulkRate = useBulkRate();
  const isAdmin = useIsSchoolAdmin();

  // Remarks share this screen's exact context — same student, same arm, same
  // term, written by the same person right after judging their conduct. That is
  // how a report card is actually filled in, so splitting them onto another page
  // would mean picking the class twice.
  const { data: remarks } = useRemarks(arm?.classArmId, currentTerm?.id);
  const setRemark = useSetClassTeacherRemark();
  const remarkByStudent = useMemo(() => {
    const map = new Map<string, StudentResultRemark>();
    (remarks ?? []).forEach((r) => map.set(r.student.id, r));
    return map;
  }, [remarks]);

  const students = roster?.students;
  const ratings = ratingData?.ratings;

  // Traits are scoped by school, level AND category, so filtering on category
  // alone would show a Primary form teacher the JSS traits too. The level comes
  // off the class that owns this arm — the class list is readable by any school
  // member (ClassViewSet.list sets no required permission) and is persisted, so
  // this still resolves offline.
  const { data: schoolClasses } = useClasses();
  const level = useMemo(
    () =>
      (schoolClasses ?? []).find((klass) =>
        klass.arms.some((armRow) => armRow.id === arm?.classArmId),
      )?.level,
    [schoolClasses, arm],
  );

  const visibleTraits = useMemo(
    () =>
      (traits ?? [])
        .filter((t) => t.is_active && t.category === category && (!level || t.level === level))
        .sort((a, b) => a.order - b.order),
    [traits, category, level],
  );

  // Saved ratings by "studentId|traitId".
  const saved = useMemo(() => {
    const map = new Map<string, number>();
    (ratings ?? []).forEach((r) => {
      if (r.trait) map.set(`${r.student.id}|${r.trait.id}`, r.rating);
    });
    return map;
  }, [ratings]);

  const [draft, setDraft] = useState<Record<string, number>>({});
  const [seededKey, setSeededKey] = useState<string | null>(null);
  const seedKey = arm && currentTerm ? `${arm.classArmId}|${currentTerm.id}|${category}` : null;

  // Seeded during render, like the register and the score column — so the first
  // paint after a fetch already shows what's saved. Re-seeds when the arm, term
  // or category changes, because each is a different set of judgements.
  if (seedKey && ratings && students && seededKey !== seedKey) {
    const seed: Record<string, number> = {};
    saved.forEach((rating, key) => {
      seed[key] = rating;
    });
    setDraft(seed);
    setSeededKey(seedKey);
  }

  const changed = useMemo(
    () => Object.entries(draft).filter(([key, rating]) => saved.get(key) !== rating),
    [draft, saved],
  );

  const unavailableOffline =
    (ratingsPaused && !ratings) || (rosterPaused && !roster) || (traitsPaused && !traits);
  const isSubmitting = bulkRate.isPending && !bulkRate.isPaused;

  function submit() {
    if (!arm || !currentTerm || changed.length === 0) return;
    const markedAt = new Date().toISOString();
    bulkRate.mutate({
      class_arm_id: arm.classArmId,
      academic_period_id: currentTerm.id,
      entries: changed.map(([key, rating]) => {
        const [student_id, trait_id] = key.split("|");
        return { student_id, trait_id, rating, marked_at: markedAt };
      }),
    });
  }

  if (termLoading || myClassesLoading) {
    return <p className="text-sm text-n-400" role="status">Loading your classes…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Behaviour &amp; remarks</h1>
          <p className="mt-1 text-sm text-n-500">
            Rate each student 1–5 on the traits your school reports on, and write their
            report-card remark.
          </p>
        </div>
        {currentTerm && (
          <span className="flex items-center gap-1.5 rounded-full border border-n-200 bg-white px-2.5 py-1 text-xs text-n-600">
            <CalendarRange className="size-3.5 shrink-0 text-n-400" />
            {currentTerm.label}
          </span>
        )}
      </div>

      <SyncStatusStrip />

      {!currentTerm ? (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          No term is marked current, so there&rsquo;s nothing to rate against.{" "}
          {isAdmin ? "Set one in Sessions & Terms." : "Ask an administrator to mark the current term."}
        </p>
      ) : formClasses.length === 0 ? (
        <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-ink">You&rsquo;re not a form teacher</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
            Behaviour is rated by the form teacher of a class. Subjects you teach are listed
            under{" "}
            <Link href="/my-classes" className="text-primary hover:underline">
              My Classes
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-n-500">Class</span>
              <select
                value={arm?.classArmId ?? ""}
                onChange={(e) => setArmId(e.target.value)}
                className="h-9 min-w-44 rounded-lg border border-input bg-background px-2 text-sm text-ink"
              >
                {formClasses.map((c) => (
                  <option key={c.classArmId} value={c.classArmId}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <span className="flex gap-1.5">
              {TRAIT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                    category === c
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-n-200 text-n-500 hover:border-n-300",
                  )}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </span>
          </div>

          <div className="rounded-xl border border-n-200 bg-white">
            {unavailableOffline ? (
              <div className="p-5">
                <OfflineNotice resourceLabel="These behaviour ratings" />
              </div>
            ) : traitsLoading || rosterLoading || ratingsLoading ? (
              <p className="p-5 text-sm text-n-400" role="status">Loading…</p>
            ) : visibleTraits.length === 0 ? (
              <div className="p-5">
                <p className="text-sm font-medium text-ink">
                  No {CATEGORY_LABEL[category].toLowerCase()} traits are set up
                </p>
                <p className="mt-1 text-sm text-n-500">
                  {isAdmin
                    ? "Add them in Settings so teachers can rate against them."
                    : "Ask an administrator to add the traits your school reports on."}
                </p>
              </div>
            ) : !students || students.length === 0 ? (
              <p className="p-5 text-sm text-n-400 italic">
                No students are enrolled in {arm?.label} for this term.
              </p>
            ) : (
              <>
                {/* One student per block rather than a students x traits grid.
                    A grid of five-button scales is unreadable on a phone, and
                    rating is done per child — you think about Ada, then move on. */}
                <ul className="divide-y divide-n-100">
                  {students.map((student) => (
                    <li key={student.id} className="px-5 py-3.5">
                      <p className="text-sm font-medium text-ink">
                        {student.user.first_name} {student.user.last_name}
                      </p>
                      <p className="font-mono text-[11px] text-n-400">
                        {student.admission_number}
                      </p>
                      <ul className="mt-2.5 space-y-2">
                        {visibleTraits.map((trait) => {
                          const key = `${student.id}|${trait.id}`;
                          return (
                            <li
                              key={trait.id}
                              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5"
                            >
                              <span className="min-w-0 flex-1 truncate text-sm text-n-600">
                                {trait.name}
                              </span>
                              <RatingScale
                                label={`${trait.name} for ${student.user.first_name}`}
                                value={draft[key]}
                                onChange={(rating) =>
                                  setDraft((prev) => ({ ...prev, [key]: rating }))
                                }
                              />
                            </li>
                          );
                        })}
                      </ul>

                      {/* Saved on its own, not with the ratings batch — see
                          RemarkField: remarks have no marked_at and so can't be
                          queued or replayed the way ratings can. */}
                      <div className="mt-3 border-t border-n-100 pt-3">
                        <RemarkField
                          label="Your remark for this student"
                          placeholder="e.g. A steady term. Ada should speak up more in class."
                          saved={remarkByStudent.get(student.id)?.class_teacher_remark}
                          savedByName={null}
                          savedAt={remarkByStudent.get(student.id)?.class_teacher_remark_at}
                          isPending={setRemark.isPending}
                          onSave={(remark) => {
                            if (!arm || !currentTerm) return;
                            setRemark.mutate({
                              student_id: student.id,
                              class_arm_id: arm.classArmId,
                              academic_period_id: currentTerm.id,
                              remark,
                            });
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-n-100 px-5 py-3">
                  <span className="mr-auto text-xs text-n-400">
                    {changed.length > 0
                      ? `${changed.length} unsaved rating${changed.length === 1 ? "" : "s"}.`
                      : "No unsaved changes."}
                  </span>
                  <Button
                    type="button"
                    onClick={submit}
                    disabled={changed.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? "Saving…" : "Save ratings"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
