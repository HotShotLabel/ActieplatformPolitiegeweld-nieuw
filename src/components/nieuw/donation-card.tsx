"use client";

import { useState } from "react";

const BEDRAGEN = [5, 10, 25, 50] as const;

export function DonationCard({ stripeUrl }: { stripeUrl?: string }) {
  const [bedrag, setBedrag] = useState<number>(10);
  const url = stripeUrl?.trim() || null;

  return (
    <div className="rounded-xl border border-[#111]/15 bg-[#f2eee6] p-6 text-[#111] shadow-[0_18px_50px_rgba(0,0,0,0.18)] md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#004c9d]">
        Jouw bijdrage
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        Kies een bedrag
      </h2>

      <div
        className="mt-4 grid grid-cols-4 gap-2"
        role="group"
        aria-label="Kies een donatiebedrag"
      >
        {BEDRAGEN.map((optie) => {
          const actief = bedrag === optie;
          return (
            <button
              key={optie}
              type="button"
              onClick={() => setBedrag(optie)}
              aria-pressed={actief}
              className={`border px-2 py-3 font-mono text-sm transition-colors ${
                actief
                  ? "border-[#111] bg-[#111] text-[#f2eee6]"
                  : "border-[#111]/25 text-[#111] hover:border-[#004c9d]/70 hover:bg-[#004c9d]/5"
              }`}
            >
              €{optie}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#5c574e]" aria-live="polite">
        Richtbedrag: €{bedrag}. Het definitieve bedrag kies je op de
        Stripe-pagina.
      </p>

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 bg-[#c92a25] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#a9231f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004c9d]"
        >
          Doneer via Stripe
          <span aria-hidden="true">→</span>
        </a>
      ) : (
        <span
          role="status"
          className="mt-5 flex min-h-12 w-full cursor-not-allowed items-center justify-center border border-[#111]/25 bg-[#111]/5 px-5 py-3 text-center text-sm font-semibold text-[#5c574e]"
        >
          Donatiekanaal wordt gekoppeld
        </span>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-[#5c574e]">
        Veilig betalen met iDEAL of kaart via Stripe. Eenmalig of maandelijks.
        Geen betaalgegevens op deze site.
      </p>

      {!url && (
        <p className="mt-3 border-t border-[#111]/15 pt-3 text-[11px] leading-relaxed text-[#8a2a25]">
          De officiële Stripe-link van Actieplatform Politiegeweld ontbreekt nog.
          Er wordt niets in rekening gebracht tot die is gekoppeld.
        </p>
      )}
    </div>
  );
}
