// Holds the browser's deferred install prompt and whether the app was installed
// from this device, for useSyncExternalStore.
//
// The listeners attach when this module is first imported, not in a React
// effect. Chrome fires `beforeinstallprompt` once per page load, often before
// the dashboard has rendered (AuthGuard withholds it until hydration), and an
// event missed is gone until the next full reload. InstallPromptCapture imports
// this from the root layout so it is listening from the very first page.

// Not in lib.dom: Chromium-only (Chrome, Edge, Samsung Internet, Opera).
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const INSTALLED_KEY = "schoolos-pwa-installed";

interface Snapshot {
  canPrompt: boolean;
  installedOnThisDevice: boolean;
}

let deferred: BeforeInstallPromptEvent | null = null;
let snapshot: Snapshot = { canPrompt: false, installedOnThisDevice: readInstalledFlag() };
const listeners = new Set<() => void>();

function readInstalledFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

function update(next: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

// Remembered so an Android browser tab doesn't keep offering an install the
// person already did: Chrome stops firing the prompt once installed, which
// alone would otherwise fall through to the manual instructions. Android
// shares storage between the browser and the installed app for one origin.
export function markInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, "1");
  } catch {
    // Private mode or blocked storage: the flag just doesn't persist.
  }
  deferred = null;
  update({ canPrompt: false, installedOnThisDevice: true });
}

let attached = false;
export function attachInstallListeners() {
  if (attached || typeof window === "undefined") return;
  attached = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    // Stops Chrome's own mini-infobar, so the one offer the user sees is ours,
    // shown inside their school's dashboard where installing makes sense.
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    update({ canPrompt: true });
  });

  window.addEventListener("appinstalled", markInstalled);
}

// Opens the browser's install dialog. A deferred prompt is single-use, so it
// is cleared whatever the answer; Chrome fires a fresh one later if declined.
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const event = deferred;
  if (!event) return "unavailable";
  deferred = null;
  update({ canPrompt: false });
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") markInstalled();
  return outcome;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Snapshot {
  return snapshot;
}

const SERVER_SNAPSHOT: Snapshot = { canPrompt: false, installedOnThisDevice: false };
export function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

// Test-only: module state otherwise leaks between test cases.
export function __resetInstallStoreForTests() {
  deferred = null;
  attached = false;
  snapshot = { canPrompt: false, installedOnThisDevice: readInstalledFlag() };
  listeners.clear();
}
