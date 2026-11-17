// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetInstallStoreForTests,
  attachInstallListeners,
  getSnapshot,
  promptInstall,
} from "./install-prompt-store";

function fireBeforeInstallPrompt(outcome: "accepted" | "dismissed") {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string; platform: string }>;
  };
  event.prompt = vi.fn(() => Promise.resolve());
  event.userChoice = Promise.resolve({ outcome, platform: "web" });
  window.dispatchEvent(event);
  return event;
}

describe("install prompt store", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetInstallStoreForTests();
    attachInstallListeners();
  });

  it("captures the prompt and suppresses the browser's own infobar", () => {
    const event = fireBeforeInstallPrompt("accepted");
    expect(event.defaultPrevented).toBe(true);
    expect(getSnapshot().canPrompt).toBe(true);
  });

  it("marks installed when the prompt is accepted, and remembers it", async () => {
    const event = fireBeforeInstallPrompt("accepted");
    await expect(promptInstall()).resolves.toBe("accepted");
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(getSnapshot()).toEqual({ canPrompt: false, installedOnThisDevice: true });
    expect(localStorage.getItem("schoolos-pwa-installed")).toBe("1");
  });

  it("spends the prompt on a decline without marking installed", async () => {
    fireBeforeInstallPrompt("dismissed");
    await expect(promptInstall()).resolves.toBe("dismissed");
    expect(getSnapshot()).toEqual({ canPrompt: false, installedOnThisDevice: false });
    await expect(promptInstall()).resolves.toBe("unavailable");
  });

  it("marks installed on appinstalled, however the install happened", () => {
    window.dispatchEvent(new Event("appinstalled"));
    expect(getSnapshot().installedOnThisDevice).toBe(true);
  });

  it("reads the remembered install on a fresh page load", () => {
    localStorage.setItem("schoolos-pwa-installed", "1");
    __resetInstallStoreForTests();
    expect(getSnapshot().installedOnThisDevice).toBe(true);
  });
});
