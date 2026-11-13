// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { RankedRow } from "../hooks/use-leaderboard";
import { LeaderboardTable } from "./leaderboard-table";

const row = { studentId: "s1", rank: 1, score: 18, grade: "F9", armLabel: null,
  student: { admission_number: "ADM/001", user: { first_name: "Ada", last_name: "Obi" } } } as unknown as RankedRow;

describe("LeaderboardTable grades", () => {
  // After only the first CA, an 18 graded out of 100 is "F9" for everyone.
  it("hides the grade unless asked, keeping the score", () => {
    render(<LeaderboardTable rows={[row]} unit="" showArm={false} showGrades={false} />);
    expect(screen.queryByText("F9")).not.toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });

  it("shows it when switched on", () => {
    render(<LeaderboardTable rows={[row]} unit="" showArm={false} showGrades />);
    expect(screen.getByText("F9")).toBeInTheDocument();
  });
});
