import type { Metadata } from "next";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { MeldingenKaartLoader } from "@/components/kaart/meldingenkaart-loader";
import { btnPrimary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Meldingenkaart",
  description:
    "Bekijk waar meldingen van politiegeweld zich voordoen. Locaties zijn afgerond op ongeveer een kilometer.",
};

export default function KaartPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Meldingenkaart
            </h1>
            <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted">
              De kaart toont twee soorten punten: openbare zaken uit rechtspraak
              en onderzoek (met bron, op stadsniveau) en meldingen van
              bezoekers (anoniem, afgerond op ongeveer een kilometer). Beide
              lagen kun je apart aan- en uitzetten.
            </p>
          </div>
          <Link href="/melden" className={btnPrimary}>
            Melding doen
          </Link>
        </div>

        <div className="mt-10">
          <MeldingenKaartLoader />
        </div>

        <p className="mt-6 max-w-[70ch] text-sm leading-relaxed text-muted-2">
          De kaart gebruikt vrije kaarttegels van OpenStreetMap en CARTO: geen
          cookies, geen tracking, geen account nodig. Je verhaal zelf is nooit
          openbaar. Lees op de{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-muted"
          >
            privacypagina
          </Link>{" "}
          precies hoe we met meldingen omgaan.
        </p>
      </div>
    </main>
  );
}
