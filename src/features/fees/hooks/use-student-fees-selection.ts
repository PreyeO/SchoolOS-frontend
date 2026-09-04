"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useStudentDetail } from "@/features/students/hooks/use-student-detail";
import type { StudentListItem } from "@/features/students/types";
import type { TermSelection } from "@/lib/school/use-term-selection";

// Resolves ?student=&period= into the page's actual student/term state, and
// keeps the URL a live bookmark of whatever is selected afterwards — set by
// the Payments arrears list's "click a name" link (arrears-table.tsx), and
// kept in sync the same way attendance-page.tsx syncs its own arm/date.
export function useStudentFeesSelection(
  initialStudentId: string | undefined,
  initialPeriodId: string | undefined,
  term: TermSelection,
) {
  const router = useRouter();
  const pathname = usePathname();

  const [student, setStudent] = useState<StudentListItem | null>(null);

  // Tracks whether the ?student= deep link has been resolved yet — distinct
  // from `!student`, which would also be true after the bursar deliberately
  // clicks "Change student", and would re-enable this fetch every time they
  // cleared their own selection.
  const [consumedDeepLinkId, setConsumedDeepLinkId] = useState<string | null>(null);
  // Same idea, for the term half of the deep link — see the note below.
  const [consumedPeriodId, setConsumedPeriodId] = useState<string | null>(null);

  // Resolves the deep-linked id into the full record the context bar and
  // ledger dialogs need. Disabled once consumed, so clearing the student later
  // never triggers a refetch of the id the URL first arrived with.
  const deepLinkedStudent = useStudentDetail(
    initialStudentId ?? "",
    !!initialStudentId && consumedDeepLinkId !== initialStudentId,
  );

  // Seeding on render rather than in an effect, per React's "adjusting state
  // when a value changes" pattern (mirrors use-sidebar-accordion.ts) — avoids
  // the set-state-in-effect lint rule and an extra render's flash of the
  // search box.
  if (deepLinkedStudent.data && deepLinkedStudent.data.id !== consumedDeepLinkId) {
    setConsumedDeepLinkId(deepLinkedStudent.data.id);
    setStudent(deepLinkedStudent.data);
  }

  // The term half of the deep link. Was a mount-only effect ("consume the
  // initial prop once") — fixed 2026-09-03 to re-apply whenever the incoming
  // value actually changes, the same rule the student half above already
  // followed. A mount-only effect is only correct if this component instance
  // is guaranteed fresh per distinct link, which Next's client-side route
  // cache doesn't strictly promise (back/forward navigation is explicitly
  // documented to reuse cached segments to preserve scroll position) — and
  // this was the one place in the file that assumed it anyway. If that
  // assumption ever breaks, this used to mean a bursar could land on a
  // student's ledger still showing whichever term a PRIOR visit had consumed,
  // reachable only by leaving the page and clicking back in.
  if (initialPeriodId && initialPeriodId !== consumedPeriodId) {
    setConsumedPeriodId(initialPeriodId);
    term.setPeriodId(initialPeriodId);
  }

  // Keeps the URL a live bookmark of what's on screen, so refreshing or
  // sharing the link returns to the same student and term rather than
  // resetting to a blank search box. replace, not push — this fires on every
  // selection change, and pushing would bury the previous view under history
  // entries for what is, from the user's perspective, one screen.
  useEffect(() => {
    const params = new URLSearchParams();
    if (student) params.set("student", student.id);
    if (term.periodId) params.set("period", term.periodId);
    const next = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    if (`${window.location.pathname}${window.location.search}` === next) return;
    router.replace(next, { scroll: false });
  }, [student, term.periodId, pathname, router]);

  return {
    student,
    setStudent,
    isResolvingStudent: !!initialStudentId && !student && deepLinkedStudent.isPending,
  };
}
