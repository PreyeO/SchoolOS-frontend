// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { roster, score, signInAs } from "@/test/fixtures";

import { readScoreDraft, scoreDraftKey, writeScoreDraft } from "../lib/score-draft-storage";
import type { BulkScoreEntryPayload, Score } from "../types";
import { SCORE_ENTRY_MUTATION_KEY } from "./use-enter-scores";
import { scoreError, useScoreDraft, type ScoreSheetKeys } from "./use-score-draft";

const KEYS: ScoreSheetKeys = { classArmId: "arm", subjectId: "maths", academicPeriodId: "t1", gradeComponentId: "ca1" };
const KEY = scoreDraftKey("arm", "maths", "t1", "ca1");
const students = roster("s1", "s2", "s3");
const MAX = 20;

function setup(client: QueryClient, initial: { scores: Score[]; at: number }) {
  return renderHook((p: { scores: Score[]; at: number }) => useScoreDraft(KEYS, p.scores, students, p.at, MAX), {
    initialProps: initial,
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
}

// A save that is queued but hasn't reached the server — e.g. made offline.
function queueSave(client: QueryClient, entries: { student_id: string; score: number }[]) {
  const payload: BulkScoreEntryPayload = {
    class_arm_id: "arm",
    subject_id: "maths",
    academic_period_id: "t1",
    entries: entries.map((e) => ({ ...e, grade_component_id: "ca1", marked_at: "2026-10-01T08:00:00Z" })),
  };
  const mutation = client.getMutationCache().build(client, {
    mutationKey: SCORE_ENTRY_MUTATION_KEY,
    mutationFn: () => new Promise(() => {}),
  });
  void mutation.execute(payload);
}

describe("useScoreDraft", () => {
  let client: QueryClient;
  beforeEach(() => {
    signInAs("m1");
    client = new QueryClient();
  });

  it("counts as unsaved only valid values that differ from the server", () => {
    const { result } = setup(client, { scores: [score("s1", "ca1", "10")], at: 1 });
    act(() => {
      result.current.setScore("s1", "10"); // same as saved
      result.current.setScore("s2", "25"); // over the max
      result.current.setScore("s3", "12"); // new
    });
    expect(result.current.changed).toEqual([["s3", "12"]]);
  });

  it("never counts a cleared cell as sendable", () => {
    const { result } = setup(client, { scores: [score("s1", "ca1", "10")], at: 1 });
    act(() => result.current.setScore("s1", "  "));
    expect(result.current.changed).toEqual([]);
  });

  it("treats a queued save as committed, without deleting the only stored copy", async () => {
    const { result } = setup(client, { scores: [], at: 1 });
    act(() => result.current.setScore("s1", "15"));
    act(() => queueSave(client, [{ student_id: "s1", score: 15 }]));

    await waitFor(() => expect(result.current.queued).toEqual({ s1: "15" }));
    expect(result.current.changed).toEqual([]);
    // Regression: the draft used to be cleared here, so a refresh while still
    // offline lost the score until the queue finally flushed.
    expect(readScoreDraft("m1", KEY)).toEqual({ s1: "15" });
  });

  it("drops the stored draft once the server holds every entry", () => {
    writeScoreDraft("m1", KEY, { s1: "15" });
    const hook = setup(client, { scores: [], at: 1 });
    expect(readScoreDraft("m1", KEY)).toEqual({ s1: "15" });

    hook.rerender({ scores: [score("s1", "ca1", "15.00")], at: 2 });
    expect(readScoreDraft("m1", KEY)).toBeNull();
  });

  it("keeps the stored draft while any entry is still unconfirmed", () => {
    writeScoreDraft("m1", KEY, { s1: "15", s2: "9" });
    const hook = setup(client, { scores: [], at: 1 });
    hook.rerender({ scores: [score("s1", "ca1", "15")], at: 2 });
    expect(readScoreDraft("m1", KEY)).toEqual({ s1: "15", s2: "9" });
  });

  it("totals other components plus what's being typed in this one", () => {
    const scores = [score("s1", "exam", "50"), score("s1", "ca2", "8"), score("s1", "ca1", "10")];
    const { result } = setup(client, { scores, at: 1 });
    expect(result.current.totals.get("s1")).toBe(68);
    act(() => result.current.setScore("s1", "14"));
    expect(result.current.totals.get("s1")).toBe(72);
  });
});

describe("scoreError", () => {
  it("explains what's wrong with a typed value", () => {
    expect(scoreError("", MAX)).toBeNull();
    expect(scoreError("12.5", MAX)).toBeNull();
    expect(scoreError("abc", MAX)).toBe("Numbers only");
    expect(scoreError("-1", MAX)).toBe("Can't be negative");
    expect(scoreError("21", MAX)).toBe("Max is 20");
  });
});
