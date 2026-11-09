// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { GUARDIAN_CONTACT_ENDPOINTS } from "@/lib/api/endpoints";
import { apiUrl, server } from "@/test/msw/server";
import { renderWithClient } from "@/test/render";

import type { GuardianContact } from "../types";
import { ContactsPanel } from "./contacts-panel";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const row = (id: string, name: string, primary: boolean) =>
  ({ id, student: "s1", student_name: "Ada Obi", admission_number: "ADM/001", name, phone: "+2348031234567", is_primary: primary }) as GuardianContact;

function serve() {
  const searches: (string | null)[] = [];
  const patches: unknown[] = [];
  const deletes: string[] = [];
  server.use(
    http.get(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.LIST()), ({ request }) => {
      searches.push(new URL(request.url).searchParams.get("search"));
      const results = [row("g1", "Ngozi Obi", true), row("g2", "Emeka Obi", false)];
      return HttpResponse.json({ count: 2, next: null, previous: null, results });
    }),
    http.patch(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.DETAIL("g2")), async ({ request }) => {
      patches.push(await request.json());
      return HttpResponse.json(row("g2", "Emeka Obi", true));
    }),
    http.delete(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.DETAIL("g1")), () => {
      deletes.push("g1");
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return { searches, patches, deletes };
}

describe("ContactsPanel", () => {
  it("searches on the server, without sending an empty search", async () => {
    const calls = serve();
    const { user } = renderWithClient(<ContactsPanel />);
    await screen.findByText("Ngozi Obi");
    expect(calls.searches[0]).toBeNull();

    await user.type(screen.getByLabelText("Search parent numbers"), "ADM/001");
    await vi.waitFor(() => expect(calls.searches.at(-1)).toBe("ADM/001"));
  });

  it("offers Make main only on a non-main number, and sends just the flag", async () => {
    const calls = serve();
    const { user } = renderWithClient(<ContactsPanel />);
    const buttons = await screen.findAllByRole("button", { name: /Make main/ });
    expect(buttons).toHaveLength(1);
    await user.click(buttons[0]);
    await vi.waitFor(() => expect(calls.patches).toEqual([{ is_primary: true }]));
  });

  it("warns that removing the main number leaves only a linked parent's phone", async () => {
    const calls = serve();
    const { user } = renderWithClient(<ContactsPanel />);
    await user.click(await screen.findByRole("button", { name: "Remove Ngozi Obi" }));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("This is Ada Obi's main number");
    await user.click(within(dialog).getByRole("button", { name: "Remove" }));
    await vi.waitFor(() => expect(calls.deletes).toEqual(["g1"]));
  });
});
