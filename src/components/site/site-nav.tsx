"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { cn } from "@/lib/utils";
import { btnPrimary } from "@/lib/ui";

const LINKS = [
  { href: "/kaart", label: "Kaart" },
  { href: "/uitspraken", label: "Uitspraken" },
  { href: "/overleden", label: "Overleden" },
  { href: "/cijfers", label: "Cijfers" },
  { href: "/juridisch", label: "Juridisch" },
  { href: "/chat", label: "Chat" },
  { href: "/meedoen", label: "Meedoen" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 16));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-line bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
    >
      <a
        href="#main"
        className="sr-only rounded-md bg-accent-deep px-4 py-2 text-sm text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Naar de inhoud
      </a>
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Actieplatform Politiegeweld, naar home"
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full bg-accent"
          />
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Actieplatform
            <span className="ml-1.5 font-normal text-muted">
              Politiegeweld
            </span>
          </span>
        </Link>

        <nav
          aria-label="Hoofdmenu"
          className="hidden items-center gap-7 md:flex"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/melden" className={btnPrimary}>
            Melding doen
          </Link>
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobiel-menu"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong md:hidden"
        >
          <span aria-hidden className="relative block h-3.5 w-5">
            <span
              className={cn(
                "absolute left-0 top-0 h-px w-full bg-foreground transition-transform duration-200",
                open && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[7px] h-px w-full bg-foreground transition-opacity duration-200",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[14px] h-px w-full bg-foreground transition-transform duration-200",
                open && "-translate-y-[7px] -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobiel-menu"
            aria-label="Hoofdmenu mobiel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-muted transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/melden"
                onClick={() => setOpen(false)}
                className={cn(btnPrimary, "mt-3")}
              >
                Melding doen
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
