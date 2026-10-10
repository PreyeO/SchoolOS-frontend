"use client";

import { UserMinus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ReasonDialog } from "./reason-dialog";

interface Props {
  personName: string;
  // "teacher" | "admin" | "parent" — the persona being removed.
  role: string;
  // What happens to their data. Differs by persona, so each page states its own.
  consequence: React.ReactNode;
  // Other personas they hold at this school (e.g. ["admin"] for someone who is
  // also an admin). Empty means this removes their access to the school
  // entirely, which is the part worth spelling out.
  otherPersonas: string[];
  isPending: boolean;
  onConfirm: (reason: string) => Promise<unknown>;
}

// Offboarding removes ONE persona from a membership. The backend deactivates
// the whole membership — they can no longer sign in to this school — only
// when no persona is left, so the copy names which case this is.
export function OffboardDialog({ personName, role, consequence, otherPersonas, isPending, onConfirm }: Props) {
  const keepsAccess = otherPersonas.length > 0;

  return (
    <ReasonDialog
      trigger={
        <Button type="button" variant="outline" size="sm" className="text-destructive">
          <UserMinus className="size-3.5" /> Offboard
        </Button>
      }
      title={`Offboard ${personName} as ${role === "admin" ? "an" : "a"} ${role}?`}
      description={
        <div className="space-y-2">
          <p>{consequence}</p>
          <p className="font-medium text-ink">
            {keepsAccess
              ? `They keep their access as ${otherPersonas.join(" and ")}.`
              : "This is their only role here, so they will no longer be able to sign in to this school."}
          </p>
        </div>
      }
      reasonPlaceholder="e.g. Contract ended"
      confirmLabel="Offboard"
      pendingLabel="Offboarding…"
      destructive
      isPending={isPending}
      onConfirm={onConfirm}
    />
  );
}

// The personas a membership still holds besides `except`, as display words.
export function otherPersonasOf(
  membership: { is_admin: boolean; is_teacher: boolean; is_parent: boolean; is_student: boolean },
  except: "admin" | "teacher" | "parent",
): string[] {
  const held = [
    membership.is_admin && "admin",
    membership.is_teacher && "teacher",
    membership.is_parent && "parent",
    membership.is_student && "student",
  ].filter((p): p is string => typeof p === "string");
  return held.filter((p) => p !== except);
}
