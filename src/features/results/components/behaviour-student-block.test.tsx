// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { student } from "@/test/fixtures";

import { BehaviourStudentBlock } from "./behaviour-student-block";

function renderBlock(traits: Parameters<typeof BehaviourStudentBlock>[0]["traits"]) {
  const ada = student("s1");
  render(
    <ul>
      <BehaviourStudentBlock
        student={ada}
        traits={traits}
        draft={{}}
        onRate={vi.fn()}
        remark={undefined}
        isSavingRemark={false}
        onSaveRemark={vi.fn()}
        resultRow={undefined}
        resultColumns={[]}
      />
    </ul>,
  );
  return ada;
}

describe("BehaviourStudentBlock", () => {
  // The bug: with no traits the whole list was replaced by an empty state, and
  // the remark box (writable nowhere else) went with it.
  it("still offers the class teacher's remark when the school rates no behaviour", () => {
    const ada = renderBlock([]);
    expect(screen.getByText(`${ada.user.first_name} ${ada.user.last_name}`)).toBeInTheDocument();
    expect(screen.getByText("Class teacher's remark")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("shows a rating scale per trait alongside the remark", () => {
    const ada = renderBlock([
      { id: "t1", level: "primary", category: "affective", name: "Punctuality", order: 1, is_active: true },
    ]);
    expect(screen.getByRole("radiogroup", { name: `Punctuality for ${ada.user.first_name}` })).toBeInTheDocument();
    expect(screen.getByText("Class teacher's remark")).toBeInTheDocument();
  });
});
