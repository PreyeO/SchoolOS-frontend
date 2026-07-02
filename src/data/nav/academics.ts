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
} from "lucide-react";

import { adminItem, type NavGroup } from "./types";

export const academicsGroup: NavGroup = {
  label: "Academics",
  icon: BookOpenCheck,
  items: [
    adminItem({
      label: "Classes & Arms",
      href: "/classes",
      icon: LayoutGrid,
      description: "Organize classes and parallel arms, assign teachers, and manage class capacity.",
    }),
    adminItem({
      label: "Subjects",
      href: "/subjects",
      icon: BookOpen,
      description: "Manage the subjects taught at each level and assign them to classes.",
    }),
    adminItem({
      label: "Timetable",
      href: "/timetable",
      icon: CalendarClock,
      description: "Build weekly timetables and automatically resolve teacher and room clashes.",
    }),
    adminItem({
      label: "Attendance",
      href: "/attendance",
      icon: ClipboardCheck,
      description: "Take daily attendance, track patterns, and notify parents of absences.",
    }),
    adminItem({
      label: "Results & Report Cards",
      href: "/results",
      icon: GraduationCap,
      description: "Enter CA and exam scores, auto-compute positions, and publish branded report cards.",
    }),
    adminItem({
      label: "Exams & CBT",
      href: "/exams",
      icon: ClipboardList,
      description: "Create computer-based tests and exams with auto-marking for objective questions.",
    }),
    adminItem({
      label: "Lesson Plans & Scheme of Work",
      href: "/lesson-plans",
      icon: NotebookPen,
      description: "Plan lessons against the scheme of work and track curriculum coverage.",
    }),
    adminItem({
      label: "Assignments",
      href: "/assignments",
      icon: FileText,
      description: "Set, collect, and grade assignments and homework online.",
    }),
    adminItem({
      label: "Learning / Content",
      href: "/learning",
      icon: BookMarked,
      description: "Share learning materials, videos, and resources with students and parents.",
    }),
  ],
};
