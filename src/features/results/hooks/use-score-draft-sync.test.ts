// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { StudentListItem } from "@/features/students/types";
import { roster, score, signInAs } from "@/test/fixtures";

import { readScoreDraft, scoreDraftKey, writeScoreDraft } from "../lib/score-draft-storage";
import type { Score } from "../types";
import type { ScoreSheetKeys } from "./use-score-draft";
import { useScoreDraftSync } from "./use-score-draft-sync";

const CA1: ScoreSheetKeys = { classArmId: "arm", subjectId: "maths", academicPeriodId: "t1", gradeComponentId: "ca1" };
const EXAM: ScoreSheetKeys = { ...CA1, gradeComponentId: "exam" };
const KEY_CA1 = scoreDraftKey("arm", "maths", "t1", "ca1");
const KEY_EXAM = scoreDraftKey("arm", "maths", "t1", "exam");

interface Props {
  keys: ScoreSheetKeys;
  scores: Score[] | undefined;
  students: StudentListItem[] | undefined;
  at: number;
}

function setup(initial: Props) {
  return renderHook((p: Props) => useScoreDraftSync(p.keys, p.scores, p.students, p.at), { initialProps: initial });
}

const students = roster("s1", "s2");

describe("useScoreDraftSync", () => {
  beforeEach(() => signInAs("m1"));

  it("seeds the column from the server, for this component and roster only", () => {
    const scores = [score("s1", "ca1", "18.00"), score("s2", "exam", "50"), score("gone", "ca1", "9")];
    const { result } = setup({ keys: CA1, scores, students, at: 1 });
    // "18.00" is shown as "18"; the exam score and the transferred student are left out.
    expect(result.current.draft).toEqual({ s1: "18" });
  });

  it("puts a stored draft on top of the server's copy after a reload", () => {
    writeScoreDraft("m1", KEY_CA1, { s1: "12", s2: "7" });
    const { result } = setup({ keys: CA1, scores: [score("s1", "ca1", "18")], students, at: 1 });
    expect(result.current.draft).toEqual({ s1: "12", s2: "7" });
  });

  it("drops stored entries for students no longer on the roster", () => {
    writeScoreDraft("m1", KEY_CA1, { s1: "12", gone: "3" });
    const { result } = setup({ keys: CA1, scores: [], students, at: 1 });
    expect(result.current.draft).toEqual({ s1: "12" });
  });

  it("doesn't wipe a stored draft while the column's data is still loading", () => {
    writeScoreDraft("m1", KEY_CA1, { s1: "12" });
    const hook = setup({ keys: CA1, scores: undefined, students, at: 0 });
    expect(readScoreDraft("m1", KEY_CA1)).toEqual({ s1: "12" });

    hook.rerender({ keys: CA1, scores: [], students, at: 1 });
    expect(hook.result.current.draft).toEqual({ s1: "12" });
  });

  it("mirrors edits to device storage under the signed-in membership", () => {
    const { result } = setup({ keys: CA1, scores: [], students, at: 1 });
    act(() => result.current.setDraft({ s1: "15" }));
    expect(readScoreDraft("m1", KEY_CA1)).toEqual({ s1: "15" });
    expect(readScoreDraft("someone-else", KEY_CA1)).toBeNull();
  });

  it("doesn't carry one column's edits into another", () => {
    const scores = [score("s1", "ca1", "10"), score("s1", "exam", "40")];
    const hook = setup({ keys: CA1, scores, students, at: 1 });
    act(() => hook.result.current.setDraft({ s1: "11", s2: "9" }));

    hook.rerender({ keys: EXAM, scores, students, at: 1 });
    expect(hook.result.current.draft).toEqual({ s1: "40" });
    // The CA1 edits are still kept for when the teacher switches back.
    expect(readScoreDraft("m1", KEY_CA1)).toEqual({ s1: "11", s2: "9" });
    expect(readScoreDraft("m1", KEY_EXAM)).toEqual({ s1: "40" });
  });

  it("on fresher data, shows a colleague's entry but keeps local typing", () => {
    const hook = setup({ keys: CA1, scores: [score("s1", "ca1", "10"), score("s2", "ca1", "5")], students, at: 1 });
    act(() => hook.result.current.setDraft((d) => ({ ...d, s1: "13" })));

    // A colleague changed s2 on another device; s1 is unchanged on the server.
    const fresher = [score("s1", "ca1", "10"), score("s2", "ca1", "8")];
    hook.rerender({ keys: CA1, scores: fresher, students, at: 2 });
    expect(hook.result.current.draft).toEqual({ s1: "13", s2: "8" });
  });

  it("on fresher data, updates cells the teacher never touched", () => {
    const hook = setup({ keys: CA1, scores: [score("s1", "ca1", "10")], students, at: 1 });
    hook.rerender({ keys: CA1, scores: [score("s1", "ca1", "14")], students, at: 2 });
    expect(hook.result.current.draft).toEqual({ s1: "14" });
  });

  it("ignores a re-render that isn't newer server data", () => {
    const hook = setup({ keys: CA1, scores: [score("s1", "ca1", "10")], students, at: 5 });
    act(() => hook.result.current.setDraft({ s1: "12" }));
    hook.rerender({ keys: CA1, scores: [score("s1", "ca1", "99")], students, at: 5 });
    expect(hook.result.current.draft).toEqual({ s1: "12" });
  });

  it("waits until every key is chosen", () => {
    const { result } = setup({ keys: { ...CA1, gradeComponentId: null }, scores: [], students, at: 1 });
    expect(result.current.ready).toBe(false);
    expect(result.current.draft).toEqual({});
  });
});
