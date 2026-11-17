// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { GUARDIAN_CONTACT_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { uploadedFileName } from "@/test/multipart";
import { renderWithClient } from "@/test/render";

import { CONTACTS_TEMPLATE_CSV } from "../lib/contacts-template";
import type { ContactImportResult } from "../types";
import { ContactsImportDialog } from "./contacts-import-dialog";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const result: ContactImportResult = {
  applied: [{ row: 2, admission_number: "ADM/001", student_id: "s1", guardian_name: "Ngozi Obi", guardian_phone: "+2348031234567" }],
  skipped: [{ row: 3, reason: "No student with admission number ADM/999." }],
};

function serve(previewResult = result) {
  const calls = { preview: [] as string[], commit: [] as string[] };
  const fileName = async (request: Request) => (await uploadedFileName(request)) ?? "NOT MULTIPART";
  server.use(
    http.post(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.IMPORT_PREVIEW()), async ({ request }) => {
      calls.preview.push(await fileName(request));
      return HttpResponse.json(previewResult);
    }),
    http.post(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.IMPORT()), async ({ request }) => {
      calls.commit.push(await fileName(request));
      return HttpResponse.json(result, { status: 201 });
    }),
  );
  return calls;
}

const csv = () => new File([CONTACTS_TEMPLATE_CSV], "parents.csv", { type: "text/csv" });

describe("ContactsImportDialog", () => {
  it("checks without saving, then imports the same file", async () => {
    const calls = serve();
    const { user } = renderWithClient(<ContactsImportDialog open onClose={() => {}} />);

    await user.upload(screen.getByLabelText("CSV file"), csv());
    await user.click(screen.getByRole("button", { name: "Check file" }));

    expect(await screen.findByText(/1 number ready to import; 1 rows will be skipped/)).toBeInTheDocument();
    expect(screen.getByText("0803 123 4567")).toBeInTheDocument();
    expect(screen.getByText("No student with admission number ADM/999.")).toBeInTheDocument();
    expect(calls.commit).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Import 1 number" }));
    expect(await screen.findByText(/1 number imported, 1 skipped/)).toBeInTheDocument();
    expect(calls).toEqual({ preview: ["parents.csv"], commit: ["parents.csv"] });
  });

  it("won't import a file where every row was skipped", async () => {
    serve({ applied: [], skipped: result.skipped });
    const { user } = renderWithClient(<ContactsImportDialog open onClose={() => {}} />);
    await user.upload(screen.getByLabelText("CSV file"), csv());
    await user.click(screen.getByRole("button", { name: "Check file" }));

    expect(await screen.findByText(/No row in this file can be imported/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Import 0 numbers/ })).toBeDisabled();
  });

  it("matches the backend's exact header in the template", () => {
    expect(CONTACTS_TEMPLATE_CSV.split("\r\n")[0]).toBe("admission_number,guardian_name,guardian_phone");
  });

  // Since backend 1cd3adf a number is unique per student, and re-imports skip.
  it("says a number a student already has is skipped, not duplicated", () => {
    serve();
    renderWithClient(<ContactsImportDialog open onClose={() => {}} />);
    expect(screen.getByText(/importing the same file twice adds nothing/)).toBeInTheDocument();
    expect(screen.queryByText(/second, identical number/)).not.toBeInTheDocument();
  });
});
