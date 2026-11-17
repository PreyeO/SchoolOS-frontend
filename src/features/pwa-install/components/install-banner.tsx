"use client";

import Image from "next/image";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useInstallState } from "../hooks/use-install-state";
import { useInstallGuide } from "../lib/install-guide-store";
import { promptInstall } from "../lib/install-prompt-store";

// The install offer, at the top of every dashboard page on phones and tablets
// until it's installed or dismissed (then back after DISMISS_FOR_MS).
//
// Inline in the page rather than a floating toast: it can't cover the bottom
// tab bar or the register's save button, and it scrolls away with the page.
// Not shown on desktop, where installing matters less; the account menu's
// "Install app" still covers it there.
export function InstallBanner() {
  const { env, method, bannerDismissed, dismissBanner } = useInstallState();
  const openGuide = useInstallGuide((s) => s.setOpen);

  if (method === "installed" || bannerDismissed || env.platform === "desktop") return null;

  const inApp = method === "in-app";
  const browser = env.platform === "ios" ? "Safari" : "Chrome";

  async function handleInstall() {
    if (method !== "prompt") {
      openGuide(true);
      return;
    }
    // The prompt can lapse between render and tap (single use); fall back to
    // the written steps rather than doing nothing.
    if ((await promptInstall()) === "unavailable") openGuide(true);
  }

  // The button sits under the text rather than beside it: beside it, "Show me
  // how" squeezed the title onto two lines at 390px, and narrower phones
  // (360px is common on Android) fare worse.
  return (
    <section
      aria-label="Install SchoolOS"
      className="mb-5 flex items-start gap-3 rounded-xl border border-n-200 bg-white p-3.5 shadow-sm print:hidden"
    >
      <Image src="/icon-192.png" alt="" width={44} height={44} className="size-11 shrink-0 rounded-[11px]" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">Install SchoolOS</p>
        <p className="mt-0.5 text-xs leading-snug text-n-500">
          {inApp
            ? `Open this page in ${browser} to install it.`
            : "Open it from your home screen, and take the register even with no network."}
        </p>
        <Button size="sm" onClick={handleInstall} className="mt-2.5">
          {method === "prompt" ? "Install" : "Show me how"}
        </Button>
      </div>
      <button
        type="button"
        onClick={dismissBanner}
        aria-label="Not now"
        className="-mt-0.5 -mr-1 shrink-0 rounded-md p-1 text-n-400 hover:bg-n-100 hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </section>
  );
}
