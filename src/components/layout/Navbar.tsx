"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { NAV_CTA_PRIMARY, NAV_CTA_SECONDARY, NAV_LINKS } from "@/data/nav";
import { useInPageAnchorClick } from "@/lib/scroll-to-in-page-hash";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Container } from "./Container";
import { MobileNav } from "./MobileNav";

function Logo() {
  return (
    <Link href="/" className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
      <span className="font-display text-xl font-bold text-ink tracking-tight">
        School<span className="text-brand">OS</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const onAnchorClick = useInPageAnchorClick();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all",
        scrolled
          ? "bg-paper/95 backdrop-blur-md border-b border-n-200 py-3 shadow-sm"
          : "bg-transparent py-5",
      )}
    >
      <Container className="flex items-center gap-8">
        <Logo />

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => onAnchorClick(e, link.href)}
              className="px-4 py-2 text-sm font-medium text-n-600 hover:text-ink hover:bg-n-100 rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link
            href={NAV_CTA_SECONDARY.href}
            className="text-sm font-medium text-n-600 hover:text-ink transition-colors"
          >
            {NAV_CTA_SECONDARY.label}
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-amber hover:bg-amber/90 text-ink font-semibold h-9 px-5"
          >
            <Link href={NAV_CTA_PRIMARY.href}>{NAV_CTA_PRIMARY.label}</Link>
          </Button>
        </div>

        <div className="md:hidden ml-auto">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5 text-ink" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-paper p-6">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <MobileNav onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
