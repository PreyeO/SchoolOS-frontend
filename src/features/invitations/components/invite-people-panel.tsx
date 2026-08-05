"use client";

import { useState } from "react";
import { ShieldCheck, GraduationCap, Users2, UserRound, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InvitePersona } from "../types";
import { InviteAdminForm } from "./invite-admin-form";
import { InviteTeacherForm } from "./invite-teacher-form";
import { InviteParentForm } from "./invite-parent-form";
import { AddStudentForm } from "./add-student-form";

const ROLE_OPTIONS: { value: InvitePersona; label: string; description: string; icon: LucideIcon }[] = [
  { value: "admin", label: "Admin", description: "Invite by email", icon: ShieldCheck },
  { value: "teacher", label: "Teacher", description: "Invite by email", icon: GraduationCap },
  { value: "parent", label: "Parent", description: "Invite by email", icon: Users2 },
  { value: "student", label: "Student", description: "Create directly", icon: UserRound },
];

// initialPersona comes from the ?persona= param, resolved server-side in the
// route (see app/(dashboard)/invitations/page.tsx). Seeding state from it is
// enough — the tabs are plain local state after that, so switching forms by
// hand doesn't need to write back to the URL.
export function InvitePeoplePanel({ initialPersona = "admin" }: { initialPersona?: InvitePersona }) {
  const [role, setRole] = useState<InvitePersona>(initialPersona);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = role === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                active ? "border-primary bg-primary/5" : "border-n-200 hover:border-n-300",
              )}
            >
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  active ? "bg-primary text-primary-foreground" : "bg-n-100 text-n-500",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{opt.label}</p>
                <p className="text-xs text-n-500 mt-0.5">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5 max-w-xl">
        {role === "admin" && <InviteAdminForm />}
        {role === "teacher" && <InviteTeacherForm />}
        {role === "parent" && <InviteParentForm />}
        {role === "student" && <AddStudentForm />}
      </div>
    </div>
  );
}
