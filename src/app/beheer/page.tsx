import type { Metadata } from "next";
import { BeheerLijst } from "@/components/beheer/beheer-lijst";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default function BeheerPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1000px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Beheer
        </h1>
        <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted">
          Alles wat binnenkomt op één plek: meldingen, live-uitzendingen en
          ingestuurde links. Deze pagina is niet openbaar en wordt niet
          geïndexeerd.
        </p>
        <div className="mt-10">
          <BeheerLijst />
        </div>
      </div>
    </main>
  );
}
