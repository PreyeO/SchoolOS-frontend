import type { CardPin, IssuancePreview, IssuedPin, IssuanceChannel, IssuanceTarget, SkipBucket } from "../types";

export const SKIP_BUCKETS: { key: SkipBucket; label: string; hint: string }[] = [
  { key: "no_number", label: "No phone number", hint: "Add a parent's number, then check again." },
  { key: "invalid_number", label: "Number can't be texted", hint: "The saved number isn't a valid Nigerian mobile. Add a correct one." },
  { key: "already_has_card", label: "Already has a card", hint: "Issued or used this session. If theirs was lost, use Replace on the student's page." },
  { key: "not_enrolled", label: "Not enrolled this session", hint: "No class for this session, so no card is issued." },
  { key: "not_found", label: "Not found", hint: "No longer a student at this school." },
];

export interface Verdict {
  canCommit: boolean;
  // Plain sentences, in the order an admin would fix them.
  blockers: string[];
}

// Whether Commit is allowed, and why not. The server's can_commit covers
// nobody eligible, short stock, short credits and the batch cap. A SELECTION
// adds one rule the server only enforces at commit: anyone hand-picked who
// can't get a card blocks the whole send, so nobody chosen is silently skipped.
export function issuanceVerdict(preview: IssuancePreview, target: IssuanceTarget, channel: IssuanceChannel): Verdict {
  const blockers: string[] = [];
  const eligible = preview.eligible.length;

  if (eligible === 0) blockers.push("Nobody in this selection can be issued a card.");
  if (preview.stock_shortfall > 0) {
    blockers.push(`Not enough cards for this session: ${eligible} needed, ${preview.stock_available} in stock. Buy ${preview.stock_shortfall} more.`);
  }
  if (channel === "sms" && preview.credit_shortfall > 0) {
    blockers.push(`Not enough SMS credits: ${preview.credits_required} needed, ${preview.wallet_balance} in the wallet. Top up ${preview.credit_shortfall} more.`);
  }
  const skipped = SKIP_BUCKETS.reduce((n, b) => n + preview[b.key].length, 0);
  if (target.scope === "selection" && skipped > 0) {
    blockers.push("Some chosen students can't get a card. Fix them or remove them from the selection, then check again.");
  }
  // The server's cap isn't sent; when it says no and nothing above explains
  // it, the cap is the only reason left.
  if (!preview.can_commit && blockers.length === 0) {
    blockers.push("Too many students in one send. Issue class by class instead.");
  }
  return { canCommit: preview.can_commit && blockers.length === 0, blockers };
}

// Recipients whose single text costs more than one credit.
export function multiPageCount(preview: IssuancePreview): number {
  return preview.eligible.filter((row) => row.pages > 1).length;
}

export function toCardPin(issued: IssuedPin): CardPin {
  return {
    serial: issued.serial,
    pin: issued.pin,
    student: { name: issued.student_name, admission_number: issued.admission_number },
  };
}
