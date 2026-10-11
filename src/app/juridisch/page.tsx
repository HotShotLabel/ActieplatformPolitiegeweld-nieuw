import type { Metadata } from "next";
import Link from "next/link";
import { ModelbriefGenerator } from "@/components/juridisch/modelbrief-generator";
import { ROUTES } from "@/lib/modelbrieven";

export const metadata: Metadata = {
  title: "Juridische hulp",
  description:
    "Wegwijzers en modelbrieven na politiegeweld: klacht bij de politie, Nationale ombudsman, artikel 12 Sv, Woo-verzoek en schadevergoeding.",
};

export default function JuridischPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          Juridische hulp
        </h1>
        <p className="mt-6 max-w-[66ch] text-lg leading-relaxed text-muted">
          Vijf routes die je kunt bewandelen na politiegeweld. Per route leggen
          we uit wanneer die past, waar je moet zijn en waar je op moet letten.
          Daaronder staat een generator die direct een brief voor je opstelt.
        </p>
        <p className="mt-4 max-w-[66ch] text-sm leading-relaxed text-muted-2">
          Dit is algemene informatie uit de wet en van de politie zelf, geen
          juridisch advies over jouw zaak. Laat bij echte keuzes een jurist of
          advocaat meekijken. Twijfel je over de route? Vraag het de{" "}
          <Link href="/chat" className="underline underline-offset-4 hover:text-muted">
            vraagbaak
          </Link>{" "}
          of het{" "}
          <Link href="/melden" className="underline underline-offset-4 hover:text-muted">
            meldformulier
          </Link>
          .
        </p>

        <section
          aria-label="De vijf routes"
          className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {ROUTES.map((route) => (
            <article
              key={route.id}
              className="flex flex-col rounded-xl border border-line bg-surface p-6"
            >
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {route.titel}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {route.kort}
              </p>

              <div className="mt-5 space-y-3 text-sm leading-relaxed">
                <p>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                    Waarvoor
                  </span>
                  <br />
                  {route.wanneer}
                </p>
                <p>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                    Waar
                  </span>
                  <br />
                  {route.waar}
                </p>
              </div>

              <ul className="mt-5 space-y-2 text-sm leading-relaxed text-muted">
                {route.letOp.map((punt) => (
                  <li key={punt} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{punt}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-auto pt-5 text-xs leading-relaxed text-muted-2">
                Bron: {route.bron}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-20" aria-label="Modelbrief maken">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Maak je brief
          </h2>
          <p className="mt-4 max-w-[66ch] leading-relaxed text-muted">
            Kies het document, vul je gegevens in en de brief staat klaar.
            Kopieer hem of download hem als tekstbestand. Alles gebeurt in je
            eigen browser; wij zien of bewaren niets.
          </p>
          <div className="mt-8">
            <ModelbriefGenerator />
          </div>
        </section>
      </div>
    </main>
  );
}
