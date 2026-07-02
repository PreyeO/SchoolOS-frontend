export function isNavActive(href: string, pathname: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}
