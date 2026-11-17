// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GUARDIAN_CONTACT_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { GuardianContact } from "../types";
import { ContactFormDialog } from "./contact-form-dialog";

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: toastError } }));

const student = { id: "s1", name: "Ada Obi", admission_number: "ADM/001" };
const contact = {
  id: "g1", student: "s1", student_name: "Ada Obi", admission_number: "ADM/001",
  name: "Ngozi Obi", phone: "+2348031234567", is_primary: true,
} as GuardianContact;

function serve(reply?: () => Response) {
  const bodies: { method: string; body: unknown }[] = [];
  const record = async ({ request }: { request: Request }) => {
    bodies.push({ method: request.method, body: await request.json() });
    return reply?.() ?? HttpResponse.json({ ...contact, id: "g2" }, { status: 201 });
  };
  server.use(
    http.post(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.LIST()), record),
    http.patch(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.DETAIL("g1")), record),
  );
  return bodies;
}

describe("ContactFormDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds for a given student, sending the number as +234…", async () => {
    const bodies = serve();
    const onClose = vi.fn();
    const { user } = renderWithClient(<ContactFormDialog open student={student} onClose={onClose} />);

    await user.type(screen.getByLabelText("Parent or guardian's name"), "  Ngozi Obi ");
    await user.type(screen.getByLabelText("Mobile number"), "0803 123 4567");
    await user.click(screen.getByRole("button", { name: "Save number" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toEqual([
      { method: "POST", body: { student_id: "s1", name: "Ngozi Obi", phone: "+2348031234567", is_primary: true } },
    ]);
  });

  it("stops an obvious typo before any request", async () => {
    const bodies = serve();
    const { user } = renderWithClient(<ContactFormDialog open student={student} onClose={() => {}} />);
    await user.type(screen.getByLabelText("Parent or guardian's name"), "Ngozi");
    await user.type(screen.getByLabelText("Mobile number"), "080312");
    await user.click(screen.getByRole("button", { name: "Save number" }));

    expect(await screen.findByText(/Enter a Nigerian mobile number/)).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it("edits by sending only what changed, and can't un-main the main number", async () => {
    const bodies = serve(() => HttpResponse.json(contact));
    const onClose = vi.fn();
    const { user } = renderWithClient(<ContactFormDialog open contact={contact} onClose={onClose} />);

    // Shown the way people write it, and no checkbox to untick.
    expect(screen.getByLabelText("Mobile number")).toHaveValue("0803 123 4567");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByText(/This is the main number/)).toBeInTheDocument();

    const name = screen.getByLabelText("Parent or guardian's name");
    await user.clear(name);
    await user.type(name, "Mrs Ngozi Obi");
    await user.click(screen.getByRole("button", { name: "Save number" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toEqual([{ method: "PATCH", body: { name: "Mrs Ngozi Obi" } }]);
  });

  it("keeps the dialog open and toasts the server's reason when it refuses the number", async () => {
    serve(() => HttpResponse.json({ detail: "Enter a valid Nigerian mobile number." }, { status: 400 }));
    const onClose = vi.fn();
    const { user } = renderWithClient(<ContactFormDialog open student={student} onClose={onClose} />);
    await user.type(screen.getByLabelText("Parent or guardian's name"), "Ngozi");
    await user.type(screen.getByLabelText("Mobile number"), "07001234567");
    await user.click(screen.getByRole("button", { name: "Save number" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Enter a valid Nigerian mobile number."));
    expect(onClose).not.toHaveBeenCalled();
  });
});
