import { actionMeta } from "./action-catalog";
import type { AuditLogEntry } from "../types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// AuditService.log defaults target_repr to Python str(target), so what arrives
// is a model's __str__ output, not display copy. Three passes turn it into
// something readable in a single-school log — all verified against real
// responses from the running backend:
//
//  1. Drop the " @ SchoolName" / " @ (SchoolName)" segment every model appends.
//     It can appear mid-string, not just at the end (SchoolAdminProfile's repr
//     is "School Admin @ SchoolName: email"), so this isn't end-anchored.
//  2. These reprs follow "<Type> @ <School>: <identifier>" — once the school is
//     gone, the part after ": " is the bit that actually identifies the record,
//     and the type prefix is noise the sentence already implies.
//  3. Strip SchoolAdminRole's trailing literal "role", and the "(persona)" tail
//     on invite reprs, since the catalog's own sentences already say both.
function cleanTargetRepr(repr: string, schoolName: string | null, action: string): string {
  let cleaned = repr;

  if (schoolName) {
    cleaned = cleaned.replace(new RegExp(`\\s*@\\s*\\(?${escapeRegExp(schoolName)}\\)?`), "");
  }

  const separator = cleaned.lastIndexOf(": ");
  if (separator !== -1) cleaned = cleaned.slice(separator + 2);

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
