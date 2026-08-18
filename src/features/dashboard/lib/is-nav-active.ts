import { findNavItemForPath, type NavItem } from "@/data/navigation";

// Whether this exact nav row is the one the current route belongs to.
//
// Longest match wins, delegated to findNavItemForPath so there is one rule
// rather than two. A plain startsWith lit up every ancestor route: Score Entry
// lives at "/results" and so read as active on /results/publish,
// /results/broadsheet and every other sibling, putting two highlights in the
// sidebar at once. Detail routes still resolve to their parent — /students/<id>
// has no item of its own, so "/students" remains the longest match.
export function isNavActive(href: string, pathname: string): boolean {
  // "/dashboard" is a prefix of nothing, but it's also the fallback every
  // unmatched path would otherwise be drawn to. Exact, as before.
  if (href === "/dashboard") return pathname === href;
  return findNavItemForPath(pathname)?.href === href;
}

// Whether anything inside this group — or inside a nested disclosure item — is
// active. Needed separately because a groupedItem wrapper's own href is a
// shared prefix rather than a page, so it never satisfies isNavActive itself
// and asking it directly would report the group as inactive while one of its
// children is open.
export function isAnyNavActive(items: NavItem[], pathname: string): boolean {
  return items.some((item) =>
    item.items ? isAnyNavActive(item.items, pathname) : isNavActive(item.href, pathname),
  );
}
