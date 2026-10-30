"use client";

import { useEffect, useState } from "react";

type Persoon = {
  naam: string;
  plaats: string;
  jaar: string;
  bron: string;
  url?: string;
};

const BASIS: Persoon[] = [
  { naam: "Efraïm Papilaja", plaats: "Nijmegen", jaar: "2026", bron: "De Gelderlander", url: "https://www.gelderlander.nl/nijmegen/schok-om-dood-van-efraim-die-overleed-na-arrestatie-hij-was-echt-een-gouden-vent~a5aa5daf/" },
  { naam: "Alfredo Goeloe", plaats: "Rotterdam", jaar: "2026", bron: "NRC", url: "https://www.nrc.nl/nieuws/2026/09/14/de-politie-zag-alfredo-51-ten-onrechte-aan-voor-een-fietsendief-hij-overleed-bij-zijn-arrestatie-a4936597" },
  { naam: "Mateusz", plaats: "Rotterdam", jaar: "2023", bron: "AD", url: "https://www.ad.nl/rotterdam/familie-van-mateusz-32-in-shock-na-fatale-arrestatie-onze-zoon-had-psychiatrische-problemen~a9454c8b/" },
  { naam: "Tim van den Boor", plaats: "Waalwijk", jaar: "2022", bron: "AD", url: "https://www.ad.nl/dordrecht/dordtse-moeder-verbijsterd-over-doodschieten-van-zoon-tim-door-politie-hij-heeft-geen-kans-gehad~a67cc9d3/" },
  { naam: "Raymon", plaats: "Emmeloord", jaar: "2019", bron: "De Stentor", url: "https://www.destentor.nl/noordoostpolder/overleed-goedzak-raymon-38-aan-hartfalen-familie-gelooft-politie-niet-hij-is-toegetakeld~a1ab7ebf/" },
  { naam: "Mitchel Winters", plaats: "Schiedam", jaar: "2016", bron: "Metro", url: "https://www.metronieuws.nl/in-het-nieuws/2016/06/veel-vragen-rond-doodgeschoten-mitchel-winters-21/" },
  { naam: "Mitch Henriquez", plaats: "Den Haag", jaar: "2015", bron: "Rechtspraak", url: "https://www.rechtspraak.nl/bekende-rechtszaken/mitch-henriquez" },
  { naam: "Ihsan Gürz", plaats: "IJmuiden", jaar: "2011", bron: "Controle Alt Delete", url: "https://overleden.controlealtdelete.nl/" },
  { naam: "Rinus de Groot", plaats: "Rotterdam", jaar: "1984", bron: "Delpher", url: "http://resolver.kb.nl/resolve?urn=ddd:010961638:mpeg21:a0908:ocr" },
  { naam: "Hans Kok", plaats: "Amsterdam", jaar: "1985", bron: "Delpher", url: "http://resolver.kb.nl/resolve?urn=ddd:011207029:mpeg21:a0001:ocr" },
  { naam: "Freddie Saffrie", plaats: "Breda", jaar: "1966", bron: "Delpher", url: "http://resolver.kb.nl/resolve?urn=ddd:010617541:mpeg21:a0009:ocr" },
  { naam: "Rens Stroeve", plaats: "Hilversum", jaar: "1969", bron: "Delpher", url: "http://resolver.kb.nl/resolve?urn=ddd:011015429:mpeg21:a0002:ocr" },
  { naam: "Willem Vonk", plaats: "Bergum", jaar: "1981", bron: "Delpher", url: "http://resolver.kb.nl/resolve?urn=ddd:011008279:mpeg21:a0007:ocr" },
];

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function voegSamen(basis: Persoon[], live: Persoon[]) {
  const uit = [...basis];
  for (const persoon of live) {
    if (!persoon.naam || /^onbekend/i.test(persoon.naam)) continue;
    const naam = norm(persoon.naam);
    if (!naam) continue;
    const bestaat = uit.some((bestaand) => {
      const b = norm(bestaand.naam);
      return b === naam || b.startsWith(`${naam} `) || naam.startsWith(`${b} `);
    });
    if (!bestaat) uit.push(persoon);
  }
  return uit.sort((a, b) => Number(b.jaar) - Number(a.jaar) || a.naam.localeCompare(b.naam, "nl"));
}

export function Gedenk() {
  const [namen, setNamen] = useState<Persoon[]>(BASIS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let actief = true;
    fetch("/api/overleden")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("geen data"))))
      .then((data: { zaken?: Array<{ naam?: string; plaats?: string; jaar?: string; bronUrl?: string; bronLabel?: string }> }) => {
        if (!actief || !Array.isArray(data.zaken)) return;
        const vanApi: Persoon[] = data.zaken
          .filter((z) => z.naam && z.plaats && z.jaar)
          .map((z) => ({
            naam: String(z.naam),
            plaats: String(z.plaats),
            jaar: String(z.jaar),
            bron: z.bronLabel === "database Controle Alt Delete" ? "CAD" : "nieuwsbericht",
            url: z.bronUrl,
          }));
        setNamen(voegSamen(BASIS, vanApi));
        setLive(true);
      })
      .catch(() => undefined);
    return () => {
      actief = false;
    };
  }, []);

  return (
    <section className="border-y border-line bg-[#07090c]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:py-28 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-blue">
            Wij zijn jullie niet vergeten
          </p>
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-2">
            {live ? "Live uit CAD" : "Openbare namenlijst"} · {namen.length} namen
          </span>
        </div>
        <h2 className="mt-4 max-w-[18ch] font-display text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl">
          Namen die niet mogen verdwijnen.
        </h2>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">
          Hier staan de namen die in onze dataset openbaar te koppelen zijn.
          Niet elke zaak heeft een publieke naam. De volledige registratie staat
          bij{" "}
          <a href="https://overleden.controlealtdelete.nl/" target="_blank" rel="noopener noreferrer" className="text-brand-blue underline underline-offset-4 hover:text-foreground">
            Controle Alt Delete
          </a>
          .
        </p>
        <p className="mt-3 max-w-[62ch] text-xs leading-relaxed text-muted-2">
          De kaart toont de locaties van gedocumenteerde zaken, ook zonder naam.
          Deze lijst is de openbare namenlijst, niet de volledige
          overlijdensregistratie.{" "}
          <a href="/kaart" className="text-brand-blue underline underline-offset-4 hover:text-foreground">
            Bekijk de kaart
          </a>
          .
        </p>

        <ol className="mt-10 border-t border-line">
          {namen.map((persoon, index) => (
            <li key={`${persoon.naam}-${persoon.jaar}`} className="grid gap-2 border-b border-line py-4 transition-colors hover:bg-white/[0.02] md:grid-cols-[48px_1fr_auto] md:items-baseline md:gap-6">
              <span className="font-mono text-[10px] tracking-[0.08em] text-brand-blue">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {persoon.naam}
                </h3>
                {persoon.url && (
                  <a href={persoon.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-mono text-[8px] uppercase tracking-[0.08em] text-muted-2 underline underline-offset-2 hover:text-brand-blue">
                    Bron: {persoon.bron}
                  </a>
                )}
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                {persoon.plaats} · {persoon.jaar}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-5 max-w-[72ch] text-xs leading-relaxed text-muted">
          Foto's plaatsen we alleen met toestemming van familie. Ken je een naam
          die hier ontbreekt, of heb je toestemming voor een foto?{" "}
          <a className="text-accent underline underline-offset-4" href="mailto:label@hot-shot.com?subject=Naam%20voor%20de%20gedenkmuur">
            Stuur hem naar ons
          </a>
          .
        </p>
      </div>
    </section>
  );
}
