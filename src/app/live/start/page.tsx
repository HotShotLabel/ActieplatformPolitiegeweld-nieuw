import type { Metadata } from "next";
import { LiveUitzender } from "@/components/live/live-uitzender";

export const metadata: Metadata = {
  title: "Ga nu live",
  description:
    "Direct live gaan vanaf je telefoon: één knop, geen account. De opname komt met logo online en blijft 30 dagen.",
  robots: { index: false },
};

export default function LiveStartPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[760px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
          Live
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Ga nu live
        </h1>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
          Er gebeurt iets en je wilt dat de wereld het ziet? Je hebt geen
          account nodig. Vul hooguit een naam in, druk op de knop en je bent
          live.
        </p>

        <div className="mt-12">
          <LiveUitzender />
        </div>

        <div className="mt-14 rounded-2xl border border-line bg-white/[0.02] p-6 text-sm leading-relaxed text-muted">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            Spelregels, kort
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Alleen jij kunt op dat moment live zijn; er is één uitzending tegelijk.</li>
            <li>De opname blijft 30 dagen online en is vrij te downloaden, met logo.</li>
            <li>Het beheer kan een uitzending meteen stoppen als dat nodig is.</li>
            <li>Zend niets uit waar anderen niet mee instemmen, en niets onwettigs.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
