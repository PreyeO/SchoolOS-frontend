"use client";

import { useState, useSyncExternalStore } from "react";

import {
  readInstallEnvironment,
  resolveInstallMethod,
  type InstallEnvironment,
  type InstallMethod,
} from "../lib/install-environment";
import { getServerSnapshot, getSnapshot, subscribe } from "../lib/install-prompt-store";

const DISMISSED_KEY = "schoolos-install-banner-dismissed-at";
// Long enough not to nag a teacher who said no; short enough that the offer
// comes back once they've seen the app work for a couple of weeks.
export const DISMISS_FOR_MS = 14 * 24 * 60 * 60 * 1000;

// Evaluated once, as the state's initial value: a dismissal can only lapse
// across a page load, so re-checking the clock on every render buys nothing.
function readBannerDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY));
    return at > 0 && Date.now() - at < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

export interface InstallState {
  env: InstallEnvironment;
  method: InstallMethod;
  // The banner's own visibility; the account-menu entry ignores it.
  bannerDismissed: boolean;
  dismissBanner: () => void;
}

// Only used under the dashboard's AuthGuard, which renders nothing until after
// hydration, so reading navigator/localStorage during render can't mismatch
// server HTML (same reasoning as useChecklistDismissed).
export function useInstallState(): InstallState {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [env] = useState(readInstallEnvironment);
  const [bannerDismissed, setBannerDismissed] = useState(readBannerDismissed);

  const method = resolveInstallMethod(env, store);

  function dismissBanner() {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // Blocked storage: hidden for this page view only.
    }
    setBannerDismissed(true);
  }

  return { env, method, bannerDismissed, dismissBanner };
}
