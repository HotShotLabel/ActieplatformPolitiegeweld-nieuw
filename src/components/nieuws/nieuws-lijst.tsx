"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { SOORT_LABEL, type NieuwsSoort } from "@/lib/nieuws-archief";

interface Bericht {
  titel: string;
  bron: string;
  url: string;
  datum: string;
  live: boolean;
  soort: NieuwsSoort;
}

const datumFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Amsterdam",
});

function formatDatum(iso: string) {
  if (!iso) return "";
  const datum = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(datum.getTime()) ? "" : datumFormatter.format(datum);
}

export function NieuwsLijst() {
  const [berichten, setBerichten] = useState<Bericht[] | null>(null);
  const [mislukt, setMislukt] = useState(false);
  const [zoek, setZoek] = useState("");
  const [soort, setSoort] = useState<NieuwsSoort | "alles">("alles");
  const [zichtbaar, setZichtbaar] = useState(60);
  const [bijgewerktOp, setBijgewerktOp] = useState("");

  useEffect(() => {
    let actief = true;
    let eerste = true;
    const laad = async () => {
      try {
        const antwoord = await fetch("/api/nieuws");
        const data = (await antwoord.json()) as { berichten: Bericht[] };
        if (!actief) return;
        setBerichten(data.berichten);
        setMislukt(false);
        eerste = false;
        setBijgewerktOp(
          new Date().toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch {
        if (actief && eerste) setMislukt(true);
      }
    };
    void laad();
    const timer = setInterval(() => void laad(), 300_000);
    return () => {
      actief = false;
      clearInterval(timer);
    };
  }, []);

  const resultaten = useMemo(() => {
    if (!berichten) return null;
    const term = zoek.trim().toLowerCase();
    return berichten.filter((bericht) => {
      if (soort !== "alles" && bericht.soort !== soort) return false;
      if (!term) return true;
      return `${bericht.titel} ${bericht.bron}`.toLowerCase().includes(term);
    });
  }, [berichten, zoek, soort]);

  return (
    <div>
      <div className="w-full md:max-w-sm">
        <label htmlFor="nieuws-zoek" className="sr-only">
          Zoek in nieuwsberichten
        </label>
        <input
          id="nieuws-zoek"
          type="search"
          className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
          placeholder="Zoek op trefwoord of bron…"
          value={zoek}
          onChange={(event) => {
            setZoek(event.target.value);
            setZichtbaar(60);
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["alles", "overleden", "gevaar", "agent-vervolgd", "burger-vervolgd"] as const).map(
          (optie) => (
            <button
              key={optie}
              type="button"
              onClick={() => {
                setSoort(optie);
                setZichtbaar(60);
              }}
              aria-pressed={soort === optie}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                soort === optie
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-line-strong text-muted hover:border-muted-2 hover:text-foreground"
              )}
            >
              {optie === "alles" ? "Alles" : SOORT_LABEL[optie]}
            </button>
          )
        )}
      </div>

      {mislukt ? (
        <p className="mt-6 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm">
          De nieuwsberichten konden niet worden geladen. Probeer het later nog
          eens.
        </p>
      ) : null}

      {resultaten === null && !mislukt ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((rij) => (
            <div
              key={rij}
              className="h-20 animate-pulse rounded-xl border border-line bg-surface"
            />
          ))}
        </div>
      ) : null}

      {resultaten && resultaten.length === 0 ? (
        <div className="mt-8 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold tracking-tight">
            Geen berichten gevonden.
          </p>
          <p className="mt-2 text-sm text-muted">
            Probeer een andere zoekterm.
          </p>
        </div>
      ) : null}

      {resultaten && resultaten.length > 0 ? (
        <>
          <p className="mt-5 text-sm text-muted-2">
            {resultaten.length > zichtbaar
              ? `${zichtbaar} van ${resultaten.length} berichten`
              : `${resultaten.length} ${resultaten.length === 1 ? "bericht" : "berichten"}`}
            {zoek.trim() ? ` voor “${zoek.trim()}”` : ""}
            {bijgewerktOp ? ` · bijgewerkt om ${bijgewerktOp}` : ""}
          </p>
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {resultaten.slice(0, zichtbaar).map((bericht) => (
              <li key={bericht.url} className="py-5">
                <a
                  href={bericht.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]",
                        bericht.live
                          ? "border-accent/60 bg-accent-soft text-foreground"
                          : "border-line-strong text-muted"
                      )}
                    >
                      {bericht.bron}
                    </span>
                    <span className="font-mono text-xs text-muted-2">
                      {formatDatum(bericht.datum)}
                    </span>
                    {bericht.soort !== "overig" ? (
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2">
                        {SOORT_LABEL[bericht.soort]}
                      </span>
                    ) : null}
                    {bericht.live ? (
                      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent"
                        />
                        nieuw
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-[80ch] font-display text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
                    {bericht.titel}
                  </p>
                </a>
              </li>
            ))}
          </ul>
          {resultaten.length > zichtbaar ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setZichtbaar((waarde) => waarde + 60)}
                className="rounded-lg border border-line-strong px-5 py-2.5 text-sm text-muted transition-colors hover:border-muted-2 hover:text-foreground"
              >
                Meer laden ({resultaten.length - zichtbaar} over)
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
