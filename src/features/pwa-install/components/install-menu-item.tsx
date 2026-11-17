"use client";

import { Download } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useInstallState } from "../hooks/use-install-state";
import { useInstallGuide } from "../lib/install-guide-store";
import { promptInstall } from "../lib/install-prompt-store";

// The permanent way back to installing, for someone who dismissed the banner
// or is on desktop. Hidden once installed.
export function InstallMenuItem() {
  const { method } = useInstallState();
  const openGuide = useInstallGuide((s) => s.setOpen);

  if (method === "installed") return null;

  async function handleSelect() {
    // promptInstall() calls the browser's prompt() synchronously, inside this
    // tap: Chrome refuses it without a fresh user gesture.
    if (method === "prompt" && (await promptInstall()) !== "unavailable") return;
    // Next tick, once the menu has finished closing: Radix's menu restores
    // focus and body pointer-events on close, and a dialog opening mid-close
    // can be left with the page unclickable behind it.
    setTimeout(() => openGuide(true), 0);
  }

  return (
    <DropdownMenuItem onSelect={handleSelect}>
      <Download /> Install app
    </DropdownMenuItem>
  );
}
