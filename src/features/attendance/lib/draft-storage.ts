import { createDraftBook } from "@/lib/storage/draft-book";

import type { DraftEntry } from "../types";

// Half-marked registers, kept on the device. The mechanics live in
// createDraftBook, shared with score entry; this file owns only what's specific
// to a register — its storage namespace and its compound key.
//
// The prefix is unchanged from when this was self-contained, so drafts already
// sitting on a teacher's phone still load after this refactor.
const book = createDraftBook<DraftEntry>("schoolos-register-draft");

// The compound identity of a register. Arm AND date, because they are two
// different registers — this is what keeps one class's edits from ever being
// attributed to another.
export function draftKey(classArmId: string, date: string): string {
  return `${classArmId}|${date}`;
}

export function readDraft(
  membershipId: string | null | undefined,
  key: string,
): Record<string, DraftEntry> | null {
  return book.read(membershipId, key);
}

export function writeDraft(
  membershipId: string | null | undefined,
  key: string,
  entries: Record<string, DraftEntry>,
): void {
  book.write(membershipId, key, entries);
}

// Called once a register matches the server — there's nothing unsaved left to
// protect, and keeping it would mean re-seeding stale local state next time.
export function clearDraft(membershipId: string | null | undefined, key: string): void {
  book.clear(membershipId, key);
}

export function clearAllRegisterDrafts(): void {
  book.clearAll();
}
