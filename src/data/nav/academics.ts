import {
  Users2,
  BookOpenCheck,
  LayoutGrid,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  NotebookPen,
  FileText,
  ArrowUpRight,
  BookMarked,
  UsersRound,
  School,
} from "lucide-react";

import { adminItem, staffItem, teacherItem, type NavGroup } from "./types";
import { resultsNavItem } from "./results-group";

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
    // Sits beside My Classes rather than under People: a teacher's roster is
    // scoped to their own arms, and People is the admin's school-wide
    // directory. Governs /my-students/<id> too via longest-prefix match, which
    // is how a teacher reaches the student detail page at all — /students is
    // admin-only and that item governs /students/<id>.
    teacherItem({
      label: "My Students",
      href: "/my-students",
      icon: Users2,
      description: "Everyone in the classes you teach or lead, with their medical and personal details.",
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
    // Sits beside Classes & Arms rather than under Results: it moves students
    // between classes and is gated on edit_students, not on anything to do
    // with marks.
    adminItem({
      label: "Promotion",
      href: "/promotion",
      icon: ArrowUpRight,
      description: "Move a class into next session, with per-student overrides for repeaters.",
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
    resultsNavItem,
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
