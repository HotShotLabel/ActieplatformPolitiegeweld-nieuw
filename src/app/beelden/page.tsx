import type { Metadata } from "next";
import { BeeldenLijst } from "@/components/beelden/beelden-lijst";
import { BeeldenTip } from "@/components/beelden/beelden-tip";

export const metadata: Metadata = {
  title: "Beelden",
  description:
    "Verzamelde video's over politiegeweld in Nederland: YouTube, TikTok, Instagram, Telegram en tips, met bron per beeld.",
};

export default function BeeldenPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
          Verzameling
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Beelden
        </h1>
        <p className="mt-6 max-w-[68ch] text-lg leading-relaxed text-muted">
          Video&apos;s over politiegeweld in Nederland, verzameld van YouTube,
          TikTok, Instagram en Telegram en aangevuld met tips. Alles linkt naar
          de originele bron; wij bewaren zelf geen videobestanden. Tips worden
          nagelopen voordat ze hier komen te staan.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-4 py-1.5 text-sm">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
          Let op: deze beelden kunnen heftig zijn.
        </p>

        <BeeldenLijst />

        <section className="mt-16 rounded-xl border border-line bg-surface p-7">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Zelf een video tipen
          </h2>
          <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-muted">
            Zag je ergens een filmpje van politiegeweld in Nederland (TikTok,
            Instagram, YouTube, Telegram, X)? Plak de link hier. Ook filmpjes
            waarin mensen door de politie worden lastiggevallen of vernederd
            horen erbij. Ook TikTok- en Instagram-lives kun je melden via het
            link-formulier op de{" "}
            <a
              href="/live"
              className="underline underline-offset-4 hover:text-foreground"
            >
              live-pagina
            </a>
            .
          </p>
          <div className="mt-6">
            <BeeldenTip />
          </div>
        </section>

        <p className="mt-14 max-w-[70ch] text-sm leading-relaxed text-muted-2">
          Werkwijze: YouTube wordt geoogst via openbare zoekresultaten (met
          yt-dlp, zonder API-sleutel), overige platforms komen via tips. Elk
          beeld wordt met de hand gecontroleerd op relevantie en
          herleidbaarheid voordat het zichtbaar wordt. Wij hosten niets: elke
          kaart linkt naar het originele bericht. Zie ook de{" "}
          <a
            href="/live"
            className="underline underline-offset-4 hover:text-muted"
          >
            live-pagina
          </a>{" "}
          en de{" "}
          <a
            href="/melden"
            className="underline underline-offset-4 hover:text-muted"
          >
            meldpagina
          </a>
          .
        </p>
      </div>
    </main>
  );
}
