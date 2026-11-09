// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WALLET_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import { AdjustCreditsDialog } from "./adjust-credits-dialog";

const { toastSuccess, toastError } = vi.hoisted(() => ({ toastSuccess: vi.fn(), toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

function serve(...replies: (() => Response)[]) {
  const bodies: Record<string, unknown>[] = [];
  server.use(
    http.post(apiUrl(WALLET_ENDPOINTS.ADJUSTMENTS()), async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>);
      return replies[bodies.length - 1]();
    }),
  );
  return bodies;
}
const ok = () => HttpResponse.json({ id: "t1", balance_after: 150 }, { status: 201 });

async function fill(user: ReturnType<typeof renderWithClient>["user"], credits: string, reason: string) {
  await user.click(screen.getByRole("button", { name: "SMS credits" }));
  await user.type(screen.getByLabelText("Credits"), credits);
  await user.type(screen.getByLabelText("Reason"), reason);
}

describe("AdjustCreditsDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds with a positive amount and a trimmed reason, then shows the new balance", async () => {
    const bodies = serve(ok);
    const { user } = renderWithClient(<AdjustCreditsDialog schoolId="sch1" />);
    await fill(user, "50", "  Goodwill credit ");
    await user.click(screen.getByRole("button", { name: "Add 50 credits" }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Done. The school now has 150 credits."));
    expect(bodies[0]).toMatchObject({ school_id: "sch1", credits: 50, reason: "Goodwill credit" });
  });

  it("sends a removal as negative credits", async () => {
    const bodies = serve(ok);
    const { user } = renderWithClient(<AdjustCreditsDialog schoolId="sch1" />);
    await fill(user, "20", "Correction");
    await user.click(screen.getByRole("radio", { name: /Remove credits/ }));
    await user.click(screen.getByRole("button", { name: "Remove 20 credits" }));
    await waitFor(() => expect(bodies[0]).toMatchObject({ credits: -20 }));
  });

  it("needs a reason, and retries with the same key after a failure", async () => {
    const bodies = serve(() => HttpResponse.json({ detail: "boom" }, { status: 500 }), ok);
    const { user } = renderWithClient(<AdjustCreditsDialog schoolId="sch1" />);
    await fill(user, "5", " ");
    expect(screen.getByRole("button", { name: /credits$/ })).toBeDisabled();

    await user.type(screen.getByLabelText("Reason"), "x");
    const save = screen.getByRole("button", { name: "Add 5 credits" });
    await user.click(save);
    await waitFor(() => expect(toastError).toHaveBeenCalled());
    await user.click(save);
    await waitFor(() => expect(bodies).toHaveLength(2));
    expect(bodies[1].idempotency_key).toBe(bodies[0].idempotency_key);
  });
});
