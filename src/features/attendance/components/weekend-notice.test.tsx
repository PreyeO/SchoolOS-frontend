// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WeekendNotice } from "./weekend-notice";

describe("WeekendNotice", () => {
  it("names the weekend day and date", () => {
    render(<WeekendNotice date="2026-10-11" />);
    expect(screen.getByRole("status")).toHaveTextContent("Sunday, Oct 11, 2026 is a weekend.");
  });

  it("shows nothing on a school day", () => {
    const { container } = render(<WeekendNotice date="2026-10-13" />);
    expect(container).toBeEmptyDOMElement();
  });
});
