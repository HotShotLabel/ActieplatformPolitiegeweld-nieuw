import type { Metadata } from "next";
import { ProfielenLijst } from "@/components/profielen/profielen-lijst";

export const metadata: Metadata = {
  title: "Agent-profielen",
  description:
    "Openbaar gemaakte kenmerken (dienstnummer, eenheid) die in meerdere zaken terugkomen, met bron per koppeling. Handmatig bevestigd, geen biometrie.",
};

export default function ProfielenPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
          Register
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Agent-profielen
        </h1>
        <p className="mt-6 max-w-[70ch] text-lg leading-relaxed text-muted">
          Wanneer hetzelfde openbare kenmerk (dienstnummer, eenheid,
          signalement) in meerdere zaken terugkomt, bundelen we dat hier: één
          profiel met alle gekoppelde zaken en de bron erbij. Zo zie je of
          dezelfde agent vaker opduikt, zonder gezichts- of stemherkenning.
        </p>
        <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-muted">
          <strong>Mogelijk dezelfde</strong> betekent: wij zagen dezelfde
          kenmerken, maar het verband is niet officieel bevestigd.{" "}
          <strong>Bevestigd met bron</strong> betekent: een officiële bron
          (uitspraak, OM, openbaar document) legt het verband. Elke koppeling
          komt met de bron erbij; bij twijfel publiceren we niet.
        </p>

        <ProfielenLijst />

        <p className="mt-14 max-w-[70ch] text-sm leading-relaxed text-muted-2">
          Werkwijze: menselijke observatie van openbare beelden en documenten.
          Geen biometrie, geen automatische matching, geen oordeel zonder bron.
          Zie ook{" "}
          <a
            href="/agenten"
            className="underline underline-offset-4 hover:text-muted"
          >
            politie en justitie als dader
          </a>{" "}
          en de{" "}
          <a
            href="/beelden"
            className="underline underline-offset-4 hover:text-muted"
          >
            beelden
          </a>
          .
        </p>
      </div>
    </main>
  );
}
