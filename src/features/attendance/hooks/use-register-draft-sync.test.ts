// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { StudentListItem } from "@/features/students/types";
import { record, roster, signInAs } from "@/test/fixtures";

import { draftKey, readDraft, writeDraft } from "../lib/draft-storage";
import type { AttendanceRecord } from "../types";
import { useRegisterDraftSync } from "./use-register-draft-sync";

interface Props {
  arm: string | null;
  date: string;
  saved: AttendanceRecord[] | undefined;
  students: StudentListItem[] | undefined;
  reconcile?: { skippedReportId: number | null; savedUpdatedAt: number };
}

function setup(initial: Props) {
  return renderHook((p: Props) => useRegisterDraftSync(p.arm, p.date, p.saved, p.students, p.reconcile), {
    initialProps: initial,
  });
}

const MON = "2026-10-05";
const TUE = "2026-10-06";
const students = roster("s1", "s2");

describe("useRegisterDraftSync", () => {
  beforeEach(() => signInAs("m1"));

  it("seeds from the server, leaving out students who have moved arm", () => {
    const saved = [record("s1", "present"), record("s2", "late", "Bus"), record("moved", "absent")];
    const { result } = setup({ arm: "arm", date: MON, saved, students });
    expect(result.current.draft).toEqual({
      s1: { status: "present", note: "" },
      s2: { status: "late", note: "Bus" },
    });
    expect(result.current.movedOut).toBe(1);
  });

  it("puts stored marks on top of the server's after a reload", () => {
    writeDraft("m1", draftKey("arm", MON), { s1: { status: "absent", note: "Sick" } });
    const { result } = setup({ arm: "arm", date: MON, saved: [record("s1", "present")], students });
    expect(result.current.draft.s1).toEqual({ status: "absent", note: "Sick" });
  });

  it("doesn't wipe stored marks while the register is still loading", () => {
    writeDraft("m1", draftKey("arm", MON), { s1: { status: "absent", note: "" } });
    const hook = setup({ arm: "arm", date: MON, saved: undefined, students });
    expect(readDraft("m1", draftKey("arm", MON))).not.toBeNull();

    hook.rerender({ arm: "arm", date: MON, saved: [], students });
    expect(hook.result.current.draft.s1?.status).toBe("absent");
  });

  it("keeps each day's register separate", () => {
    const hook = setup({ arm: "arm", date: MON, saved: [], students });
    act(() => hook.result.current.setDraft({ s1: { status: "absent", note: "" } }));

    hook.rerender({ arm: "arm", date: TUE, saved: [record("s1", "present")], students });
    expect(hook.result.current.draft).toEqual({ s1: { status: "present", note: "" } });
    expect(readDraft("m1", draftKey("arm", MON))).toEqual({ s1: { status: "absent", note: "" } });
  });

  it("reset discards local marks and goes back to the server's", () => {
    const hook = setup({ arm: "arm", date: MON, saved: [record("s1", "present")], students });
    act(() => hook.result.current.setDraft({ s1: { status: "absent", note: "" } }));
    act(() => hook.result.current.reset());
    expect(hook.result.current.draft).toEqual({ s1: { status: "present", note: "" } });
  });

  describe("after a sync where some marks were rejected", () => {
    const local = { s1: { status: "absent" as const, note: "" }, s2: { status: "late" as const, note: "" } };

    it("waits for newer server data before reverting anything", () => {
      writeDraft("m1", draftKey("arm", MON), local);
      const hook = setup({ arm: "arm", date: MON, saved: [], students, reconcile: { skippedReportId: null, savedUpdatedAt: 1 } });

      // Rejection learned, but the refetch hasn't landed: still the same data version.
      hook.rerender({ arm: "arm", date: MON, saved: [], students, reconcile: { skippedReportId: 7, savedUpdatedAt: 1 } });
      expect(hook.result.current.draft).toEqual(local);
    });

    it("reverts rejected marks to the winner and keeps the applied ones", () => {
      writeDraft("m1", draftKey("arm", MON), local);
      const hook = setup({ arm: "arm", date: MON, saved: [], students, reconcile: { skippedReportId: null, savedUpdatedAt: 1 } });
      hook.rerender({ arm: "arm", date: MON, saved: [], students, reconcile: { skippedReportId: 7, savedUpdatedAt: 1 } });

      // The refetch: s2's mark was applied, s1's lost to a colleague's "present".
      const after = [record("s1", "present"), record("s2", "late")];
      hook.rerender({ arm: "arm", date: MON, saved: after, students, reconcile: { skippedReportId: 7, savedUpdatedAt: 2 } });

      expect(hook.result.current.draft).toEqual({
        s1: { status: "present", note: "" },
        s2: { status: "late", note: "" },
      });
      expect(readDraft("m1", draftKey("arm", MON))?.s1?.status).toBe("present");
    });
  });
});
