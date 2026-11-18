import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildHeadline, formatAtLeast, getPublicTotals } from "./public-stats";

const TOTALS = { schools: 3, students: 983, teachers: 36, school_admins: 9 };

describe("formatAtLeast", () => {
  it("floors large figures to the ten below, never up", () => {
    expect(formatAtLeast(983)).toBe("980+");
    expect(formatAtLeast(989)).toBe("980+");
    expect(formatAtLeast(1234)).toBe("1,230+");
    expect(formatAtLeast(100)).toBe("100+");
  });

  it("keeps small figures exact", () => {
    expect(formatAtLeast(45)).toBe("45");
    expect(formatAtLeast(99)).toBe("99");
  });
});

describe("buildHeadline", () => {
  it("reads students and staff (teachers plus school admins)", () => {
    expect(buildHeadline(TOTALS).map((p) => p.text).join("")).toBe(
      "980+ students and 45 staff are already on SchoolOS.",
    );
    expect(buildHeadline(TOTALS).filter((p) => p.strong).map((p) => p.text)).toEqual(["980+ students", "45 staff"]);
  });
});

describe("getPublicTotals", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.test"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function respond(response: Response | Error) {
    const fetchMock = vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response)));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("returns the totals, asking the public endpoint with hourly revalidation", async () => {
    const fetchMock = respond(Response.json({ totals: TOTALS, schools: [] }));
    await expect(getPublicTotals()).resolves.toEqual(TOTALS);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit & { next?: { revalidate?: number } }];
    expect(url).toBe("https://api.example.test/api/schools/stats/");
    expect(init.next?.revalidate).toBe(3600);
  });

  it("gives null, for the fallback, on an error status, a network failure or a bad shape", async () => {
    respond(new Response("nope", { status: 500 }));
    await expect(getPublicTotals()).resolves.toBeNull();

    respond(new TypeError("fetch failed"));
    await expect(getPublicTotals()).resolves.toBeNull();

    respond(Response.json({ totals: { students: "lots" } }));
    await expect(getPublicTotals()).resolves.toBeNull();
  });

  it("doesn't call out at all without an API base URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchMock = respond(Response.json({ totals: TOTALS }));
    await expect(getPublicTotals()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
