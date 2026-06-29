// Next.js 16 type-checks every page.tsx. This file satisfies AppPageConfig<"/">
// by returning `never` via notFound(). The actual "/" route is served by
// app/page.tsx. Sub-pages (/pricing, /about, etc.) will be added as their
// own files inside (marketing)/ and will inherit Navbar+Footer from the layout.
import { notFound } from "next/navigation";

export default function MarketingRootPage() {
  return notFound();
}
