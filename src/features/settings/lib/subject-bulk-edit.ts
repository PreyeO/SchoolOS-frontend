import type { SubjectResponse } from "@/features/onboarding/types";

export interface SubjectDraft {
  name: string;
  level: string;
  is_core: boolean;
}

export type DraftMap = Record<string, SubjectDraft>;

export interface BulkUpdateItem {
  id: string;
  name?: string;
  level?: string;
  is_core?: boolean;
}

export function buildDrafts(subjects: SubjectResponse[]): DraftMap {
  return Object.fromEntries(
    subjects.map((s) => [s.id, { name: s.name, level: s.level, is_core: s.is_core }]),
  );
}

// DRF's CharField trims whitespace, so " Maths " and "Maths" are the same edit
// to the backend — trim here too or a stray space reads as a change.
function changedFields(subject: SubjectResponse, draft: SubjectDraft): BulkUpdateItem | null {
  const item: BulkUpdateItem = { id: subject.id };
  const name = draft.name.trim();

  if (name !== subject.name) item.name = name;
  if (draft.level !== subject.level) item.level = draft.level;
  if (draft.is_core !== subject.is_core) item.is_core = draft.is_core;

  return Object.keys(item).length > 1 ? item : null;
}

// Only rows that actually changed. The endpoint accepts an id-only item
// happily, but sending unchanged rows would widen the "submitted set" that
// uniqueness is checked against — and pad the audit log with no-ops.
export function collectChanges(subjects: SubjectResponse[], drafts: DraftMap): BulkUpdateItem[] {
  return subjects.flatMap((s) => {
    const draft = drafts[s.id];
    if (!draft) return [];
    const item = changedFields(s, draft);
    return item ? [item] : [];
  });
}

// (name, level) is unique per school across ACTIVE subjects only, and the
// constraint is case-sensitive — "maths" and "Maths" can legally coexist. This
// mirrors that exactly rather than being stricter, so the UI never blocks an
// edit the backend would have accepted.
function pairKey(name: string, level: string): string {
  return `${name.trim()}|${level}`;
}

// Catches the uniqueness conflicts per row, because the endpoint reports them
// as one unattributed {detail} string for the whole payload.
//
// Deliberately stricter than the service's own Python checks. Those exempt
// rows inside the submitted set from each other, which reads as permission to
// swap two subjects' names in one save — but the service then saves row by row
// inside its transaction, so the first save collides with the second row's
// not-yet-changed name and the unique constraint raises an IntegrityError. It
// is a 500, not a 400 (verified live against bulk-update), and whether it fires
// at all depends on payload order.
//
// So the rule here is the one that predicts what actually survives the save
// loop: an effective (name, level) may not match the CURRENT pair of any other
// active subject, edited or not. That blocks the swap up front with an
// explanation instead of a server error.
export function validateDrafts(
  subjects: SubjectResponse[],
  drafts: DraftMap,
  allActive: SubjectResponse[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  const submitted = collectChanges(subjects, drafts);
  const submittedIds = new Set(submitted.map((c) => c.id));

  const byPair = new Map<string, string[]>();
  for (const id of submittedIds) {
    const draft = drafts[id];
    if (!draft.name.trim()) {
      errors[id] = "Give this subject a name.";
      continue;
    }
    byPair.set(pairKey(draft.name, draft.level), [
      ...(byPair.get(pairKey(draft.name, draft.level)) ?? []),
      id,
    ]);
  }

  for (const [key, ids] of byPair) {
    if (ids.length > 1) {
      for (const id of ids) errors[id] ??= "Two rows you're editing now share this name and level.";
      continue;
    }
    const clash = allActive.find((s) => s.id !== ids[0] && pairKey(s.name, s.level) === key);
    if (!clash) continue;

    errors[ids[0]] ??= submittedIds.has(clash.id)
      ? `${clash.name} still holds this name until it's saved — swap names one save at a time.`
      : `${clash.name} already exists at this level.`;
  }

  return errors;
}

export function countChangedRows(subjects: SubjectResponse[], drafts: DraftMap): number {
  return collectChanges(subjects, drafts).length;
}
