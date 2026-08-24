import { actionMeta } from "./action-catalog";
import type { AuditLogEntry } from "../types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Most actions pass an explicit target_repr built for the audit log
// specifically — a finished, human-readable string that should reach the
// screen untouched. Actions that DON'T pass one fall back to AuditService.log
// defaulting target_repr to Python str(target), which is a model's __str__
// output, not display copy, and needs cleaning up. Two passes turn the
// latter into something readable in a single-school log — verified against
// every model's __str__ and every explicit target_repr/target_repr_fn call
// site across accounts/academic/attendance/results/fees/announcements'
// services.py, 2026-08-24:
//
//  1. Drop the " @ SchoolName" / " @ (SchoolName)" segment every such __str__
//     appends. It can appear mid-string, not just at the end
//     (SchoolAdminProfile's repr is "School Admin @ SchoolName: email"), so
//     this isn't end-anchored.
//  2. Model reprs needing this follow "<Type> @ <School>: <identifier>" —
//     once the school is gone, the part after the last ": " is what actually
//     identifies the record, and the type prefix is noise the catalog
//     sentence already implies. This step ONLY runs when step 1 actually
//     matched something — an explicit repr never contains "@ SchoolName" (a
//     handoff-crafted string has no reason to), so this is the signal that
//     distinguishes "needs untangling" from "already finished". Skipping it
//     otherwise matters: enrollment.updated's repr is
//     "Name (ADM): oldClass oldArm → newClass newArm (session)" — no
//     "@ School" anywhere, but very much a "<label>: <content>" shape — and
//     blindly cutting at the last ": " there discarded the student's name,
//     which is the one thing that record needs. Confirmed live: an unrelated
//     repr with its own legitimate colon is the one shape this whole function
//     exists to protect once the @ check gates it.
function cleanTargetRepr(repr: string, schoolName: string | null, action: string): string {
  let cleaned = repr;
  let strippedSchool = false;

  if (schoolName) {
    const withoutSchool = cleaned.replace(
      new RegExp(`\\s*@\\s*\\(?${escapeRegExp(schoolName)}\\)?`),
      "",
    );
    strippedSchool = withoutSchool !== cleaned;
    cleaned = withoutSchool;
  }

  if (strippedSchool) {
    const separator = cleaned.lastIndexOf(": ");
    if (separator !== -1) cleaned = cleaned.slice(separator + 2);
  }

  if (action.startsWith("invite.")) {
    cleaned = cleaned.replace(/\s*\((?:admin|teacher|parent|student)\)$/i, "");
  }

  return cleaned.replace(/\s+role$/, "").trim();
}

export interface AuditEntryParts {
  actor: string;
  rest: string;
}

// Split so the log screen can weight the actor's name differently from the
// action, while the dashboard widget can render one plain sentence.
export function formatAuditParts(entry: AuditLogEntry): AuditEntryParts {
  return {
    actor: entry.actor ? `${entry.actor.first_name} ${entry.actor.last_name}` : "System",
    rest: actionMeta(entry.action).rest(cleanTargetRepr(entry.target_repr, entry.school_name, entry.action)),
  };
}

export function formatAuditEntry(entry: AuditLogEntry): string {
  const { actor, rest } = formatAuditParts(entry);
  return `${actor} ${rest}`;
}
