"use client";

import { useMemo } from "react";

import type { ResultSubmission, SubmissionStatus } from "../types";

export interface ReviewQueueSubjectOption {
  id: string;
  name: string;
  // Set only when this name collides with another subject's in the current
  // option list — see the comment on `subjects` below for why that happens.
  // The classes this id's submissions actually span, so the label never
  // implies a narrower scope than is real.
  disambiguator?: string;
}

// Ordered by what needs doing, not alphabetically. Anything waiting on the admin
// comes first; approved work sinks to the bottom because it needs nothing.
const STATUS_ORDER: SubmissionStatus[] = ["submitted", "rejected", "draft", "approved"];

// Matches the other paginated directories (Staff/Students/Parents/Admins,
// Pending Invites) — a page's worth of rows at a glance, not the whole term's
// queue at once.
export const REVIEW_QUEUE_PAGE_SIZE = 25;

interface Args {
  allSubmissions: ResultSubmission[] | undefined;
  armId: string;
  subjectId: string;
  page: number;
}

// The derivation ReviewQueuePage renders from: what filter options exist,
// what the filtered-and-sorted term looks like as a whole, and which slice of
// it is the current page. Pulled out of the page component because none of
// this is JSX — it's the part worth reasoning about (and could be unit tested)
// independently of how it's laid out on screen.
export function useReviewQueueView({ allSubmissions, armId, subjectId, page }: Args) {
  // Only subjects that actually appear in this term's queue. Offering one
  // nobody has submitted would filter to an empty table with nothing to
  // explain it. Built from the full fetched set, not the current page, so the
  // option list doesn't change as someone pages through.
  //
  // Scoped by the arm filter too, once one is picked — Subject is level-scoped
  // in the backend (academic/models.py), not arm-scoped, so a class's own
  // subject list is genuinely a subset of the school-wide one once an arm
  // narrows it, rather than every subject anyone teaches anywhere.
  //
  // Two different subjects can render identically here even after that: the
  // same reason two rows can share a name at all — a school-defined subject is
  // unique per (school, name, level) only while ACTIVE, so a deactivated
  // subject (kept for its historical scores, same shape as behaviour traits)
  // can collide in name with its own active replacement, and two genuinely
  // different levels can each define their own "Mathematics" with no relation
  // to one another. Both are different ids with no way to tell apart from the
  // name alone — so when a name collides with another in the current option
  // list, this appends every class its OWN submissions span, never just one:
  // Subject isn't arm-scoped, so a single id routinely spans several arms
  // (and can span several classes) already, and naming only one would imply a
  // narrower scope than picking it actually filters to.
  const subjects = useMemo<ReviewQueueSubjectOption[]>(() => {
    const scoped = (allSubmissions ?? []).filter((s) => !armId || s.class_arm === armId);

    const bySubject = new Map<string, { name: string; classes: Set<string> }>();
    scoped.forEach((s) => {
      const entry = bySubject.get(s.subject) ?? { name: s.subject_name, classes: new Set<string>() };
      entry.classes.add(s.class_name);
      bySubject.set(s.subject, entry);
    });

    const nameCounts = new Map<string, number>();
    bySubject.forEach(({ name }) => nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1));

    return [...bySubject.entries()]
      .map(([id, { name, classes }]) => ({
        id,
        name,
        disambiguator:
          (nameCounts.get(name) ?? 0) > 1 ? [...classes].sort().join(", ") : undefined,
      }))
      .sort((a, b) =>
        a.name === b.name
          ? (a.disambiguator ?? "").localeCompare(b.disambiguator ?? "")
          : a.name.localeCompare(b.name),
      );
  }, [allSubmissions, armId]);

  // Filtered and sorted over the COMPLETE term (useReviewQueue fetches every
  // page), so "submitted, awaiting review" items surface first across the
  // whole queue rather than only within whichever page happened to load —
  // that ordering is the reason this is sliced client-side below instead of
  // paged by the server, which has no equivalent ordering param.
  const filteredSubmissions = useMemo(() => {
    return [...(allSubmissions ?? [])]
      .filter((s) => (!armId || s.class_arm === armId) && (!subjectId || s.subject === subjectId))
      .sort((a, b) => {
        const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        if (byStatus !== 0) return byStatus;
        const byClass = `${a.class_name}${a.arm_name}`.localeCompare(
          `${b.class_name}${b.arm_name}`,
        );
        return byClass !== 0 ? byClass : a.subject_name.localeCompare(b.subject_name);
      });
  }, [allSubmissions, armId, subjectId]);

  const submissions = useMemo(
    () =>
      filteredSubmissions.slice(
        (page - 1) * REVIEW_QUEUE_PAGE_SIZE,
        page * REVIEW_QUEUE_PAGE_SIZE,
      ),
    [filteredSubmissions, page],
  );

  // Counted over the full filtered queue, not just the visible page — "12
  // awaiting your review" has to mean the whole term, or paging to page 2
  // would make it look like most of the work vanished.
  const awaiting = filteredSubmissions.filter((s) => s.status === "submitted").length;

  return { subjects, filteredSubmissions, submissions, awaiting };
}
