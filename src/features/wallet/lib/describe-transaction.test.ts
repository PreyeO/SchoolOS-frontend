import { describe, expect, it } from "vitest";

import { describeTransaction, formatCredits, formatSignedCredits } from "./describe-transaction";

describe("describeTransaction", () => {
  // The ledger row doesn't say which gateway took the money, so no name is guessed.
  it("names a top-up with its payment reference, which support would ask for", () => {
    expect(describeTransaction({ type: "topup", reference: "WTP-ABC123", note: "" })).toEqual({
      label: "Top-up",
      detail: "Payment ref WTP-ABC123",
    });
  });

  it("tells a card send apart from any other debit by its reference", () => {
    expect(describeTransaction({ type: "debit", reference: "debit:issuance:b1", note: "" }).label).toBe(
      "Result card PINs texted",
    );
    expect(describeTransaction({ type: "debit", reference: "debit:other", note: "" }).label).toBe("Texts sent");
  });

  it("hides the message uuid on a refund, and shows an adjustment's reason", () => {
    expect(describeTransaction({ type: "refund", reference: "refund:m1", note: "Failed message - m1" }).detail).toBeNull();
    expect(describeTransaction({ type: "adjustment", reference: "adj:k", note: "Goodwill credit" })).toEqual({
      label: "Adjusted by SchoolOS",
      detail: "Goodwill credit",
    });
  });
});

describe("credit formatting", () => {
  it("signs ledger amounts with a real minus sign", () => {
    expect(formatSignedCredits(1200)).toBe("+1,200");
    expect(formatSignedCredits(-12)).toBe("−12");
    expect(formatSignedCredits(0)).toBe("0");
  });

  it("pluralises", () => {
    expect(formatCredits(1)).toBe("1 credit");
    expect(formatCredits(2500)).toBe("2,500 credits");
  });
});
