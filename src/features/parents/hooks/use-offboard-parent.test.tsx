// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { PARENT_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";

import { useOffboardParent } from "./use-offboard-parent";
import { useParentDetail } from "./use-parent-detail";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// The parent detail page's wiring: the current-parent query stays mounted
// while the offboard runs, and the page only moves to ?former=1 afterwards.
describe("useOffboardParent", () => {
  it("doesn't refetch the current-parent profile it just made 404", async () => {
    let offboarded = false;
    const detailGets: string[] = [];
    server.use(
      http.get(apiUrl(PARENT_ENDPOINTS.DETAIL("p1")), ({ request }) => {
        const former = new URL(request.url).searchParams.get("is_parent") === "false";
        detailGets.push(former ? "former" : "current");
        // The backend's rule: once offboarded, the default lookup 404s.
        if (offboarded && !former) return HttpResponse.json({ detail: "Not found." }, { status: 404 });
        return HttpResponse.json({ id: "p1" });
      }),
      http.post(apiUrl(PARENT_ENDPOINTS.OFFBOARD("p1")), () => {
        offboarded = true;
        return HttpResponse.json({});
      }),
    );

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(
      () => ({ detail: useParentDetail("p1"), offboard: useOffboardParent("p1") }),
      { wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> },
    );
    await waitFor(() => expect(result.current.detail.isSuccess).toBe(true));

    await act(() => result.current.offboard.mutateAsync("Moved away"));
    // Give any refetch time to land before checking it didn't happen.
    await new Promise((r) => setTimeout(r, 50));

    expect(detailGets).toEqual(["current"]);
    // isError here is what makes the page swap to ErrorState before the redirect.
    expect(result.current.detail.isError).toBe(false);
  });
});
