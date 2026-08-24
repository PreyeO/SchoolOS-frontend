import {
  BookOpen,
  Building2,
  CalendarRange,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  HandCoins,
  LayoutGrid,
  Link2,
  Mail,
  Megaphone,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  SquarePen,
  Star,
  UserCheck,
  UserCog,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";

export type AuditCategoryKey =
  | "invites"
  | "roles"
  | "admins"
  | "students"
  | "enrollment"
  | "links"
  | "sessions"
  | "classes"
  | "subjects"
  | "teaching"
  | "attendance"
  | "scores"
  | "results"
  | "traits"
  | "grading"
  | "school"
  | "fees"
  | "payments"
  | "announcements";

// Purely presentational: gives each entry in the timeline an icon and a
// hover label so the log can be scanned by kind of change. Filtering is done
// on the raw `action` string instead (see AuditLogFilters), since the backend
// matches it with icontains and that's more flexible than fixed buckets.
export interface AuditCategory {
  key: AuditCategoryKey;
  label: string;
  icon: LucideIcon;
}

export const AUDIT_CATEGORIES: AuditCategory[] = [
  { key: "invites", label: "Invitations", icon: Mail },
  { key: "roles", label: "Roles & permissions", icon: ShieldCheck },
  { key: "admins", label: "Admin access", icon: UserCog },
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "enrollment", label: "Class placements", icon: UserRoundPlus },
  { key: "links", label: "Parent links", icon: Link2 },
  { key: "sessions", label: "Sessions & terms", icon: CalendarRange },
  { key: "classes", label: "Classes & arms", icon: LayoutGrid },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "teaching", label: "Teaching assignments", icon: UserCheck },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
  { key: "scores", label: "Scores", icon: SquarePen },
  { key: "results", label: "Results", icon: FileCheck2 },
  { key: "traits", label: "Behaviour ratings", icon: Star },
  { key: "grading", label: "Grading", icon: SlidersHorizontal },
  { key: "school", label: "School profile", icon: Building2 },
  // Fee structure and money taken are split: an owner scanning the log for a
  // billing change is asking a different question from one checking receipts.
  { key: "fees", label: "Fee structure", icon: Receipt },
  { key: "payments", label: "Payments & waivers", icon: HandCoins },
  { key: "announcements", label: "Announcements", icon: Megaphone },
];

export function categoryByKey(key: AuditCategoryKey | undefined): AuditCategory | undefined {
  return AUDIT_CATEGORIES.find((c) => c.key === key);
}
