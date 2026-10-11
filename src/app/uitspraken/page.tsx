import type { Metadata } from "next";
import Link from "next/link";
import { UitsprakenLijst } from "@/components/uitspraken/uitspraken-lijst";

export const metadata: Metadata = {
  title: "Rechterlijke uitspraken",
  description:
    "Doorzoekbare selectie van uitspraken over politiegeweld: vervolging van agenten, beklag bij het gerechtshof en civiele zaken.",
};

export default function UitsprakenPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          Rechterlijke uitspraken
        </h1>
        <p className="mt-6 max-w-[66ch] text-lg leading-relaxed text-muted">
          Wat de rechter beslist in zaken over politieoptreden: strafzaken
          tegen agenten, beklag bij het gerechtshof (artikel 12 Sv) en civiele
          zaken over aansprakelijkheid. Elke samenvatting is gemaakt op basis
          van de officiële uitspraak zelf.
        </p>
        <p className="mt-4 max-w-[66ch] text-sm leading-relaxed text-muted-2">
          Alle uitspraken komen uit de Open Data van rechtspraak.nl; via de
          link lees je het volledige vonnis of arrest. De lijst groeit
          automatisch via de zoek-API van rechtspraak.nl (gereedschap:
          scripts/uitspraken-oogst.py in de repo); van die grote lijst is de
          categorie automatisch bepaald op basis van de officiële samenvatting
          en is de samenvatting de officiële inhoudsindicatie. Mis je een
          zaak? Mail naar{" "}
          <a
            href="mailto:label@hot-shot.com"
            className="underline underline-offset-4 hover:text-muted"
          >
            label@hot-shot.com
          </a>
          . Zelf iets meegemaakt? Gebruik het{" "}
          <Link
            href="/melden"
            className="underline underline-offset-4 hover:text-muted"
          >
            meldformulier
          </Link>{" "}
          of stel je vraag aan de{" "}
          <Link
            href="/chat"
            className="underline underline-offset-4 hover:text-muted"
          >
            vraagbaak
          </Link>
          .
        </p>

        <div className="mt-12">
          <UitsprakenLijst />
        </div>
      </div>
    </main>
  );
}
