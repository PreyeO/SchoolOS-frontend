// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetInstallStoreForTests, attachInstallListeners } from "../lib/install-prompt-store";
import { useInstallGuide } from "../lib/install-guide-store";
import { InstallBanner } from "./install-banner";
import { InstallGuideDialog } from "./install-guide-dialog";

const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.71 Mobile Safari/537.36";
const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPHONE_WHATSAPP =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/24.12.78";
const WINDOWS_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function asDevice(userAgent: string) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
}

function renderShell() {
  const user = userEvent.setup();
  render(
    <>
      <InstallBanner />
      <InstallGuideDialog />
    </>,
  );
  return user;
}

function captureBrowserPrompt(outcome: "accepted" | "dismissed" = "accepted") {
  const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome, platform: "web" }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe("InstallBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetInstallStoreForTests();
    attachInstallListeners();
    useInstallGuide.setState({ open: false });
  });
  afterEach(() => vi.restoreAllMocks());

  it("installs straight from the browser's prompt on Android Chrome, then hides", async () => {
    asDevice(ANDROID_CHROME);
    const user = renderShell();
    const event = captureBrowserPrompt("accepted");

    await user.click(screen.getByRole("button", { name: "Install" }));

    expect(event.prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole("region", { name: "Install SchoolOS" })).not.toBeInTheDocument();
  });

  it("walks an Android user through the menu when no prompt was captured", async () => {
    asDevice(ANDROID_CHROME);
    const user = renderShell();

    await user.click(screen.getByRole("button", { name: "Show me how" }));

    expect(await screen.findByRole("dialog", { name: "Install SchoolOS" })).toBeInTheDocument();
    expect(screen.getByText("Install app")).toBeInTheDocument();
  });

  it("shows iPhone users the Share → Add to Home Screen steps", async () => {
    asDevice(IPHONE_SAFARI);
    const user = renderShell();

    await user.click(screen.getByRole("button", { name: "Show me how" }));

    expect(await screen.findByText("Add to Home Screen")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("tells a WhatsApp user to open Safari, with the sign-in link to copy", async () => {
    asDevice(IPHONE_WHATSAPP);
    const user = renderShell();

    expect(screen.getByText("Open this page in Safari to install it.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show me how" }));

    expect(await screen.findByText(/open inside WhatsApp, which can.t install apps/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Link to SchoolOS" })).toHaveValue(`${window.location.origin}/login`);
  });

  it("stays dismissed after Not now, across a remount", async () => {
    asDevice(ANDROID_CHROME);
    const user = renderShell();

    await user.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByRole("region", { name: "Install SchoolOS" })).not.toBeInTheDocument();

    render(<InstallBanner />);
    expect(screen.queryByRole("region", { name: "Install SchoolOS" })).not.toBeInTheDocument();
  });

  it("comes back once the dismissal is two weeks old", () => {
    asDevice(ANDROID_CHROME);
    localStorage.setItem("schoolos-install-banner-dismissed-at", String(Date.now() - 15 * 24 * 60 * 60 * 1000));
    renderShell();
    expect(screen.getByRole("region", { name: "Install SchoolOS" })).toBeInTheDocument();
  });

  it("shows nothing on a device that already installed, or on desktop", () => {
    asDevice(ANDROID_CHROME);
    localStorage.setItem("schoolos-pwa-installed", "1");
    __resetInstallStoreForTests();
    const { unmount } = render(<InstallBanner />);
    expect(screen.queryByRole("region", { name: "Install SchoolOS" })).not.toBeInTheDocument();
    unmount();

    localStorage.clear();
    __resetInstallStoreForTests();
    asDevice(WINDOWS_CHROME);
    render(<InstallBanner />);
    expect(screen.queryByRole("region", { name: "Install SchoolOS" })).not.toBeInTheDocument();
  });
});
