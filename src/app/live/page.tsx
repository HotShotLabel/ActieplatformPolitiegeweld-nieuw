import type { Metadata } from "next";
import { LiveOverzicht } from "@/components/live/live-overzicht";

export const metadata: Metadata = {
  title: "Live",
  description:
    "Live-uitzendingen van het Actieplatform Politiegeweld. Elke opname blijft 30 dagen online, met logo, en is vrij te downloaden.",
};

export default function LivePage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1100px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
          Live
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Uitzendingen
        </h1>
        <p className="mt-6 max-w-[64ch] text-lg leading-relaxed text-muted">
          We gaan live als er iets te vertellen valt: over zaken die we
          volgen, over wat politieoptreden met mensen doet, en met wie daar
          iets over wil zeggen. <span className="text-foreground">Elke
          uitzending blijft 30 dagen online</span> en is vrij te downloaden,
          met het logo van het platform erin.
        </p>

        <div className="mt-12">
          <LiveOverzicht />
        </div>
      </div>
    </main>
  );
}
