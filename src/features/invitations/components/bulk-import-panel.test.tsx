// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { uploadedFileName } from "@/test/multipart";
import { renderWithClient } from "@/test/render";

import type { BulkImportResult } from "../types";
import { BulkImportPanel } from "./bulk-import-panel";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const applied = (password: string | null) => ({
  row: 2, first_name: "Ada", last_name: "Obi", admission_number: "ADM/001", gender: "female",
  date_of_birth: null, email: "ada@school.ng", class_name: "JSS1", arm_name: "A", class_arm_id: "arm-1",
  password, password_note: null,
});
const PREVIEW: BulkImportResult = {
  applied: [applied(null)],
  skipped: [{ row: 3, reason: "Admission number ADM/002 already exists." }],
} as BulkImportResult;
const COMMITTED: BulkImportResult = { ...PREVIEW, applied: [applied("Xk7-pq92")] } as BulkImportResult;

// Records the name of the file each POST carried.
function serve(commitReply: () => Response = () => HttpResponse.json(COMMITTED)) {
  const posts = { preview: [] as string[], commit: [] as string[] };
  // Not request.formData(), which trips an undici assertion under jsdom; see test/multipart.ts.
  const fileName = async (request: Request) => (await uploadedFileName(request)) ?? "NOT MULTIPART";
  server.use(
    http.post(apiUrl(STUDENT_ENDPOINTS.BULK_IMPORT_PREVIEW()), async ({ request }) => {
      posts.preview.push(await fileName(request));
      return HttpResponse.json(PREVIEW);
    }),
    http.post(apiUrl(STUDENT_ENDPOINTS.BULK_IMPORT()), async ({ request }) => {
      posts.commit.push(await fileName(request));
      return commitReply();
    }),
  );
  return posts;
}

async function chooseAndPreview() {
  const view = renderWithClient(<BulkImportPanel />);
  const input = view.container.querySelector<HTMLInputElement>('input[type="file"]')!;
  await view.user.upload(input, new File(["first_name,..."], "jss1.csv", { type: "text/csv" }));
  await view.user.click(screen.getByRole("button", { name: "Preview import" }));
  await screen.findByText("1 ready");
  return view;
}

describe("BulkImportPanel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("previews without writing, showing ready and skipped rows", async () => {
    const posts = serve();
    await chooseAndPreview();
    expect(posts).toEqual({ preview: ["jss1.csv"], commit: [] });
    expect(screen.getByText("1 skipped")).toBeInTheDocument();
    expect(screen.getByText(/ADM\/002 already exists/)).toBeInTheDocument();
  });

  it("commits by re-sending the same file, then shows the new passwords once", async () => {
    const posts = serve();
    const { user } = await chooseAndPreview();
    await user.click(screen.getByRole("button", { name: "Create 1 student" }));

    expect(await screen.findByText("1 student created")).toBeInTheDocument();
    expect(posts.commit).toEqual(["jss1.csv"]);
    expect(screen.getByText(/won.t be shown again/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download credentials/ })).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("1 student imported");
  });

  it("stays on the preview with the server's reason when the commit is refused", async () => {
    serve(() => HttpResponse.json({ detail: "Student capacity reached." }, { status: 400 }));
    const { user } = await chooseAndPreview();
    await user.click(screen.getByRole("button", { name: "Create 1 student" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Student capacity reached."));
    expect(screen.getByRole("button", { name: "Create 1 student" })).toBeEnabled();
  });

  it("goes back to choosing a file", async () => {
    serve();
    const { user } = await chooseAndPreview();
    await user.click(screen.getByRole("button", { name: "Choose a different file" }));
    expect(screen.getByText("Click to choose a CSV file")).toBeInTheDocument();
  });
});
