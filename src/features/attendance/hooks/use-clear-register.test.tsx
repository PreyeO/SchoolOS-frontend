// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ATTENDANCE_ENDPOINTS } from "@/lib/api/endpoints";
import { record, roster, signInAs } from "@/test/fixtures";
import { apiUrl, server } from "@/test/msw/server";

import { draftKey, readDraft } from "../lib/draft-storage";
import type { AttendanceRecord, BulkClearResponse } from "../types";
import { clearRegisterStudentIds, useClearRegister } from "./use-clear-register";
import { useAttendance } from "./use-register";
import { useRegisterDraft } from "./use-register-draft";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() } }));

const SAT = "2026-10-10";
const students = roster("s1", "s2");

// A server holding one register, which the clear empties (minus any skipped).
function serve(skipped: BulkClearResponse["skipped"] = []) {
  let records: AttendanceRecord[] = [record("s1", "present"), record("s2", "absent")];
  const bodies: unknown[] = [];
  server.use(
    http.get(apiUrl(ATTENDANCE_ENDPOINTS.LIST()), () =>
      HttpResponse.json({ count: records.length, next: null, previous: null, results: records }),
    ),
    http.post(apiUrl(ATTENDANCE_ENDPOINTS.BULK_CLEAR()), async ({ request }) => {
      const body = (await request.json()) as { student_ids: string[] };
      bodies.push(body);
      const kept = new Set(skipped.map((s) => s.student_id));
      const cleared = body.student_ids.filter((id) => !kept.has(id));
      records = records.filter((r) => !cleared.includes(r.student.id));
      return HttpResponse.json({ cleared, skipped });
    }),
  );
  return bodies;
}

// The register page's wiring, without the page.
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(
    () => {
      const saved = useAttendance("arm", SAT);
      const register = useRegisterDraft("arm", SAT, saved.data, students);
      const clear = useClearRegister("arm", SAT, register.reset);
      return { saved, register, clear };
    },
    { wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> },
  );
}

function clearAll(result: ReturnType<typeof setup>["result"]) {
  const ids = clearRegisterStudentIds(students.map((s) => s.id), result.current.saved.data);
  return act(() =>
    result.current.clear.mutateAsync({ class_arm_id: "arm", date: SAT, student_ids: ids, cleared_at: "2026-10-12T08:00:00Z" }),
  );
}

describe("useClearRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInAs("m1");
  });

  it("empties the register, and the old marks don't seed back from the draft", async () => {
    const bodies = serve();
    const { result } = setup();
    await waitFor(() => expect(Object.keys(result.current.register.draft)).toHaveLength(2));
    // An unsaved edit on the device, which the clear discards.
    act(() => result.current.register.setStatus("s1", "late"));

    await clearAll(result);

    expect(bodies).toEqual([{ class_arm_id: "arm", date: SAT, student_ids: ["s1", "s2"], cleared_at: "2026-10-12T08:00:00Z" }]);
    await waitFor(() => expect(result.current.register.draft).toEqual({}));
    expect(result.current.saved.data).toEqual([]);
    expect(readDraft("m1", draftKey("arm", SAT)) ?? {}).toEqual({});
    expect(toast.success).toHaveBeenCalledWith("Register cleared for 2 students.");
  });

  it("keeps a mark the server skipped, and says why", async () => {
    serve([{ student_id: "s2", reason: "a newer mark exists" }]);
    const { result } = setup();
    await waitFor(() => expect(result.current.saved.data).toHaveLength(2));

    await clearAll(result);

    await waitFor(() => expect(result.current.register.draft).toEqual({ s2: { status: "absent", note: "" } }));
    expect(toast.warning).toHaveBeenCalledWith("Cleared 1. 1 kept: a newer mark exists.");
  });

  it("shows the server's refusal and leaves the register alone", async () => {
    serve();
    server.use(
      http.post(apiUrl(ATTENDANCE_ENDPOINTS.BULK_CLEAR()), () =>
        HttpResponse.json({ detail: "Only teachers can mark attendance." }, { status: 403 }),
      ),
    );
    const { result } = setup();
    await waitFor(() => expect(result.current.saved.data).toHaveLength(2));

    await expect(clearAll(result)).rejects.toThrow();

    expect(toast.error).toHaveBeenCalledWith("Only teachers can mark attendance.");
    expect(Object.keys(result.current.register.draft)).toHaveLength(2);
  });
});

describe("clearRegisterStudentIds", () => {
  it("names the roster plus anyone with a mark here who has since moved arm", () => {
    const saved = [record("s1", "present"), record("moved", "absent")];
    expect(clearRegisterStudentIds(["s1", "s2"], saved)).toEqual(["s1", "s2", "moved"]);
  });
});
