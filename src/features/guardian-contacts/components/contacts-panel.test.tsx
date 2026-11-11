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

const accountPhone = { student_id: "s9", admission_number: "ADM/009", student_name: "Tobi Ade", name: "Kemi Ade", phone: "+2348039998888" };

function serve(accountPhones = [accountPhone]) {
  const searches: (string | null)[] = [];
  const accountSearches: (string | null)[] = [];
  const patches: unknown[] = [];
  const deletes: string[] = [];
  server.use(
    http.get(apiUrl(GUARDIAN_CONTACT_ENDPOINTS.ACCOUNT_PHONES()), ({ request }) => {
      accountSearches.push(new URL(request.url).searchParams.get("search"));
      return HttpResponse.json({ count: accountPhones.length, next: null, previous: null, results: accountPhones });
    }),
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
  return { searches, accountSearches, patches, deletes };
}

describe("ContactsPanel: parent-account numbers", () => {
  it("lists them read-only, apart from the saved numbers, with the same search", async () => {
    const calls = serve();
    const { user } = renderWithClient(<ContactsPanel />);

    const section = await screen.findByRole("region", { name: /Texted at a parent account.s phone \(1\)/ });
    expect(within(section).getByText("Kemi Ade")).toBeInTheDocument();
    expect(within(section).getByText("0803 999 8888")).toBeInTheDocument();
    expect(within(section).queryByRole("button", { name: /Edit|Remove|Make main/ })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Search parent numbers"), "Tobi");
    await vi.waitFor(() => expect(calls.accountSearches.at(-1)).toBe("Tobi"));
  });

  it("'Use a different number' adds a contact for that student, skipping the picker", async () => {
    serve();
    const { user } = renderWithClient(<ContactsPanel />);
    await user.click(await screen.findByRole("button", { name: "Use a different number" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("For Tobi Ade (ADM/009).");
    expect(within(dialog).getByLabelText("Mobile number")).toBeInTheDocument();
  });

  it("shows no section at all when every student has a saved number", async () => {
    serve([]);
    renderWithClient(<ContactsPanel />);
    await screen.findByText("Ngozi Obi");
    expect(screen.queryByText(/Texted at a parent account/)).not.toBeInTheDocument();
  });
});

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
