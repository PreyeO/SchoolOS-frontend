// Marketing layout. Wraps all public-facing pages with Navbar and Footer.
import { Navbar } from "@/components/layout/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {/* TODO (Phase 2 full): add <Footer /> */}
    </>
  );
}
