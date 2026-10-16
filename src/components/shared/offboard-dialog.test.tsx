// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOffboardTeacher } from "@/features/staff/hooks/use-offboard-teacher";
import { useTeacherDetail } from "@/features/staff/hooks/use-teacher-detail";
import { TEACHER_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { OffboardDialog, otherPersonasOf } from "./offboard-dialog";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// The teacher detail page's wiring, minus the page: the detail query stays
// mounted while the offboard runs, exactly as it does there.
function TeacherPage({ otherPersonas = [] as string[] }) {
  useTeacherDetail("t1");
  const offboard = useOffboardTeacher("t1");
  return (
    <OffboardDialog
      personName="Ada Obi"
      role="teacher"
      consequence="They'll be removed from every class."
      otherPersonas={otherPersonas}
      isPending={offboard.isPending}
      onConfirm={(reason) => offboard.mutateAsync(reason)}
    />
  );
}

function serve(offboardReply: () => Response = () => HttpResponse.json({})) {
  const calls = { detail: 0, offboard: [] as unknown[] };
  server.use(
    http.get(apiUrl(TEACHER_ENDPOINTS.DETAIL("t1")), () => {
      calls.detail += 1;
      return HttpResponse.json({ id: "t1" });
    }),
    http.post(apiUrl(TEACHER_ENDPOINTS.OFFBOARD("t1")), async ({ request }) => {
      calls.offboard.push(await request.json());
      return offboardReply();
    }),
  );
  return calls;
}

async function openDialog(otherPersonas?: string[]) {
  const view = renderWithClient(<TeacherPage otherPersonas={otherPersonas} />);
  await view.user.click(screen.getByRole("button", { name: "Offboard" }));
  return view;
}

describe("OffboardDialog (teacher)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("warns that a sole role means losing access to the school", async () => {
    serve();
    await openDialog();
    expect(screen.getByRole("dialog")).toHaveTextContent("no longer be able to sign in to this school");
  });

  it("says which access they keep when they hold another role", async () => {
    serve();
    await openDialog(["admin"]);
    expect(screen.getByRole("dialog")).toHaveTextContent("They keep their access as admin.");
  });

  it("needs a written reason before it will offboard", async () => {
    serve();
    const { user } = await openDialog();
    const confirm = screen.getByRole("button", { name: "Offboard" });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText("Reason"), "   ");
    expect(confirm).toBeDisabled();
  });

  it("sends the trimmed reason, closes, and doesn't refetch the deleted profile", async () => {
    const calls = serve();
    const { user } = await openDialog();
    await waitFor(() => expect(calls.detail).toBe(1));

    await user.type(screen.getByLabelText("Reason"), "  Contract ended ");
    await user.click(screen.getByRole("button", { name: "Offboard" }));

    await waitFor(() => expect(calls.offboard).toEqual([{ reason: "Contract ended" }]));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(toast.success).toHaveBeenCalledWith("Teacher offboarded");
    // A refetch here would 404 and flash an error before the redirect.
    expect(calls.detail).toBe(1);
  });

  it("keeps the dialog and the typed reason when the server refuses", async () => {
    serve(() => HttpResponse.json({ detail: "Cannot offboard the school owner." }, { status: 400 }));
    const { user } = await openDialog();
    await user.type(screen.getByLabelText("Reason"), "Left");
    await user.click(screen.getByRole("button", { name: "Offboard" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Cannot offboard the school owner."));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason")).toHaveValue("Left");
  });
});

describe("otherPersonasOf", () => {
  const none = { is_admin: false, is_teacher: false, is_parent: false, is_student: false };

  it("lists the roles left after removing one", () => {
    expect(otherPersonasOf({ ...none, is_admin: true, is_teacher: true }, "teacher")).toEqual(["admin"]);
    expect(otherPersonasOf({ ...none, is_teacher: true }, "teacher")).toEqual([]);
    expect(otherPersonasOf({ ...none, is_parent: true, is_teacher: true }, "parent")).toEqual(["teacher"]);
  });
});
