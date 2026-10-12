import type { Metadata } from "next";
import Link from "next/link";
import { Balken3D } from "@/components/cijfers/balken-3d";
import { PolitieScene } from "@/components/cijfers/politie-scene";
import {
  CIJFERBLOKKEN,
  GERICHTE_SCHOTEN_PER_JAAR,
  GEWELDSINCIDENTEN_PER_JAAR,
  GEWELDSMIDDELEN_2025,
  KLACHTEN_GEWELD_PER_JAAR,
} from "@/lib/cijfers";

export const metadata: Metadata = {
  title: "Politiegeweld in cijfers",
  description:
    "Geweldsgebruik door de politie in cijfers: incidenten per jaar, gebruikte middelen, gerichte schoten en beoordelingen. Uit officiële rapportages, met bron per grafiek.",
};

export default function CijfersPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          Politiegeweld in cijfers
        </h1>
        <p className="mt-6 max-w-[66ch] text-lg leading-relaxed text-muted">
          Wat de politie zelf registreert over geweldsgebruik. Alle cijfers op
          deze pagina komen uit officiële rapportages en jaarverslagen; per
          grafiek staat de bron eronder. Registratie is niet hetzelfde als de
          werkelijkheid: betere registratie kan ook een stijging verklaren.
        </p>

        <div className="mt-10">
          <PolitieScene />
        </div>

        <div className="mt-14 space-y-12">
          <section>
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Incidenten waarbij de politie geweld gebruikte
            </h2>
            <Balken3D
              balken={GEWELDSINCIDENTEN_PER_JAAR}
              bron="Kerncijfers politie (halfjaarbericht 2026) en de jaarlijkse rapportage Geweldsaanwendingen door politieambtenaren (politie.nl)"
            />
          </section>

          <section>
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Geweldsmiddelen in 2025
            </h2>
            <Balken3D
              balken={GEWELDSMIDDELEN_2025}
              bron="Rapportage Geweldsaanwendingen door politieambtenaren 2025 (politie.nl). In totaal 45.779 keer een geweldsmiddel; fysiek geweld en 'anders' (vrije toelichting) zijn de grootste posten."
            />
          </section>

          <section>
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Gerichte schoten met het vuurwapen
            </h2>
            <Balken3D
              balken={GERICHTE_SCHOTEN_PER_JAAR}
              bron="Rapportage Geweldsaanwendingen door politieambtenaren 2025 (politie.nl). In 198 van de 212 gerichte schoten in 2025 ging het om een ernstig gewond of agressief dier."
            />
          </section>

          <section>
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Klachten over geweldstoepassing
            </h2>
            <Balken3D
              balken={KLACHTEN_GEWELD_PER_JAAR}
              bron="Analyse van de politie (IAT) in de Woo-documenten 'Geweldsaanwendingen door politieambtenaren' (politie.nl, 2023). * 2021 is tot en met augustus. Een klein deel van de klachten wordt gegrond verklaard; het grootste deel ongegrond."
            />
          </section>
        </div>

        <section
          aria-label="Kerncijfers"
          className="mt-16 grid gap-4 md:grid-cols-2"
        >
          {CIJFERBLOKKEN.map((blok) => (
            <article
              key={blok.titel}
              className="rounded-xl border border-line bg-surface p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
                {blok.titel}
              </p>
              <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
                {blok.waarde}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {blok.toelichting}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted-2">
                Bron:{" "}
                {blok.bronUrl ? (
                  <a
                    href={blok.bronUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-muted"
                  >
                    {blok.bron}
                  </a>
                ) : (
                  blok.bron
                )}
              </p>
            </article>
          ))}
        </section>

        <p className="mt-10 max-w-[70ch] text-sm leading-relaxed text-muted-2">
          Ook belangrijk: dit zijn cijfers over geweldgebruik door de politie
          zelf. Cijfers over mensen die overleden na politieoptreden staan op
          de pagina{" "}
          <Link
            href="/overleden"
            className="underline underline-offset-4 hover:text-muted"
          >
            Overleden na politieoptreden
          </Link>
          . Wat de rechter beslist in deze zaken lees je in de{" "}
          <Link
            href="/uitspraken"
            className="underline underline-offset-4 hover:text-muted"
          >
            uitspraken-databank
          </Link>
          . Zelf iets meegemaakt? Gebruik het{" "}
          <Link
            href="/melden"
            className="underline underline-offset-4 hover:text-muted"
          >
            meldformulier
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
