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
  UsersRound,
  School,
} from "lucide-react";

import { adminItem, staffItem, teacherItem, type NavGroup } from "./types";

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
    staffItem({
      label: "Results & Report Cards",
      href: "/results",
      icon: GraduationCap,
      description: "Enter CA and exam scores, auto-compute positions, and publish branded report cards.",
    }, false),
    teacherItem({
      label: "Behaviour Ratings",
      href: "/results/behaviour",
      icon: ClipboardList,
      description: "Rate your class on the affective and psychomotor traits.",
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
