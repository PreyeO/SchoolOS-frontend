// Whether a record has actually been edited since it was created.
//
// NOT `updated_at !== created_at`. Django sets the two with SEPARATE
// `timezone.now()` calls — `auto_now_add` and `auto_now` each run their own
// `pre_save` during the same insert — so a brand-new row is already born with
// the two timestamps microseconds apart. A strict comparison therefore reports
// EVERY record as edited, forever. Confirmed live against the real database:
// an untouched student note had a 40µs gap and all three untouched
// announcements were between 23µs and 390µs.
//
// A tolerance is the fix, not a backend change: the gap is an artifact of how
// the rows are written, and only the frontend claims to read meaning into it.
// One second is ~25,000x the observed gap, and no human writes, re-reads and
// saves an edit inside it — both timestamps are computed in Python within a
// single pre_save pass, so no network or DB latency widens the real gap either.
//
// Parsing alone is NOT enough, though it looks like it should be: Date truncates
// the backend's 6-digit fractional seconds to milliseconds, so .423595 and
// .423635 both land on 423 and compare equal. But a pair straddling a
// millisecond boundary (.423900 → .424050) parses 1ms apart and would still
// report as edited. The threshold is what actually closes it.
const EDIT_THRESHOLD_MS = 1000;

export function wasEdited(createdAt: string, updatedAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  // An unparseable timestamp yields NaN, and every NaN comparison is false —
  // so a malformed value reads as "not edited" rather than labelling the row.
  return updated - created >= EDIT_THRESHOLD_MS;
}
