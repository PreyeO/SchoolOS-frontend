import { ClipboardList, FileText, GraduationCap, NotebookPen, Table, Trophy } from "lucide-react";

import { adminItem, groupedItem, staffItem, teacherItem, type NavItem } from "./types";

// The results cluster, lifted out of academics.ts so that file stays a flat
// list of the group's own items. Exported as the single grouped entry it
// renders as, not as loose items.
//
// Five screens sharing one job — scores in, positions computed, cards out —
// nested under one row instead of sitting flat. Personas still narrow at
// the leaf: Score Entry and Behaviour Ratings are teacher-only (only the
// teacher holding the SubjectAssignment for a (class arm, subject) may
// enter scores — there is no admin override, and the screen is built from
// /subject-assignments/my-assignments, which the backend refuses outright
// for anyone with no teacher profile); Publish Results, Principal's
// Remarks and Result Review are the admin side of the same pipeline.
export const resultsNavItem: NavItem = groupedItem({
  label: "Results",
  href: "/results",
  icon: GraduationCap,
  description: "Scores, positions and report cards, from entry to publish.",
  items: [
    teacherItem({
      label: "Score Entry",
      href: "/results",
      icon: GraduationCap,
      description: "Enter CA and exam scores for the subjects you teach.",
    }, false),
    // Names both jobs. It said "Behaviour Ratings" while the page said
    // "Behaviour & remarks", so a form teacher looking for where to write
    // their report card remark had no reason to click it — the one task the
    // nav didn't mention was the one they were hunting for.
    teacherItem({
      label: "Behaviour & Remarks",
      href: "/results/behaviour",
      icon: ClipboardList,
      description:
        "Rate your class on the affective and psychomotor traits, and write each student's report card remark.",
    }, false),
    // staffItem, not adminItem: the backend gates the broadsheet on
    // CanViewResults, which any teacher satisfies — it's the sheet a form
    // teacher checks before results go out, not an admin-only control.
    staffItem({
      label: "Broadsheet",
      href: "/results/broadsheet",
      icon: Table,
      description: "The whole class on one sheet — every student, every subject.",
    }, false),
    // Same CanViewResults gate as the broadsheet, so teachers too.
    staffItem({
      label: "Leaderboard",
      href: "/results/leaderboard",
      icon: Trophy,
      description: "Who's top of the class this term, overall or in one subject.",
    }, false),
    adminItem({
      label: "Publish Results",
      href: "/results/publish",
      icon: FileText,
      description: "Lock a class's results to compute positions and release report cards.",
    }, false),
    adminItem({
      label: "Principal's Remarks",
      href: "/results/remarks",
      icon: NotebookPen,
      description: "Add the head's comment to each student's report card.",
    }, false),
    adminItem({
      label: "Result Review",
      href: "/results/review",
      icon: FileText,
      description: "Approve or send back the scores teachers have submitted.",
    }, false),
  ],
});
