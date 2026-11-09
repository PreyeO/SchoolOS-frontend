import { describe, expect, it } from "vitest";

import type { IssuancePreview, PreviewRow } from "../types";
import { issuanceVerdict, multiPageCount } from "./issuance-verdict";

const row = (id: string, pages = 1) => ({ student_id: id, pages }) as PreviewRow;
const preview = (over: Partial<IssuancePreview> = {}): IssuancePreview => ({
  eligible: [row("a"), row("b")], no_number: [], invalid_number: [], already_has_card: [], not_enrolled: [],
  not_found: [], stock_available: 10, stock_shortfall: 0, credits_required: 2, credit_shortfall: 0,
  estimated_pages: 2, estimated_cost_naira: 20, wallet_balance: 50, credit_price_naira: 10, can_commit: true,
  ...over,
});
const school = { scope: "school" } as const;

describe("issuanceVerdict", () => {
  it("allows a clean preview", () => {
    expect(issuanceVerdict(preview(), school, "sms")).toEqual({ canCommit: true, blockers: [] });
  });

  it("names the stock and credit shortfalls with numbers", () => {
    const v = issuanceVerdict(
      preview({ can_commit: false, stock_available: 1, stock_shortfall: 1, credits_required: 2, wallet_balance: 0, credit_shortfall: 2 }),
      school,
      "sms",
    );
    expect(v.canCommit).toBe(false);
    expect(v.blockers).toEqual([
      "Not enough cards for this session: 2 needed, 1 in stock. Buy 1 more.",
      "Not enough SMS credits: 2 needed, 0 in the wallet. Top up 2 more.",
    ]);
  });

  it("ignores credits for print", () => {
    expect(issuanceVerdict(preview({ credit_shortfall: 5 }), school, "print").canCommit).toBe(true);
  });

  // The server's can_commit stays true here; it only refuses at commit.
  it("blocks a selection with anyone skipped, even when the server says can_commit", () => {
    const v = issuanceVerdict(preview({ no_number: [row("c")] }), { scope: "selection", student_ids: ["a", "b", "c"] }, "sms");
    expect(v.canCommit).toBe(false);
    expect(v.blockers[0]).toMatch(/chosen students can't get a card/);
  });

  it("lets a class send go ahead and skip the students without numbers", () => {
    expect(issuanceVerdict(preview({ no_number: [row("c")] }), { scope: "class", class_id: "k" }, "sms").canCommit).toBe(true);
  });

  it("explains an unexplained refusal as the batch cap", () => {
    expect(issuanceVerdict(preview({ can_commit: false }), school, "sms").blockers).toEqual([
      "Too many students in one send. Issue class by class instead.",
    ]);
  });
});

describe("multiPageCount", () => {
  it("counts recipients whose text costs 2+ credits", () => {
    expect(multiPageCount(preview({ eligible: [row("a", 1), row("b", 2), row("c", 3)] }))).toBe(2);
  });
});
