"use client";

import { usePathname } from "next/navigation";

// Next's own Link reliably scrolls to a `#hash` only as part of an actual
// route transition — confirmed against this Next version's own docs
// (node_modules/next/dist/docs/.../02-components/link.md, "Scrolling to an
// id": "Next.js will scroll to the Page ... upon navigation"). Clicking a
// `/#section` link while ALREADY on `/` is a same-route, hash-only change —
// there is no page transition for that scroll behaviour to attach to, so the
// URL updates and nothing moves. That's the common case here, not an edge
// one: every marketing anchor (navbar, mobile nav, footer) points at a
// section of the landing page, and most clicks on them happen from the
// landing page itself.
//
// Scoped to same-route clicks only. A click from /book-demo to /#pricing is a
// real navigation — Next's built-in behaviour already handles that correctly
// (see the 2026-08-30 landing-anchors fix), so this only intercepts when
// intercepting is actually necessary, and falls through to normal `<a>`/
// `<Link>` behaviour otherwise.
export function useInPageAnchorClick() {
  const pathname = usePathname();

  return function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;

    const targetPath = href.slice(0, hashIndex) || "/";
    if (targetPath !== pathname) return;

    const id = href.slice(hashIndex + 1);
    const el = document.getElementById(id);
    // No matching element — fall through to the browser's own hash handling
    // rather than silently doing nothing.
    if (!el) return;

    e.preventDefault();
    // scrollIntoView honours each section's own scroll-mt-24 (CSS
    // scroll-margin-top), which is what already clears the fixed Navbar for
    // the cross-route case — same offset, same result, no separate number to
    // keep in sync.
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Keeps the address bar (and back-button/share-link behaviour) consistent
    // with a real navigation, without triggering one.
    history.pushState(null, "", href);
  };
}
