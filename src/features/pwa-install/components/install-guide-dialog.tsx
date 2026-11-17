"use client";

import { useState, type ReactNode } from "react";
import { Check, Compass, Copy, Ellipsis, EllipsisVertical, MonitorDown, Share, SquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useInstallState } from "../hooks/use-install-state";
import { IN_APP_NAMES, type InstallEnvironment, type InstallMethod } from "../lib/install-environment";
import { useInstallGuide } from "../lib/install-guide-store";
import { promptInstall } from "../lib/install-prompt-store";

// Mounted once in DashboardShell; opened by the banner and the account menu.
// Steps name the exact words and icons the phone shows ("Add to Home Screen",
// the Share square), because the person reading is usually holding the phone
// with this dialog over the very screen they need to act on.
export function InstallGuideDialog() {
  const { open, setOpen } = useInstallGuide();
  const { env, method } = useInstallState();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* No auto-focus: Radix would land on the link box in the in-app case,
          selecting it and, on a phone, risking the keyboard over the steps. */}
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Install SchoolOS</DialogTitle>
          <DialogDescription>
            Put SchoolOS on your home screen. It opens like an app, and you can take the register even
            with no network.
          </DialogDescription>
        </DialogHeader>
        <GuideBody env={env} method={method} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function GuideBody({ env, method, onDone }: { env: InstallEnvironment; method: InstallMethod; onDone: () => void }) {
  switch (method) {
    case "installed":
      return <p className="text-sm text-ink">SchoolOS is already installed on this device. Open it from your home screen.</p>;

    case "prompt":
      return (
        <Button
          className="w-full"
          onClick={async () => {
            await promptInstall();
            onDone();
          }}
        >
          Install now
        </Button>
      );

    case "ios-safari":
      return (
        <>
          <Steps>
            <Step n={1}>
              Tap the <Key icon={<Share />}>Share</Key> button. It’s at the bottom of the screen on an iPhone,
              and at the top on an iPad.
            </Step>
            <Step n={2}>
              Scroll down and tap <Key icon={<SquarePlus />}>Add to Home Screen</Key>.
            </Step>
            <Step n={3}>
              Tap <Key>Add</Key>. SchoolOS appears on your home screen.
            </Step>
          </Steps>
          <Note>
            No “Add to Home Screen”? The page may be open inside another app. Tap the{" "}
            <Key icon={<Compass />}>Safari</Key> icon to open it in Safari, then try again.
          </Note>
        </>
      );

    case "ios-other":
      return (
        <>
          <Steps>
            <Step n={1}>
              Tap the <Key icon={<Share />}>Share</Key> button in the address bar.
            </Step>
            <Step n={2}>
              Tap <Key icon={<SquarePlus />}>Add to Home Screen</Key>. You may need to tap <Key>More</Key> to see it.
            </Step>
            <Step n={3}>
              Tap <Key>Add</Key>.
            </Step>
          </Steps>
          <Note>Not there? Older iPhones can only install from Safari. Open this page in Safari and try again.</Note>
        </>
      );

    case "in-app":
      return <InAppSteps env={env} />;

    case "android-manual":
      return (
        <>
          <Steps>
            <Step n={1}>
              Tap the <Key icon={<EllipsisVertical />}>menu</Key> at the top right of Chrome.
            </Step>
            <Step n={2}>
              Tap <Key>Install app</Key> or <Key>Add to Home screen</Key>.
            </Step>
            <Step n={3}>
              Tap <Key>Install</Key>.
            </Step>
          </Steps>
          <Note>
            Opened this from WhatsApp? Tap the <Key icon={<EllipsisVertical />}>menu</Key> and choose{" "}
            <Key>Open in Chrome</Key> first.
          </Note>
        </>
      );

    case "desktop-manual":
      return (
        <Steps>
          <Step n={1}>
            In Chrome or Edge, click the <Key icon={<MonitorDown />}>install</Key> icon at the right end of the
            address bar.
          </Step>
          <Step n={2}>
            No icon? Open the browser menu and choose <Key>Install SchoolOS</Key> (Chrome may list it under{" "}
            <Key>Cast, save, and share</Key>). In Safari on a Mac, choose <Key>File</Key>, then{" "}
            <Key>Add to Dock</Key>.
          </Step>
        </Steps>
      );
  }
}

// The case teachers hit most: a link tapped in WhatsApp opens WhatsApp's own
// browser, which can't install anything. Getting the page into the real
// browser is the whole task, so the link is right here to copy.
function InAppSteps({ env }: { env: InstallEnvironment }) {
  const browser = env.platform === "ios" ? "Safari" : "Chrome";
  const appName = IN_APP_NAMES[env.inAppBrowser ?? "other"];
  // The login page, not this one: the real browser has none of this one's
  // storage, so the teacher signs in again there.
  const link = typeof window === "undefined" ? "" : `${window.location.origin}/login`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Some built-in browsers block the clipboard; the link is visible below
      // to copy by hand.
    }
  }

  return (
    <>
      <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
        This page is open inside {appName}, which can’t install apps. Open it in {browser} instead.
      </p>
      <Steps>
        {env.platform === "ios" ? (
          // iOS built-in browsers have no single menu: WhatsApp shows a Safari
          // compass, Instagram and Facebook a ••• button. Naming all three
          // beats sending someone to look for an icon that isn't there.
          <Step n={1}>
            Look for <Key>Open in Safari</Key> under the <Key icon={<Ellipsis />}>more</Key> or{" "}
            <Key icon={<Share />}>Share</Key> button, or tap the <Key icon={<Compass />}>Safari</Key> icon. If
            there’s none, copy the link below and paste it into Safari.
          </Step>
        ) : (
          <Step n={1}>
            Tap the <Key icon={<EllipsisVertical />}>menu</Key> and choose <Key>Open in Chrome</Key> (or{" "}
            <Key>Open in browser</Key>). If there’s none, copy the link below and paste it into Chrome.
          </Step>
        )}
        <Step n={2}>Sign in there, then tap Install on the banner at the top of the page.</Step>
      </Steps>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={link}
          aria-label="Link to SchoolOS"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-n-200 bg-n-50 px-3 py-2 font-mono text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <Button type="button" variant="outline" size="sm" onClick={copy} className="shrink-0 gap-1.5">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="space-y-3">{children}</ol>;
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-ink">
      <span
        aria-hidden
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
      >
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

// An on-screen label to look for: bold, with the icon the phone shows.
// Plain inline, not inline-flex: an inline-flex box is atomic, which let a
// following full stop wrap onto a line of its own.
//
// Copy in this file uses ’ and “ ” rather than &apos;/&quot;. With an entity
// in the text right after a <Key>, the space before it went missing in the
// rendered DOM ("Sharebutton", "Safariicon"); the literal characters don't.
function Key({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <strong className="font-semibold whitespace-nowrap">
      {icon && <span className="mr-1 inline-block align-[-0.2em] [&>svg]:size-4">{icon}</span>}
      {children}
    </strong>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-n-500">{children}</p>;
}
