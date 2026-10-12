"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Vraagbaak = dynamic(
  () => import("@/components/chat/vraagbaak").then((m) => m.Vraagbaak),
  {
    ssr: false,
    loading: () => (
      <p className="px-5 py-6 text-sm text-muted">De vraagbaak wordt geladen.</p>
    ),
  }
);

/* Zwevende chat aan de rechterkant van de site. Verbergt zichzelf op de
   plekken waar al een eigen chat staat (vraagbaakpagina, live, beheer). */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const pad = usePathname() ?? "";

  if (
    pad.startsWith("/chat") ||
    pad.startsWith("/beheer") ||
    pad.startsWith("/live")
  ) {
    return null;
  }

  return (
    <>
      {open ? (
        <section
          aria-label="Vraagbaak"
          className="fixed bottom-20 right-3 z-50 flex max-h-[78vh] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-background shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-semibold tracking-tight">
              Vraagbaak
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
              aria-label="Sluit de chat"
            >
              Sluiten
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Vraagbaak />
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((w) => !w)}
        aria-expanded={open}
        className="fixed bottom-5 right-3 z-50 flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium shadow-lg transition-colors hover:border-accent/60"
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
        Chat
      </button>
    </>
  );
}
