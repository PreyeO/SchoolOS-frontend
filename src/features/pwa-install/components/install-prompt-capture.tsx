"use client";

import { attachInstallListeners } from "../lib/install-prompt-store";

// Mounted in the root layout. Attaching at module evaluation (not in an effect)
// is the point: it runs as soon as this client chunk loads, ahead of hydration,
// so a beforeinstallprompt fired on /login or during AuthGuard isn't lost.
//
// On the marketing apex this also suppresses Chrome's own install infobar,
// which is wanted: an app installed from the apex has no school in it. Each
// school installs from its own subdomain, from inside its dashboard.
attachInstallListeners();

export function InstallPromptCapture() {
  return null;
}
