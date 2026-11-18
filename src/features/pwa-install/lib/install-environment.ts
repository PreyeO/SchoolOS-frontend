// Works out which install path this browser offers, from the user agent and a
// few browser flags. Pure, so every case is unit-tested with real UA strings
// (install-environment.test.ts) instead of needing the device in hand.
//
// Why this matters more than the install button itself: teachers mostly open
// SchoolOS from a link in WhatsApp. WhatsApp, Facebook and Instagram open links
// in their own built-in browser, and NO built-in browser can install a web app
// on any phone. Telling them to open the page in Chrome or Safari first is the
// step they were being walked through by hand.

export type InstallPlatform = "ios" | "android" | "desktop";

// Named apps whose built-in browsers we can recognise from the UA. Android's
// WhatsApp opens Chrome Custom Tabs, whose UA is indistinguishable from Chrome,
// so that case lands in "android-manual" rather than here.
export type InAppBrowser = "whatsapp" | "facebook" | "instagram" | "tiktok" | "snapchat" | "other";

export type IosBrowser = "safari" | "chrome" | "edge" | "firefox" | "other";

export interface InstallEnvironment {
  platform: InstallPlatform;
  inAppBrowser: InAppBrowser | null;
  // Only meaningful when platform is "ios".
  iosBrowser: IosBrowser;
  // Running as the installed app right now.
  standalone: boolean;
}

export interface EnvironmentInput {
  userAgent: string;
  // navigator.maxTouchPoints: iPadOS 13+ reports a desktop Mac UA, and this is
  // the only reliable way to tell an iPad from a Mac.
  maxTouchPoints: number;
  // isAppDisplayMode(): display-mode standalone or minimal-ui.
  displayModeStandalone: boolean;
  // iOS Safari's non-standard navigator.standalone, true in a home-screen app.
  navigatorStandalone: boolean;
}

const IN_APP_PATTERNS: Array<[InAppBrowser, RegExp]> = [
  ["whatsapp", /WhatsApp/i],
  ["instagram", /Instagram/i],
  ["facebook", /FBAN|FBAV|FB_IAB|FBIOS|FB4A|\bMessenger/i],
  ["tiktok", /musical_ly|BytedanceWebview|TikTok/i],
  ["snapchat", /Snapchat/i],
  // Generic markers: Android System WebView ("; wv)") and LinkedIn/Line/X.
  ["other", /;\s?wv\)|LinkedInApp|\bLine\/|Twitter/i],
];

export function detectInstallEnvironment(input: EnvironmentInput): InstallEnvironment {
  const ua = input.userAgent;

  const isIpadOnMacUa = /Macintosh/.test(ua) && input.maxTouchPoints > 1;
  const platform: InstallPlatform =
    /iPhone|iPad|iPod/.test(ua) || isIpadOnMacUa ? "ios" : /Android/i.test(ua) ? "android" : "desktop";

  let inAppBrowser: InAppBrowser | null = null;
  for (const [name, pattern] of IN_APP_PATTERNS) {
    if (pattern.test(ua)) {
      inAppBrowser = name;
      break;
    }
  }

  // Every iOS browser is WebKit; the others announce themselves with a token.
  // Order matters: Edge and Chrome on iOS both also contain "Safari".
  let iosBrowser: IosBrowser = "other";
  if (platform === "ios") {
    if (/EdgiOS/.test(ua)) iosBrowser = "edge";
    else if (/CriOS/.test(ua)) iosBrowser = "chrome";
    else if (/FxiOS/.test(ua)) iosBrowser = "firefox";
    else if (/Safari\//.test(ua) && !inAppBrowser) iosBrowser = "safari";
  }

  return {
    platform,
    inAppBrowser,
    iosBrowser,
    standalone: input.displayModeStandalone || input.navigatorStandalone,
  };
}

export function readInstallEnvironment(): InstallEnvironment {
  const media = (q: string) => window.matchMedia?.(q).matches ?? false;
  return detectInstallEnvironment({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    displayModeStandalone: isAppDisplayMode(media),
    navigatorStandalone: (navigator as Navigator & { standalone?: boolean }).standalone === true,
  });
}

// Whether the page is running in the installed app's window.
//
// standalone is what our manifest asks for; minimal-ui is what a browser that
// can't do standalone falls back to. NOT fullscreen: Chrome reports
// display-mode: fullscreen for an ordinary tab whenever the browser is
// full-screen (F11, or the green button on a Mac). Checking it hid "Install
// app" from a co-founder's Chrome on desktop, in a fresh incognito window,
// while Safari showed it. Verified in Chrome: a plain tab goes from browser to
// fullscreen on requestFullscreen().
export function isAppDisplayMode(matches: (query: string) => boolean): boolean {
  return matches("(display-mode: standalone)") || matches("(display-mode: minimal-ui)");
}

// What the UI should offer.
//   installed       nothing; already the app (or installed from this device)
//   prompt          the browser's own install dialog is available
//   ios-safari      Share, then Add to Home Screen
//   ios-other       Chrome/Edge/Firefox on iOS: same Share route (iOS 16.4+)
//   in-app          open the page in Chrome/Safari first
//   android-manual  Android without a captured prompt: the browser's ⋮ menu
//   desktop-manual  desktop without a captured prompt: the address-bar icon
export type InstallMethod =
  | "installed"
  | "prompt"
  | "ios-safari"
  | "ios-other"
  | "in-app"
  | "android-manual"
  | "desktop-manual";

export function resolveInstallMethod(
  env: InstallEnvironment,
  opts: { canPrompt: boolean; installedOnThisDevice: boolean },
): InstallMethod {
  if (env.standalone || opts.installedOnThisDevice) return "installed";
  // Checked before canPrompt: a built-in browser never fires the prompt, and
  // even if one did, installing from it doesn't put the app anywhere useful.
  if (env.inAppBrowser) return "in-app";
  if (opts.canPrompt) return "prompt";
  if (env.platform === "ios") return env.iosBrowser === "safari" ? "ios-safari" : "ios-other";
  if (env.platform === "android") return "android-manual";
  return "desktop-manual";
}

export const IN_APP_NAMES: Record<InAppBrowser, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  other: "another app",
};
