// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { roster } from "@/test/fixtures";

import type { BehavioralTrait } from "../types";
import { BehaviourPage } from "./behaviour-page";

// The page is a composition of data hooks; these tests are about what it
// renders for a given set of traits, so every hook is stubbed.
const state = { traits: [] as BehavioralTrait[], isAdmin: false };
const STUDENTS = roster("s1", "s2");
const idle = { isPending: false, isPaused: false };

vi.mock("../hooks/use-score-sheets", () => ({
  useScoreSheets: () => ({ currentTerm: { id: "term-1", label: "First Term" }, isPending: false, unavailableOffline: false }),
}));
vi.mock("@/features/teacher/hooks/use-my-classes", () => ({
  useMyClasses: () => ({
    classes: [{ classArmId: "arm-1", label: "Primary 4A", isFormClass: true }],
    isPending: false,
    unavailableOffline: false,
  }),
}));
vi.mock("@/features/settings/hooks/use-classes", () => ({
  useClasses: () => ({ data: [{ level: "primary", arms: [{ id: "arm-1" }] }] }),
}));
vi.mock("@/features/attendance/hooks/use-register", () => ({
  useRoster: () => ({ data: { students: STUDENTS }, ...idle }),
}));
vi.mock("@/features/attendance/components/sync-status-strip", () => ({ SyncStatusStrip: () => null }));
vi.mock("../hooks/use-broadsheet", () => ({ useBroadsheet: () => ({ rows: [], columns: [] }) }));
vi.mock("@/lib/auth/use-personas", () => ({ useIsSchoolAdmin: () => state.isAdmin }));
vi.mock("../hooks/use-traits", () => ({
  useTraits: () => ({ data: state.traits, ...idle }),
  useTraitRatings: () => ({ data: { ratings: [] }, ...idle, dataUpdatedAt: 1 }),
  useBulkRate: () => ({ mutate: vi.fn(), isPending: false, isPaused: false }),
  useRemarks: () => ({ data: [] }),
  useSetClassTeacherRemark: () => ({ mutate: vi.fn(), isPending: false }),
}));

const trait = (over: Partial<BehavioralTrait>): BehavioralTrait => ({
  id: "t1",
  level: "primary",
  category: "affective",
  name: "Punctuality",
  order: 1,
  is_active: true,
  ...over,
});

describe("BehaviourPage", () => {
  beforeEach(() => {
    state.traits = [];
    state.isAdmin = false;
  });

  // The reported bug: no traits replaced the student list with an empty state,
  // taking the class teacher's remark (writable nowhere else) with it.
  it("still lets a form teacher write remarks when the school rates no behaviour", () => {
    render(<BehaviourPage />);

    expect(screen.getByRole("heading", { name: "Remarks" })).toBeInTheDocument();
    expect(screen.getAllByText("Class teacher's remark")).toHaveLength(STUDENTS.length);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save ratings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Affective" })).not.toBeInTheDocument();
  });

  it("points an admin to Behaviour Traits when none are set up", () => {
    state.isAdmin = true;
    render(<BehaviourPage />);
    expect(screen.getByRole("link", { name: "Behaviour Traits" })).toHaveAttribute("href", "/settings/behaviour-traits");
  });

  it("goes straight to the one category a school rates, with no dead toggle", () => {
    state.traits = [trait({ category: "psychomotor", name: "Handwriting" })];
    render(<BehaviourPage />);

    expect(screen.getByRole("heading", { name: "Behaviour & Remarks" })).toBeInTheDocument();
    expect(screen.getByText("Psychomotor traits")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Affective" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("radiogroup", { name: /Handwriting for/ })).toHaveLength(STUDENTS.length);
    expect(screen.getAllByText("Class teacher's remark")).toHaveLength(STUDENTS.length);
  });

  it("offers the toggle only when both categories have traits", () => {
    state.traits = [trait({ id: "a" }), trait({ id: "p", category: "psychomotor", name: "Handwriting" })];
    render(<BehaviourPage />);

    expect(screen.getByRole("button", { name: "Affective" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Psychomotor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save ratings" })).toBeInTheDocument();
  });
});
