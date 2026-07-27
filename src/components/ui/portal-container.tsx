"use client";

import { createContext, useContext } from "react";

// Radix portals (Dialog/AlertDialog/DropdownMenu/Sheet) render into
// document.body by default, which is OUTSIDE the dashboard shell's
// [data-dashboard-shell] div — so its inline --shell-primary/--shell-accent
// custom properties (and the --primary/--accent overrides derived from them)
// never reach portaled content. DashboardShell provides its own root element
// here so those primitives can portal INSIDE it instead and inherit the
// school's colors. Pages outside the dashboard shell get no provider, so
// `container` stays undefined and Radix falls back to document.body as usual.
const PortalContainerContext = createContext<HTMLElement | null>(null);

export const PortalContainerProvider = PortalContainerContext.Provider;

export function usePortalContainer(): HTMLElement | undefined {
  return useContext(PortalContainerContext) ?? undefined;
}
