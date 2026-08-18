// Shared types and helpers for the action catalog. The entries themselves are
// grouped under ./actions/ by the backend app that emits them.

import type { AuditCategoryKey } from "./audit-categories";

export interface ActionMeta {
  category?: AuditCategoryKey;
  // Everything after the actor's name. Confirmed safe for every action the
  // backend logs: each one records the person who performed it as `actor`
  // (including invite.accepted, where the actor is the invitee themselves),
  // so an actor-first sentence always reads correctly.
  rest: (target: string) => string;
}

// The results models' __str__ ends in a status tag — "… (First Term) [locked]",
// "… [submitted]" — which is read at log time and so always restates the verb
// the sentence has just used. Dropped rather than shown twice. A no-op on any
// repr that doesn't carry one.
export function withoutStatusTag(repr: string): string {
  return repr.replace(/\s*\[[^\]]*\]$/, "");
}

// One entry per action string the backend actually logs. Every AuditService.log
// / log_bulk call is a literal — there are no dynamically-built action names —
// so this list can be, and was, checked exhaustively against the backend across
// accounts/, academic/, attendance/ and results/.
//
// The sentences assume the shape of each action's target_repr, which is either
// an explicit string at the call site or the model's __str__. Both were read
// rather than guessed, because format-audit-entry strips a "… @ School" segment
// and everything before the last ": " — a repr in an unexpected shape would come
// out truncated rather than merely ugly.
import { ACCOUNTS_ACTIONS } from "./actions/accounts";
import { ACADEMIC_ACTIONS } from "./actions/academic";
import { ATTENDANCE_ACTIONS } from "./actions/attendance";
import { RESULTS_ACTIONS } from "./actions/results";

export const ACTION_CATALOG: Record<string, ActionMeta> = {
  ...ACCOUNTS_ACTIONS,
  ...ACADEMIC_ACTIONS,
  ...ATTENDANCE_ACTIONS,
  ...RESULTS_ACTIONS,
};
