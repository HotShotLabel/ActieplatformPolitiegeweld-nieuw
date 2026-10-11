import type { Metadata } from "next";
import Link from "next/link";
import { NieuwsLijst } from "@/components/nieuws/nieuws-lijst";

export const metadata: Metadata = {
  title: "Nieuws",
  description:
    "Nieuwsberichten over politiegeweld en politieoptreden: live uit de feeds van NOS, NU.nl, AD en De Telegraaf, plus een archief van relevante berichten uit officiële bronnen.",
};

export default function NieuwsPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          Nieuws
        </h1>
        <p className="mt-6 max-w-[66ch] text-lg leading-relaxed text-muted">
          Alleen berichten waarin politiegeweld of handelen buiten de regels
          centraal staat: doodgeschoten of overleden na politieoptreden,
          geweld tijdens aanhoudingen, achtervolgingen met afloop, nekklemmen,
          en agenten die vervolgd of veroordeeld worden. Gewoon politienieuws
          (opsporingen, zoektochten, inbraken) blijft eruit. De berichten
          komen automatisch binnen via de eigen feeds van landelijke en
          regionale omroepen (NOS, NU.nl, AD, De Telegraaf, RTV Noord, RTV
          Drenthe, Omrop Fryslân, RTV Oost, Omroep Gelderland, RTV Utrecht,
          Omroep West, Rijnmond, Omroep Brabant, Omroep Zeeland, L1, Blik op
          Nieuws) en uit een gerichte oogst van duizenden zoekresultaten.
          Daarnaast lopen er doorlopend zoekopdrachten over het hele web en
          ververst de pagina zichzelf elke vijf minuten, zodat nieuwe
          berichten automatisch binnenkomen zonder handwerk.
        </p>
        <p className="mt-4 max-w-[66ch] text-sm leading-relaxed text-muted-2">
          Elke titel linkt naar het originele bericht; wij publiceren zelf geen
          artikelen. Daaronder staat een archief met relevante berichten uit
          onder andere NRC, Trouw, de Volkskrant, het Openbaar Ministerie en de
          Rijksrecherche. Mis je een bericht? Mail naar{" "}
          <a
            href="mailto:label@hot-shot.com"
            className="underline underline-offset-4 hover:text-muted"
          >
            label@hot-shot.com
          </a>
          . Iets meegemaakt? Gebruik het{" "}
          <Link
            href="/melden"
            className="underline underline-offset-4 hover:text-muted"
          >
            meldformulier
          </Link>
          .
        </p>

        <div className="mt-12">
          <NieuwsLijst />
        </div>
      </div>
    </main>
  );
}
