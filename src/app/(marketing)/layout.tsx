// Marketing layout. Wraps all public-facing pages with Navbar and Footer.
//
// The landing page at app/page.tsx composes both itself rather than sitting in
// this group, so adding the Footer here doesn't double it up — it only reaches
// the sub-pages, which had been rendering without one.
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {/* pt-20 clears the fixed Navbar, which the landing page handles inside
          its own full-bleed Hero and so doesn't need. */}
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </>
  );
}
