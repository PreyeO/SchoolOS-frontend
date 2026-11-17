// @vitest-environment jsdom
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS, WALLET_ENDPOINTS } from "@/lib/api/endpoints";
import { AUTH_STORAGE_KEY } from "@/lib/storage/ssr-safe-local-storage";
import { apiUrl, server } from "@/test/msw/server";
import { useAuthStore } from "@/stores/auth-store";

// Two tabs, one page: THIS tab's in-memory store holds OLD tokens, and
// localStorage (shared by every tab) is overwritten with NEW ones, as another
// tab's refresh would. Refresh tokens are single-use (rotate + blacklist).
const OLD = { access: "access-old", refresh: "refresh-old" };
const NEW = { access: "access-new", refresh: "refresh-new" };
const PROTECTED = WALLET_ENDPOINTS.SUMMARY();

function otherTabSaves(tokens: typeof NEW) {
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ state: { pendingVerificationEmail: null, tokens, claims: null }, version: 0 }),
  );
}

// The protected route accepts only NEW's access token. refreshReply decides
// what the refresh endpoint does; it can also play the other tab.
function serve(refreshReply: () => Response) {
  const calls = { refresh: [] as string[], authorized: [] as string[] };
  server.use(
    http.get(apiUrl(PROTECTED), ({ request }) => {
      const auth = request.headers.get("authorization") ?? "";
      calls.authorized.push(auth);
      return auth === `Bearer ${NEW.access}` ? HttpResponse.json({ balance: 5 }) : HttpResponse.json({}, { status: 401 });
    }),
    http.post(apiUrl(ENDPOINTS.REFRESH), async ({ request }) => {
      calls.refresh.push(((await request.json()) as { refresh: string }).refresh);
      return refreshReply();
    }),
  );
  return calls;
}

const blacklisted = () => HttpResponse.json({ detail: "Token is blacklisted" }, { status: 401 });
const loggedOut = () => sessionStorage.getItem("schoolos-session-expired") === "1";

describe("token refresh across tabs", () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAuthStore.getState().setTokens(OLD); // writes OLD to storage too
  });

  // The reported bug: this tab loses the race to another tab, which already
  // spent the refresh token. It must adopt the winner's pair, not log out.
  it("adopts the other tab's new tokens when its own refresh is refused", async () => {
    const calls = serve(() => {
      otherTabSaves(NEW); // the other tab finished first
      return blacklisted();
    });
    const { data } = await apiClient.get(PROTECTED);

    expect(data).toEqual({ balance: 5 });
    expect(loggedOut()).toBe(false);
    expect(useAuthStore.getState().tokens).toEqual(NEW);
    expect(calls.authorized.at(-1)).toBe(`Bearer ${NEW.access}`);
  });

  it("uses tokens another tab already saved, without spending a refresh at all", async () => {
    const calls = serve(blacklisted);
    otherTabSaves(NEW);
    await apiClient.get(PROTECTED);

    expect(calls.refresh).toEqual([]);
    expect(loggedOut()).toBe(false);
    expect(useAuthStore.getState().tokens).toEqual(NEW);
  });

  it("still logs out when the session is really over (refused, and no tab has anything newer)", async () => {
    serve(blacklisted);
    await expect(apiClient.get(PROTECTED)).rejects.toBeTruthy();
    expect(loggedOut()).toBe(true);
    expect(useAuthStore.getState().tokens).toBeNull();
  });

  it("refreshes normally in a single tab", async () => {
    const calls = serve(() => HttpResponse.json(NEW));
    await apiClient.get(PROTECTED);
    expect(calls.refresh).toEqual([OLD.refresh]);
    expect(useAuthStore.getState().tokens).toEqual(NEW);
  });

  it("keeps the session when the refresh can't reach the server", async () => {
    serve(() => HttpResponse.error());
    await expect(apiClient.get(PROTECTED)).rejects.toBeTruthy();
    expect(loggedOut()).toBe(false);
    expect(useAuthStore.getState().tokens).toEqual(OLD);
  });

  it("picks up another tab's write immediately via the storage event", async () => {
    otherTabSaves(NEW);
    window.dispatchEvent(new StorageEvent("storage", { key: AUTH_STORAGE_KEY }));
    await vi.waitFor(() => expect(useAuthStore.getState().tokens).toEqual(NEW));
  });
});
