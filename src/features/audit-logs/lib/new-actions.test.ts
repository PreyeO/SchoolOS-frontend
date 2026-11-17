import { describe, expect, it } from "vitest";

import type { AuditLogEntry } from "../types";
import { ACTION_FILTER_GROUPS } from "./action-options";
import { formatAuditEntry } from "./format-audit-entry";

// Each repr is the exact shape the backend builds at its call site
// (scratch_cards/, payments/, messaging/, attendance/; read 2026-11-10).
const entry = (action: string, target_repr: string, actor: string | null = "Ada Obi") =>
  ({
    action,
    target_repr,
    school_name: "Federal Girls College",
    actor: actor ? { first_name: actor.split(" ")[0], last_name: actor.split(" ")[1] } : null,
  }) as AuditLogEntry;

const CASES: [string, string, string | null, string][] = [
  ["scratch_card_purchase.initiated", "3 card(s) — 2026/2027", "Ada Obi", "Ada Obi started a result card purchase: 3 card(s) — 2026/2027"],
  ["scratch_card_purchase.verified", "3 card(s) — Federal Girls College (successful)", "Ada Obi", "Ada Obi paid for a result card purchase: 3 card(s)"],
  ["scratch_card.generated", "ABCD-EFGH-IJ", "Ada Obi", "Ada Obi received result card ABCD-EFGH-IJ"],
  ["scratch_card.issued", "ABCD-EFGH-IJ → ADM/001", "Ada Obi", "Ada Obi issued result card ABCD-EFGH-IJ → ADM/001"],
  ["scratch_card.reissued", "NEWS-ERIA-L2 → ADM/001", "Ada Obi", "Ada Obi replaced result card NEWS-ERIA-L2 → ADM/001"],
  // No actor: these happen at the public checker.
  ["scratch_card.bound", "ABCD-EFGH-IJ → ADM/001", null, "System linked result card ABCD-EFGH-IJ → ADM/001 at its first result check"],
  ["scratch_card.locked", "ABCD-EFGH-IJ — Federal Girls College", null, "System locked result card ABCD-EFGH-IJ after five wrong PINs"],
  ["message.resolved", "refund 1b2c3d4e-0000-0000-0000-000000000000", "Ada Obi", "Ada Obi marked a card text failed and refunded its credits"],
  ["message.resolved", "resend 1b2c3d4e-0000-0000-0000-000000000000", "Ada Obi", "Ada Obi sent a card text again"],
  ["wallet.debited", "-12 credits (debit:issuance:1b2c3d4e)", "Ada Obi", "Ada Obi spent 12 credits on result card texts"],
  ["wallet.refunded", "+1 credits (refund:1b2c3d4e)", null, "System got 1 credit back for a text that failed"],
  ["wallet.adjusted", "-20 credits — Correction for a double top-up", "Tolu Staff", "Tolu Staff removed 20 credits (SchoolOS adjustment: Correction for a double top-up)"],
  ["wallet.adjusted", "50 credits — Goodwill", "Tolu Staff", "Tolu Staff added 50 credits (SchoolOS adjustment: Goodwill)"],
  ["wallet_topup.initiated", "50 credits (₦500)", "Ada Obi", "Ada Obi started an SMS credit top-up of 50 credits (₦500)"],
  ["wallet_topup.verified", "50 credits (₦500)", "Ada Obi", "Ada Obi paid for an SMS credit top-up of 50 credits (₦500)"],
  ["guardian_contact.created", "Ngozi Obi (ADM/001) (bulk import)", "Ada Obi", "Ada Obi added parent number Ngozi Obi (ADM/001) (bulk import)"],
  ["guardian_contact.updated", "Ngozi Obi", "Ada Obi", "Ada Obi updated parent number Ngozi Obi"],
  ["guardian_contact.deleted", "Ngozi Obi", "Ada Obi", "Ada Obi removed parent number Ngozi Obi"],
  ["attendance.cleared", "Ada Obi - ADM/001 - 2026-10-11 (present)", "Musa Bello", "Musa Bello unmarked attendance — Ada Obi - ADM/001 - 2026-10-11 (present)"],
];

describe("audit sentences for the result card, wallet and parent-number actions", () => {
  it.each(CASES)("%s: %s", (action, repr, actor, expected) => {
    expect(formatAuditEntry(entry(action, repr, actor))).toBe(expected);
  });

  it("lists every one in the action filter, under its own group", () => {
    const labels = Object.fromEntries(ACTION_FILTER_GROUPS.map((g) => [g.label, g.options.map((o) => o.value)]));
    expect(labels["Result cards"]).toEqual(expect.arrayContaining(["scratch_card.issued", "scratch_card.locked", "message.resolved"]));
    expect(labels["SMS wallet"]).toEqual(expect.arrayContaining(["wallet.debited", "wallet_topup.verified", "wallet.adjusted"]));
    expect(labels["Parent numbers"]).toEqual(expect.arrayContaining(["guardian_contact.created"]));
    expect(labels["Attendance"]).toEqual(expect.arrayContaining(["attendance.cleared"]));
  });
});
