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
          Berichten uit de Nederlandse media en van officiële instanties over
          politiegeweld en politieoptreden. Nieuwe berichten komen automatisch
          binnen via de eigen feeds van NOS, NU.nl, AD en De Telegraaf; daar
          filteren we op onderwerpen die hiermee te maken hebben.
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
