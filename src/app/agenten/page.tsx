import type { Metadata } from "next";
import {
  AGENT_ZAKEN,
  CATEGORIE_TITEL,
  OVERIGE_AGENT_ZAKEN,
  type AgentZaakCategorie,
} from "@/lib/agent-zaken";

export const metadata: Metadata = {
  title: "Agenten als dader",
  description:
    "Inventaris van politieambtenaren als verdachte of dader: moord, doodslag, verkrachting en geweld tijdens de dienst. Met bron per zaak.",
};

export default function AgentenPage() {
  const categorieen: AgentZaakCategorie[] = [
    "levensdelict",
    "zeden",
    "dienstgeweld",
    "ambtsmisbruik",
  ];

  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1100px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
          Inventaris
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Agenten als dader
        </h1>
        <p className="mt-6 max-w-[66ch] text-lg leading-relaxed text-muted">
          Zaken waarin een politieambtenaar als verdachte of dader figureert:
          moord en doodslag, zedendelicten en geweld tijdens de dienst. Alles
          uit openbare bronnen (rechtszaken, OM, Rijksrecherche, nieuws) met de
          bron per zaak. Een volledige overheidslijst bestaat niet, dus deze
          inventaris kan onvolledig zijn.
        </p>

        {categorieen.map((categorie) => (
          <section key={categorie} className="mt-14">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {CATEGORIE_TITEL[categorie]}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {AGENT_ZAKEN.filter((zaak) => zaak.categorie === categorie).map(
                (zaak) => (
                  <article
                    key={zaak.id}
                    className="rounded-xl border border-line bg-surface p-5"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                      {zaak.jaar} · {zaak.plaats} · {zaak.eenheid}
                    </p>
                    <h3 className="mt-2 font-medium leading-snug">
                      {zaak.titel}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {zaak.uitkomst}
                    </p>
                    <p className="mt-3 text-xs text-muted-2">
                      Bron:{" "}
                      <a
                        href={zaak.bronUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-muted"
                      >
                        {zaak.bronLabel}
                      </a>
                    </p>
                  </article>
                )
              )}
            </div>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Overige zaken uit het rechtspraak-onderzoek
          </h2>
          <p className="mt-3 max-w-[66ch] text-sm leading-relaxed text-muted">
            Uitspraken zonder vindbare plaats of uit het Caribisch deel van het
            Koninkrijk; allemaal gevonden via de uitputtende zoekactie in de
            rechtspraak-databank (oktober 2026).
          </p>
          <ul className="mt-6 space-y-3">
            {OVERIGE_AGENT_ZAKEN.map((zaak) => (
              <li
                key={zaak.ecli}
                className="rounded-xl border border-line bg-surface px-5 py-4"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                  {zaak.datum}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{zaak.omschrijving}</p>
                <p className="mt-2 text-xs text-muted-2">
                  Bron:{" "}
                  <a
                    href={`https://uitspraken.rechtspraak.nl/details?id=${encodeURIComponent(zaak.ecli)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-muted"
                  >
                    {zaak.ecli}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-14 max-w-[70ch] text-sm leading-relaxed text-muted-2">
          Methode: zoekactie in de rechtspraak-databank (ruim dertig
          zoektermen), nieuws- en persarchieven en de Woo-kanalen van politie
          en OM (oktober 2026). Namen staan er alleen als media of uitspraken
          ze openbaar maakten; veel agenten in rechterlijke uitspraken zijn
          geanonimiseerd. Zie ook de{" "}
          <a
            href="/uitspraken"
            className="underline underline-offset-4 hover:text-muted"
          >
            uitspraken-databank
          </a>{" "}
          en de{" "}
          <a
            href="/kaart"
            className="underline underline-offset-4 hover:text-muted"
          >
            kaart
          </a>
          .
        </p>
      </div>
    </main>
  );
}
