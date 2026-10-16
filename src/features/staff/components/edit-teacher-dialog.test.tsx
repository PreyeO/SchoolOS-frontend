// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TEACHER_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { TeacherEditValues } from "../schemas/teacher-edit-schema";
import { EditTeacherDialog } from "./edit-teacher-dialog";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const initial: TeacherEditValues = {
  first_name: "Ada",
  last_name: "Obi",
  phone_number: "+2348012345678",
  employee_id: "T-001",
  qualification: "B.Ed",
  specialization: "Maths",
  teacher_type: "both",
};

// Records every PATCH body the dialog sends, answering with `reply`.
function capturePatches(reply: () => Response = () => HttpResponse.json({})) {
  const bodies: unknown[] = [];
  server.use(
    http.patch(apiUrl(TEACHER_ENDPOINTS.DETAIL("t1")), async ({ request }) => {
      bodies.push(await request.json());
      return reply();
    }),
  );
  return bodies;
}

function open(mode: "admin" | "self", counts?: { subjectAssignments: number; classesLed: number }) {
  const view = renderWithClient(
    <EditTeacherDialog teacherId="t1" initial={initial} mode={mode} counts={counts} trigger={<button>Edit</button>} />,
  );
  return { ...view, ready: view.user.click(screen.getByRole("button", { name: "Edit" })) };
}

describe("EditTeacherDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lets a teacher edit only their name and phone", async () => {
    const { ready } = open("self");
    await ready;
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.queryByLabelText("Employee ID")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Type")).not.toBeInTheDocument();
  });

  it("sends only what changed, then closes and confirms", async () => {
    const bodies = capturePatches();
    const { user, ready } = open("self");
    await ready;
    await user.clear(screen.getByLabelText("First name"));
    await user.type(screen.getByLabelText("First name"), "Adaeze");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(bodies).toEqual([{ first_name: "Adaeze" }]));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(toast.success).toHaveBeenCalledWith("Profile updated");
  });

  it("closes without a request when nothing changed", async () => {
    const bodies = capturePatches();
    const { user, ready } = open("self");
    await ready;
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(bodies).toEqual([]);
  });

  it("blocks a blank name before it reaches the server", async () => {
    const bodies = capturePatches();
    const { user, ready } = open("self");
    await ready;
    await user.clear(screen.getByLabelText("Last name"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByLabelText("Last name")).toHaveAttribute("aria-invalid", "true");
    expect(bodies).toEqual([]);
  });

  it("warns an admin about a type change that will be refused, but still lets them try", async () => {
    const bodies = capturePatches(() =>
      HttpResponse.json({ detail: "Teacher still has subject assignments." }, { status: 400 }),
    );
    const { user, ready } = open("admin", { subjectAssignments: 2, classesLed: 0 });
    await ready;
    await user.selectOptions(screen.getByLabelText("Type"), "class");

    expect(screen.getByRole("alert")).toHaveTextContent("2 subject assignments");
    const save = screen.getByRole("button", { name: "Save" });
    expect(save).toBeEnabled();

    await user.click(save);
    await waitFor(() => expect(bodies).toEqual([{ teacher_type: "class" }]));
    // The server's own words are shown, and the dialog stays open to fix it.
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Teacher still has subject assignments."));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
