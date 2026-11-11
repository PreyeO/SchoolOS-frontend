// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { LOGO_TIMEOUT_MS, loadLogo } from "./load-logo";

describe("loadLogo", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // Regression (2026-11-11): the app shows the same presigned URL as a plain
  // <img>, S3 answers that with no CORS header and no Vary, Chrome caches it,
  // and a cache-reusing CORS fetch then fails, so the PDF lost its logo while
  // print kept it. The fetch must bypass the cache.
  it("fetches with CORS and never from the cache", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", fetchSpy);
    await loadLogo("https://bucket.s3.example/logo.png?X-Amz-Signature=abc");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://bucket.s3.example/logo.png?X-Amz-Signature=abc",
      expect.objectContaining({ mode: "cors", cache: "no-store" }),
    );
  });

  it("gives up (null, slips without a logo) when the image never decodes", async () => {
    vi.useFakeTimers();
    // jsdom never fires load on an <img>: a decode that hangs forever.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["x"], { type: "image/svg+xml" }))));
    const result = loadLogo("https://bucket.s3.example/logo.svg");
    await vi.advanceTimersByTimeAsync(LOGO_TIMEOUT_MS + 10);
    await expect(result).resolves.toBeNull();
  });

  it("returns null without a URL, or on a failed fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(loadLogo(null)).resolves.toBeNull();
    await expect(loadLogo("https://bucket.s3.example/logo.png")).resolves.toBeNull();
  });
});
