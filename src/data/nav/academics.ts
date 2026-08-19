import {
  BookOpenCheck,
  LayoutGrid,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  ClipboardList,
  NotebookPen,
  FileText,
  BookMarked,
  Table,
  Trophy,
  UsersRound,
  School,
} from "lucide-react";

import { adminItem, groupedItem, staffItem, teacherItem, type NavGroup } from "./types";

export const academicsGroup: NavGroup = {
  label: "Academics",
  icon: BookOpenCheck,
  items: [
    // A teacher's own arms and subjects. Admin-side equivalents are the
    // directories and Teaching Assignments, so this is teacher-only.
    teacherItem({
      label: "My Classes",
      href: "/my-classes",
      icon: School,
      description: "The classes and subjects you teach.",
    }, false),
    adminItem({
      label: "Classes & Arms",
      href: "/classes",
      icon: LayoutGrid,
      description: "Organize classes and parallel arms, assign teachers, and manage class capacity.",
    }, false),
    adminItem({
      label: "Subjects",
      href: "/subjects",
      icon: BookOpen,
      description: "Manage the subjects taught at each level and assign them to classes.",
    }, false),
    adminItem({
      label: "Teaching Assignments",
      href: "/teaching-assignments",
      icon: UsersRound,
      description: "Set which teacher takes each subject for each class arm.",
    }, false),
    staffItem({
      label: "Timetable",
      href: "/timetable",
      icon: CalendarClock,
      description: "Build weekly timetables and automatically resolve teacher and room clashes.",
    }),
    staffItem({
      label: "Attendance",
      href: "/attendance",
      icon: ClipboardCheck,
      description: "Take daily attendance, track patterns, and notify parents of absences.",
    }, false),
    // Five screens sharing one job — scores in, positions computed, cards out —
    // nested under one row instead of sitting flat. Personas still narrow at
    // the leaf: Score Entry and Behaviour Ratings are teacher-only (only the
    // teacher holding the SubjectAssignment for a (class arm, subject) may
    // enter scores — there is no admin override, and the screen is built from
    // /subject-assignments/my-assignments, which the backend refuses outright
    // for anyone with no teacher profile); Publish Results, Principal's
    // Remarks and Result Review are the admin side of the same pipeline.
    groupedItem({
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
    }),
    staffItem({
      label: "Exams & CBT",
      href: "/exams",
      icon: ClipboardList,
      description: "Create computer-based tests and exams with auto-marking for objective questions.",
    }),
    staffItem({
      label: "Lesson Plans & Scheme of Work",
      href: "/lesson-plans",
      icon: NotebookPen,
      description: "Plan lessons against the scheme of work and track curriculum coverage.",
    }),
    staffItem({
      label: "Assignments",
      href: "/assignments",
      icon: FileText,
      description: "Set, collect, and grade assignments and homework online.",
    }),
    staffItem({
      label: "Learning / Content",
      href: "/learning",
      icon: BookMarked,
      description: "Share learning materials, videos, and resources with students and parents.",
    }),
  ],
};
