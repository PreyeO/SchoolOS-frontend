import { describe, expect, it } from "vitest";

import {
  detectInstallEnvironment,
  isAppDisplayMode,
  resolveInstallMethod,
  type EnvironmentInput,
} from "./install-environment";

// Real user-agent strings, one per case that changes what we tell a teacher.
const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1",
  iphoneEdge:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/126.2592.56 Mobile/15E148 Safari/605.1.15",
  iphoneWhatsApp:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/24.12.78",
  iphoneInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 334.0.4.32.98 (iPhone14,5; iOS 17_5; en_US)",
  ipadAsMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.71 Mobile Safari/537.36",
  androidFacebook:
    "Mozilla/5.0 (Linux; Android 13; TECNO KI5k Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.71 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.43.108;]",
  androidWebView:
    "Mozilla/5.0 (Linux; Android 12; itel A665L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36",
  windowsChrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

function env(userAgent: string, over: Partial<EnvironmentInput> = {}) {
  return detectInstallEnvironment({
    userAgent,
    maxTouchPoints: 5,
    displayModeStandalone: false,
    navigatorStandalone: false,
    ...over,
  });
}

const none = { canPrompt: false, installedOnThisDevice: false };

describe("detectInstallEnvironment", () => {
  it("reads Safari, Chrome and Edge on iPhone apart", () => {
    expect(env(UA.iphoneSafari)).toMatchObject({ platform: "ios", iosBrowser: "safari", inAppBrowser: null });
    expect(env(UA.iphoneChrome)).toMatchObject({ platform: "ios", iosBrowser: "chrome" });
    expect(env(UA.iphoneEdge)).toMatchObject({ platform: "ios", iosBrowser: "edge" });
  });

  it("treats an iPad presenting a Mac UA as iOS, but a real Mac as desktop", () => {
    expect(env(UA.ipadAsMac, { maxTouchPoints: 5 }).platform).toBe("ios");
    expect(env(UA.ipadAsMac, { maxTouchPoints: 0 }).platform).toBe("desktop");
  });

  it("recognises WhatsApp, Instagram and Facebook's built-in browsers", () => {
    expect(env(UA.iphoneWhatsApp).inAppBrowser).toBe("whatsapp");
    expect(env(UA.iphoneInstagram).inAppBrowser).toBe("instagram");
    expect(env(UA.androidFacebook)).toMatchObject({ platform: "android", inAppBrowser: "facebook" });
  });

  it("flags an unnamed Android WebView as a built-in browser", () => {
    expect(env(UA.androidWebView).inAppBrowser).toBe("other");
  });

  it("does not mistake plain Chrome on Android for a built-in browser", () => {
    expect(env(UA.androidChrome)).toMatchObject({ platform: "android", inAppBrowser: null });
  });

  it("is standalone from either display-mode or iOS's navigator.standalone", () => {
    expect(env(UA.androidChrome, { displayModeStandalone: true }).standalone).toBe(true);
    expect(env(UA.iphoneSafari, { navigatorStandalone: true }).standalone).toBe(true);
    expect(env(UA.iphoneSafari).standalone).toBe(false);
  });
});

describe("isAppDisplayMode", () => {
  const only = (mode: string) => (q: string) => q === `(display-mode: ${mode})`;

  it("counts the installed app's window", () => {
    expect(isAppDisplayMode(only("standalone"))).toBe(true);
    expect(isAppDisplayMode(only("minimal-ui"))).toBe(true);
  });

  // Regression: Chrome reports fullscreen for an ordinary tab once the browser
  // goes full-screen, which hid "Install app" on a desktop that had never
  // installed it.
  it("does not mistake a full-screen browser tab for the app", () => {
    expect(isAppDisplayMode(only("fullscreen"))).toBe(false);
    expect(isAppDisplayMode(only("browser"))).toBe(false);
  });
});

describe("resolveInstallMethod", () => {
  it("offers nothing once installed, whichever way we know", () => {
    expect(resolveInstallMethod(env(UA.androidChrome, { displayModeStandalone: true }), { ...none, canPrompt: true })).toBe(
      "installed",
    );
    expect(resolveInstallMethod(env(UA.androidChrome), { ...none, installedOnThisDevice: true })).toBe("installed");
  });

  it("uses the browser's own prompt when one was captured", () => {
    expect(resolveInstallMethod(env(UA.androidChrome), { ...none, canPrompt: true })).toBe("prompt");
    expect(resolveInstallMethod(env(UA.windowsChrome, { maxTouchPoints: 0 }), { ...none, canPrompt: true })).toBe("prompt");
  });

  it("sends a built-in browser to Chrome/Safari even if a prompt somehow exists", () => {
    expect(resolveInstallMethod(env(UA.androidFacebook), { ...none, canPrompt: true })).toBe("in-app");
    expect(resolveInstallMethod(env(UA.iphoneWhatsApp), none)).toBe("in-app");
  });

  it("gives iPhones the Share-sheet route, split by browser", () => {
    expect(resolveInstallMethod(env(UA.iphoneSafari), none)).toBe("ios-safari");
    expect(resolveInstallMethod(env(UA.iphoneChrome), none)).toBe("ios-other");
  });

  it("falls back to manual steps on Android and desktop without a prompt", () => {
    expect(resolveInstallMethod(env(UA.androidChrome), none)).toBe("android-manual");
    expect(resolveInstallMethod(env(UA.windowsChrome, { maxTouchPoints: 0 }), none)).toBe("desktop-manual");
  });
});
