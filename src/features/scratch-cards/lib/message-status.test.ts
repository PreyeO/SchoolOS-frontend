import { describe, expect, it } from "vitest";

import { batchInFlight } from "../hooks/use-issuance";
import type { CardAssignment, IssuanceBatch, MessageStatus } from "../types";
import { statusCounts } from "./message-status";

const batch = (...statuses: (MessageStatus | null)[]) =>
  ({ assignments: statuses.map((s, i) => ({ id: String(i), message_status: s }) as CardAssignment) }) as IssuanceBatch;

describe("batchInFlight (drives polling)", () => {
  it("polls while anything is queued or sending", () => {
    expect(batchInFlight(batch("delivered", "pending"))).toBe(true);
    expect(batchInFlight(batch("sending"))).toBe(true);
  });

  it("stops once every text has an outcome, and never polls a print batch", () => {
    expect(batchInFlight(batch("delivered", "failed", "unknown", "sent"))).toBe(false);
    expect(batchInFlight(batch(null, null))).toBe(false);
    expect(batchInFlight(undefined)).toBe(false);
  });
});

describe("statusCounts", () => {
  it("counts in delivery order and skips print rows", () => {
    expect(statusCounts(batch("delivered", "pending", "delivered", null))).toEqual([
      { status: "pending", count: 1 },
      { status: "delivered", count: 2 },
    ]);
  });
});
