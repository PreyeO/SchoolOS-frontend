"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ResolvedTab } from "../hooks/use-mobile-tabs";
import { useTypingOnPhone } from "../hooks/use-typing-on-phone";
import { isNavActive } from "../lib/is-nav-active";

// The phone bottom bar for parents and teachers. Below lg only — the same
// breakpoint where the sidebar becomes a drawer — so desktop is unchanged.
//
// Colour is the school's, never a per-tab rainbow: the active tab takes
// --primary, which the shell sets from the school's own primary_color.
//
// Fixed, with its own bottom inset so it clears the iOS home indicator in an
// installed app. The shell reserves matching space under the page (see
// DashboardShell) so the last row of content is never hidden behind it.
export function MobileTabBar({ tabs, onOpenMore }: { tabs: ResolvedTab[]; onOpenMore: () => void }) {
  const pathname = usePathname();
  const typing = useTypingOnPhone();

  // Tells the Toaster (mounted outside the shell, in the root layout) how
  // much room the bar takes, so toasts clear it. 57px = min-h-14 + border.
  // Only below lg, where the bar is actually visible.
  useEffect(() => {
    const root = document.documentElement;
    const query = window.matchMedia("(min-width: 1024px)");
    const apply = () => root.style.setProperty("--mobile-tab-bar-h", query.matches || typing ? "0px" : "57px");
    apply();
    query.addEventListener("change", apply);
    return () => {
      query.removeEventListener("change", apply);
      root.style.removeProperty("--mobile-tab-bar-h");
    };
  }, [typing]);

  // "More" is active when the current screen isn't one of the tabs, so the
  // bar always says where you are — e.g. Broadsheet lights up More.
  const onATab = tabs.some((t) => t.href !== "more" && isNavActive(t.href, pathname));

  return (
    <nav
      aria-label="Main"
      // Hidden, not unmounted, while typing: keeps the bar's state and avoids a
      // layout jump when the keyboard closes.
      hidden={typing}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-n-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden"
    >
      <ul className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => {
          const active = tab.href === "more" ? !onATab : isNavActive(tab.href, pathname);
          const inner = <TabInner tab={tab} active={active} />;
          const className = `relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 pt-1.5 pb-1 text-[11px] font-medium transition-colors ${
            active ? "text-primary" : "text-n-500 hover:text-ink"
          }`;

          return (
            <li key={tab.href} className="min-w-0">
              {tab.href === "more" ? (
                <button type="button" onClick={onOpenMore} className={className} aria-label="More: open the full menu">
                  {inner}
                </button>
              ) : (
                <Link href={tab.href} className={className} aria-current={active ? "page" : undefined}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TabInner({ tab, active }: { tab: ResolvedTab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <>
      {/* A short bar above the active tab — colour alone isn't enough of a
          signal on a dim phone screen in a sunny classroom. */}
      <span
        aria-hidden="true"
        className={`absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
      />
      <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
      <span className="max-w-full truncate">{tab.label}</span>
    </>
  );
}
