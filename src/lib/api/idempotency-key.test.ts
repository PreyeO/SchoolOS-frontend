import { afterEach, describe, expect, it, vi } from "vitest";

import { newIdempotencyKey } from "./idempotency-key";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("newIdempotencyKey", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns a v4 UUID, different each call", () => {
    const a = newIdempotencyKey();
    expect(a).toMatch(UUID_V4);
    expect(newIdempotencyKey()).not.toBe(a);
  });

  // Plain-http dev subdomains (lvh.me) aren't a secure context, so the
  // browser leaves randomUUID undefined there.
  it("still returns a v4 UUID when randomUUID is missing", () => {
    const real = globalThis.crypto;
    vi.stubGlobal("crypto", { getRandomValues: (a: Uint8Array) => real.getRandomValues(a) });
    const key = newIdempotencyKey();
    expect(key).toMatch(UUID_V4);
    expect(key).toHaveLength(36); // fits the server's max_length=64
  });
});
