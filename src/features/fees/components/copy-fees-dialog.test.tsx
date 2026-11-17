// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FEE_ITEM_ENDPOINTS } from "@/lib/api/endpoints";
import type { ClassOptionGroup } from "@/lib/school/class-options";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { CopyFeesDialog } from "./copy-fees-dialog";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const groups: ClassOptionGroup[] = [
  { level: "primary", levelLabel: "Primary", options: [{ classId: "p6", label: "Primary 6", level: "primary" }] },
  {
    level: "junior_secondary",
    levelLabel: "Junior Secondary (JSS)",
    options: ["j1", "j2", "j3"].map((id, i) => ({ classId: id, label: `JSS ${i + 1}`, level: "junior_secondary" as const })),
  },
];
const lines = [{ name: "Tuition", amount: 50000 }, { name: "PTA", amount: 2000 }];

// What each class already bills, and what the dialog creates. `refuse` fails a class's creates.
function serve(existing: Record<string, string[]>, refuse?: string) {
  const created: { klass_id: string; name: string; amount: number }[] = [];
  server.use(
    http.get(apiUrl(FEE_ITEM_ENDPOINTS.LIST()), ({ request }) => {
      const klass = new URL(request.url).searchParams.get("klass") ?? "";
      const results = (existing[klass] ?? []).map((name) => ({ id: name, name, amount: 1, is_active: true }));
      return HttpResponse.json({ count: results.length, next: null, previous: null, results });
    }),
    http.post(apiUrl(FEE_ITEM_ENDPOINTS.LIST()), async ({ request }) => {
      const body = (await request.json()) as { klass_id: string; name: string; amount: number; academic_period_id: string };
      if (body.klass_id === refuse) return HttpResponse.json({ detail: "Class not found in this school." }, { status: 400 });
      expect(body.academic_period_id).toBe("term-1");
      created.push({ klass_id: body.klass_id, name: body.name, amount: body.amount });
      return HttpResponse.json({ id: "new", ...body });
    }),
  );
  return created;
}

async function open() {
  const view = renderWithClient(
    <CopyFeesDialog lines={lines} sourceClassId="j1" sourceLabel="JSS 1" termLabel="First Term" periodId="term-1" classGroups={groups} />,
  );
  await view.user.click(screen.getByRole("button", { name: /copy to other classes/i }));
  return view;
}

describe("CopyFeesDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts with the rest of the source's level ticked and other levels not", async () => {
    await open();
    expect(screen.getByRole("checkbox", { name: "JSS 2" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "JSS 3" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Primary 6" })).not.toBeChecked();
    expect(screen.queryByRole("checkbox", { name: "JSS 1" })).not.toBeInTheDocument();
  });

  it("adds what each class lacks and leaves a fee it already has alone", async () => {
    const created = serve({ j3: ["tuition"] });
    const { user } = await open();
    await user.click(screen.getByRole("button", { name: "Copy to 2 classes" }));

    await waitFor(() => expect(created).toHaveLength(3));
    expect(created).toEqual([
      { klass_id: "j2", name: "Tuition", amount: 50000 },
      { klass_id: "j2", name: "PTA", amount: 2000 },
      { klass_id: "j3", name: "PTA", amount: 2000 },
    ]);
    expect(toast.success).toHaveBeenCalledWith("Copied to 2 classes: 3 fees added. Skipped 1 fee a class already had (amounts unchanged).");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("names a class that refused and still copies to the others", async () => {
    const created = serve({}, "j2");
    const { user } = await open();
    await user.click(screen.getByRole("button", { name: "Copy to 2 classes" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("JSS 2: Class not found in this school."));
    expect(created.map((c) => c.klass_id)).toEqual(["j3", "j3"]);
    expect(toast.success).toHaveBeenCalledWith("Copied to 1 class: 2 fees added.");
  });

  it("ticks a whole level at once", async () => {
    const { user } = await open();
    await user.click(screen.getAllByRole("button", { name: "Select all" })[0]);
    expect(screen.getByRole("checkbox", { name: "Primary 6" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Copy to 3 classes" })).toBeEnabled();
  });
});
