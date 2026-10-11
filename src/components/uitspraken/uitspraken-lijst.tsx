"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CATEGORIE_LABEL,
  rechtspraakUrl,
  UITSPRAKEN,
  type UitspraakCategorie,
} from "@/lib/uitspraken";

const CATEGORIEEN = Object.keys(CATEGORIE_LABEL) as UitspraakCategorie[];

const positieveUitkomsten = ["Politie aansprakelijk", "Geen straf opgelegd"];

const datumFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDatum(iso: string): string {
  return datumFormatter.format(new Date(`${iso}T12:00:00Z`));
}

export function UitsprakenLijst() {
  const [zoek, setZoek] = useState("");
  const [categorie, setCategorie] = useState<UitspraakCategorie | "alles">(
    "alles"
  );

  const resultaten = useMemo(() => {
    const term = zoek.trim().toLowerCase();
    return UITSPRAKEN.filter((uitspraak) => {
      if (categorie !== "alles" && uitspraak.categorie !== categorie) {
        return false;
      }
      if (!term) return true;
      const hooiberg = [
        uitspraak.titel,
        uitspraak.instantie,
        uitspraak.ecli,
        uitspraak.zaaknummer,
        uitspraak.uitkomst,
        uitspraak.samenvatting,
        CATEGORIE_LABEL[uitspraak.categorie],
      ]
        .join(" ")
        .toLowerCase();
      return hooiberg.includes(term);
    }).sort((a, b) => b.datum.localeCompare(a.datum));
  }, [zoek, categorie]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-sm">
          <label htmlFor="zoek" className="sr-only">
            Zoek in uitspraken
          </label>
          <input
            id="zoek"
            type="search"
            className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
            placeholder="Zoek op trefwoord, instantie of ECLI…"
            value={zoek}
            onChange={(event) => setZoek(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategorie("alles")}
            aria-pressed={categorie === "alles"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              categorie === "alles"
                ? "border-accent bg-accent-soft text-foreground"
                : "border-line-strong text-muted hover:border-muted-2 hover:text-foreground"
            )}
          >
            Alles
          </button>
          {CATEGORIEEN.map((optie) => (
            <button
              key={optie}
              type="button"
              onClick={() => setCategorie(optie)}
              aria-pressed={categorie === optie}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                categorie === optie
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-line-strong text-muted hover:border-muted-2 hover:text-foreground"
              )}
            >
              {CATEGORIE_LABEL[optie]}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-2">
        {resultaten.length}{" "}
        {resultaten.length === 1 ? "uitspraak" : "uitspraken"}
        {categorie !== "alles" ? ` in ${CATEGORIE_LABEL[categorie]}` : ""}
        {zoek.trim() ? ` voor “${zoek.trim()}”` : ""}
      </p>

      {resultaten.length === 0 ? (
        <div className="mt-8 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold tracking-tight">
            Geen uitspraken gevonden.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Probeer een andere zoekterm of kies een andere categorie.
          </p>
          <button
            type="button"
            onClick={() => {
              setZoek("");
              setCategorie("alles");
            }}
            className="mt-5 rounded-lg border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            Wis de filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {resultaten.map((uitspraak) => (
            <article
              key={uitspraak.ecli}
              className="rounded-xl border border-line bg-surface p-6 md:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="max-w-[52ch] font-display text-lg font-semibold tracking-tight md:text-xl">
                  {uitspraak.titel}
                </h2>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]",
                    positieveUitkomsten.includes(uitspraak.uitkomst)
                      ? "border-accent/50 bg-accent-soft text-foreground"
                      : "border-line-strong text-muted"
                  )}
                >
                  {uitspraak.uitkomst}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs tracking-wide text-muted-2">
                {uitspraak.instantie} · {formatDatum(uitspraak.datum)} ·{" "}
                {uitspraak.zaaknummer}
              </p>
              <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-muted">
                {uitspraak.samenvatting}
              </p>
              <a
                href={rechtspraakUrl(uitspraak.ecli)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-mono text-xs text-accent underline-offset-4 hover:underline"
              >
                {uitspraak.ecli} · lees de volledige uitspraak
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
