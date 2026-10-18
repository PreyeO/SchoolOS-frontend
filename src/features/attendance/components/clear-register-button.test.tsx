// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClearRegisterButton } from "./clear-register-button";

function renderButton(overrides: Partial<React.ComponentProps<typeof ClearRegisterButton>> = {}) {
  const onConfirm = vi.fn();
  render(
    <ClearRegisterButton
      classArmId="arm"
      date="2026-10-10"
      armLabel="JSS1 A"
      studentIds={["s1", "s2"]}
      markedCount={2}
      blockedReason={null}
      isPending={false}
      onConfirm={onConfirm}
      {...overrides}
    />,
  );
  return { onConfirm, user: userEvent.setup() };
}

describe("ClearRegisterButton", () => {
  it("names the arm and the full date, weekday included, before clearing", async () => {
    const { user, onConfirm } = renderButton();
    await user.click(screen.getByRole("button", { name: /Unmark all/ }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Unmark everyone in JSS1 A for Saturday, Oct 10, 2026?",
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("This removes 2 saved marks");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("sends every student with the moment of the clear", async () => {
    const { user, onConfirm } = renderButton();
    await user.click(screen.getByRole("button", { name: /Unmark all/ }));
    await user.click(screen.getByRole("button", { name: "Unmark all" }));

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ class_arm_id: "arm", date: "2026-10-10", student_ids: ["s1", "s2"] }),
    );
    expect(Date.parse(onConfirm.mock.calls[0][0].cleared_at)).not.toBeNaN();
  });

  it("can't be opened while blocked, and says why", async () => {
    const { user } = renderButton({ blockedReason: "Connect to the internet to unmark a register." });
    const button = screen.getByRole("button", { name: /Unmark all/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("title", "Connect to the internet to unmark a register.");
    await user.click(button);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
