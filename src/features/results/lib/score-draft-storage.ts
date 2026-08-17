import { createDraftBook } from "@/lib/storage/draft-book";

// Unsaved score columns, kept on the device. Same mechanics as the register
// draft (createDraftBook), separate namespace so the two never collide.
//
// Values are the raw strings the teacher typed rather than numbers: "" means
// cleared, which is a different state from 0, and a half-typed "1." must survive
// a reload exactly as it was left.
const book = createDraftBook<string>("schoolos-score-draft");

// The compound identity of a score column. Arm, subject, term AND component —
// all four, because each names a different column of marks. Dropping any one of
// them would let a 1st CA column be restored on top of an Exam column, or one
// subject's scores onto another's.
export function scoreDraftKey(
  classArmId: string,
  subjectId: string,
  academicPeriodId: string,
  gradeComponentId: string,
): string {
  return `${classArmId}|${subjectId}|${academicPeriodId}|${gradeComponentId}`;
}

export function readScoreDraft(
  membershipId: string | null | undefined,
  key: string,
): Record<string, string> | null {
  return book.read(membershipId, key);
}

export function writeScoreDraft(
  membershipId: string | null | undefined,
  key: string,
  entries: Record<string, string>,
): void {
  book.write(membershipId, key, entries);
}

export function clearScoreDraft(membershipId: string | null | undefined, key: string): void {
  book.clear(membershipId, key);
}

export function clearAllScoreDrafts(): void {
  book.clearAll();
}
