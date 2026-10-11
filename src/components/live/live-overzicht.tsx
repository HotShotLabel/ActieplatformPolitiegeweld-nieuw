"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { btnGhost, btnPrimary } from "@/lib/ui";

interface Uitzending {
  id: string;
  titel: string;
  url: string;
  grootteMb: number;
  duurSec: number;
  toegevoegdOp: string;
  verlooptOp: string;
  dagenOver: number;
}

interface LiveData {
  uitzendingen: Uitzending[];
  liveEmbed: string;
  bewaardagen: number;
}

const datumFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Amsterdam",
});

function formatDatum(iso: string): string {
  const datum = new Date(iso);
  return Number.isNaN(datum.getTime()) ? "" : datumFormatter.format(datum);
}

function formatDuur(seconden: number): string {
  if (!seconden || seconden <= 0) return "";
  const minuten = Math.floor(seconden / 60);
  const rest = Math.round(seconden % 60);
  return `${minuten}:${String(rest).padStart(2, "0")}`;
}

export function LiveOverzicht() {
  const [data, setData] = useState<LiveData | null>(null);
  const [mislukt, setMislukt] = useState(false);

  const laad = useCallback(async () => {
    try {
      const antwoord = await fetch("/api/live", { cache: "no-store" });
      if (!antwoord.ok) throw new Error(`status ${antwoord.status}`);
      setData(await antwoord.json());
      setMislukt(false);
    } catch {
      setMislukt(true);
    }
  }, []);

  useEffect(() => {
    laad();
    const timer = window.setInterval(laad, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [laad]);

  const uitzendingen = data?.uitzendingen ?? [];

  return (
    <div className="space-y-14">
      {/* Live-uitzending of de wachtstand */}
      <section aria-label="Live-uitzending">
        {data?.liveEmbed ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-black">
            <iframe
              src={data.liveEmbed}
              title="Live-uitzending van het Actieplatform Politiegeweld"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-white/[0.02] p-8 md:p-10">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
              <span
                aria-hidden
                className="h-2 w-2 animate-pulse rounded-full bg-accent"
              />
              Momenteel niet live
            </p>
            <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-muted">
              We gaan regelmatig live: uitzendingen over zaken, rechtszittingen
              die we volgen en gesprekken met betrokkenen. Zodra er een
              uitzending begint, verschijnt hij hier.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="mailto:label@hot-shot.com?subject=Op%20de%20hoogte%20blijven%20van%20uitzendingen" className={btnPrimary}>
                Houd me op de hoogte
              </a>
              <a href="mailto:label@hot-shot.com?subject=Ik%20wil%20zelf%20live%20vertellen" className={btnGhost}>
                Ik wil zelf mijn verhaal doen
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Terugkijken en downloaden */}
      <section aria-label="Eerdere uitzendingen">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Om terug te kijken
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-muted">
              Elke uitzending bewaren we {data?.bewaardagen ?? 30} dagen. Het
              logo van het platform zit in de video; je mag hem vrij
              downloaden en delen.
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            {uitzendingen.length > 0
              ? `${uitzendingen.length} ${uitzendingen.length === 1 ? "opname" : "opnames"} online`
              : "Nog geen opnames"}
          </p>
        </div>

        {mislukt && (
          <p className="mt-8 rounded-xl border border-line bg-white/[0.02] p-6 text-sm text-muted">
            De lijst laden lukte even niet. Ververs de pagina om het opnieuw
            te proberen.
          </p>
        )}

        {!mislukt && data === null && (
          <p className="mt-8 text-sm text-muted-2">Lijst laden...</p>
        )}

        {!mislukt && data !== null && uitzendingen.length === 0 && (
          <p className="mt-8 rounded-xl border border-line bg-white/[0.02] p-6 text-sm text-muted">
            Er staan nu geen opnames online. De eerstvolgende uitzending
            verschijnt hier.
          </p>
        )}

        {uitzendingen.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {uitzendingen.map((uitzending) => (
              <article
                key={uitzending.id}
                className="overflow-hidden rounded-2xl border border-line bg-white/[0.02]"
              >
                <video
                  controls
                  preload="metadata"
                  src={uitzending.url}
                  className="aspect-video w-full bg-black"
                />
                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="font-medium leading-snug">
                      {uitzending.titel}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-2">
                      {formatDatum(uitzending.toegevoegdOp)}
                      {uitzending.duurSec > 0 &&
                        ` · ${formatDuur(uitzending.duurSec)}`}
                      {uitzending.grootteMb > 0 &&
                        ` · ${uitzending.grootteMb.toLocaleString("nl-NL")} MB`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <a
                      href={uitzending.url}
                      download
                      className={cn(btnGhost, "h-9 px-4 text-xs")}
                    >
                      Download met logo (mp4)
                    </a>
                    <span
                      className={cn(
                        "rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                        uitzending.dagenOver <= 5
                          ? "text-accent"
                          : "text-muted-2"
                      )}
                    >
                      nog {uitzending.dagenOver}{" "}
                      {uitzending.dagenOver === 1 ? "dag" : "dagen"} online
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Spelregels */}
      <section
        aria-label="Spelregels van de uitzendingen"
        className="rounded-2xl border border-line bg-white/[0.02] p-8 md:p-10"
      >
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Zo werken onze uitzendingen
        </h2>
        <ul className="mt-6 grid gap-5 text-sm leading-relaxed text-muted md:grid-cols-3">
          <li>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
              30 dagen, niet langer
            </p>
            <p className="mt-2">
              Elke opname staat {data?.bewaardagen ?? 30} dagen online en
              wordt daarna automatisch van de site en uit de opslag
              verwijderd.
            </p>
          </li>
          <li>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
              Met het logo erin
            </p>
            <p className="mt-2">
              De video draagt het logo van het platform, zodat duidelijk is
              waar hij vandaan komt als hij gedeeld wordt.
            </p>
          </li>
          <li>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
              Vrij te downloaden
            </p>
            <p className="mt-2">
              Iedereen mag de opname downloaden, delen en gebruiken. Wil je
              iets rechtzetten of verwijderd hebben? Mail ons.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
