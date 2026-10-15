"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { btnGhost, btnPrimary } from "@/lib/ui";
import { LiveKijker } from "@/components/live/live-kijker";

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

interface LiveStand {
  live: boolean;
  titel: string;
  kijkers: number;
  gestartOp: string;
}

interface LiveLink {
  id: string;
  url: string;
  host: string;
  titel: string;
  naam: string;
  toegevoegdOp: string;
}

interface LiveData {
  uitzendingen: Uitzending[];
  links: LiveLink[];
  live: LiveStand;
  bewaardagen: number;
}

function platformVan(host: string): string {
  const schoon = host.toLowerCase();
  if (schoon.includes("youtu")) return "YouTube";
  if (schoon.includes("tiktok")) return "TikTok";
  if (schoon.includes("instagram")) return "Instagram";
  if (schoon.includes("facebook") || schoon.includes("fb.watch")) return "Facebook";
  if (schoon.includes("twitch")) return "Twitch";
  return host;
}

function urenGeleden(iso: string): string {
  const tijd = Date.parse(iso);
  if (Number.isNaN(tijd)) return "";
  const uren = Math.floor((Date.now() - tijd) / 3_600_000);
  if (uren < 1) return "net geplaatst";
  return `${uren} ${uren === 1 ? "uur" : "uur"} geleden`;
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
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitel, setLinkTitel] = useState("");
  const [linkNaam, setLinkNaam] = useState("");
  const [linkBezig, setLinkBezig] = useState(false);
  const [linkMelding, setLinkMelding] = useState("");

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    laad();
    const timer = window.setInterval(laad, 20 * 1000);
    return () => window.clearInterval(timer);
  }, [laad]);

  async function zetLinkErbij(gebeurtenis: FormEvent<HTMLFormElement>) {
    gebeurtenis.preventDefault();
    const honing = String(
      new FormData(gebeurtenis.currentTarget).get("honing") ?? ""
    );
    gebeurtenis.preventDefault();
    setLinkBezig(true);
    setLinkMelding("");
    try {
      const antwoord = await fetch("/api/live/link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: linkUrl.trim(),
          titel: linkTitel.trim(),
          naam: linkNaam.trim(),
          honing,
        }),
      });
      const uitkomst = await antwoord.json().catch(() => ({}));
      if (!antwoord.ok) {
        setLinkMelding(uitkomst.fout ?? "Er ging iets mis. Probeer het opnieuw.");
        return;
      }
      setLinkMelding("Je link staat erbij en blijft 48 uur online.");
      setLinkUrl("");
      setLinkTitel("");
      await laad();
    } catch {
      setLinkMelding("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLinkBezig(false);
    }
  }

  const uitzendingen = data?.uitzendingen ?? [];
  const links = data?.links ?? [];
  const isLive = Boolean(data?.live?.live);

  return (
    <div className="space-y-14">
      {/* Live of de wachtstand */}
      <section aria-label="Live-uitzending">
        {isLive && data ? (
          <LiveKijker
            key={data.live.gestartOp || "live"}
            titel={data.live.titel}
            onEinde={laad}
          />
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
              Gebeurt er iets? Ga direct live vanaf je telefoon. Je camera
              gaat aan, kijkers zien je meteen, en de opname komt hier
              daarna automatisch online te staan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/live/start"
                className={cn(btnPrimary, "h-12 bg-accent px-7 text-base hover:bg-[#d0431f]")}
              >
                Ga nu live
              </Link>
              <a
                href="mailto:label@hot-shot.com?subject=Op%20de%20hoogte%20blijven%20van%20uitzendingen"
                className={btnGhost}
              >
                Houd me op de hoogte
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Gaat het ergens anders live? Eigen links erbij zetten */}
      <section
        aria-label="Andere live-uitzendingen"
        className="rounded-2xl border border-line bg-white/[0.02] p-8 md:p-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Gaat het ergens anders live?
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-muted">
              Gaat iemand live op TikTok, YouTube of Instagram? Zet de link
              erbij, zodat iedereen het kan vinden. De link blijft 48 uur
              staan en gaat daarna automatisch weg. Links komen van
              bezoekers en zijn niet door ons gecontroleerd.
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            {links.length > 0
              ? `${links.length} ${links.length === 1 ? "link" : "links"}`
              : "nog geen links"}
          </p>
        </div>

        <form
          onSubmit={zetLinkErbij}
          className="mt-6 grid gap-3 md:grid-cols-[1.4fr_1fr_0.8fr_auto]"
        >
          <input
            type="url"
            required
            value={linkUrl}
            onChange={(gebeurtenis) => setLinkUrl(gebeurtenis.target.value)}
            maxLength={500}
            placeholder="Plak hier de live-link (https://...)"
            aria-label="Live-link"
            className="h-11 min-w-0 rounded-lg border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-muted-2"
          />
          <input
            type="text"
            required
            value={linkTitel}
            onChange={(gebeurtenis) => setLinkTitel(gebeurtenis.target.value)}
            maxLength={120}
            placeholder="Korte titel, bijv. Live vanaf het plein"
            aria-label="Titel van de uitzending"
            className="h-11 min-w-0 rounded-lg border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-muted-2"
          />
          <input
            type="text"
            value={linkNaam}
            onChange={(gebeurtenis) => setLinkNaam(gebeurtenis.target.value)}
            maxLength={40}
            placeholder="Je naam (mag leeg)"
            aria-label="Je naam"
            className="h-11 min-w-0 rounded-lg border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-muted-2"
          />
          <input
            type="text"
            name="honing"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <button
            type="submit"
            disabled={linkBezig}
            className={cn(
              btnPrimary,
              "h-11 bg-accent px-5 hover:bg-[#d0431f]",
              linkBezig && "opacity-60"
            )}
          >
            {linkBezig ? "Bezig..." : "Zet erbij"}
          </button>
        </form>
        {linkMelding && (
          <p aria-live="polite" className="mt-3 text-sm">
            {linkMelding}
          </p>
        )}

        {links.length > 0 && (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{link.titel}</p>
                  <p className="mt-0.5 text-xs text-muted-2">
                    {platformVan(link.host)}
                    {link.naam ? ` · ${link.naam}` : ""} ·{" "}
                    {urenGeleden(link.toegevoegdOp)}
                  </p>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(btnGhost, "h-9 shrink-0 px-4 text-xs")}
                >
                  Bekijk
                </a>
              </li>
            ))}
          </ul>
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
              Elke uitzending bewaren we {data?.bewaardagen ?? 30} dagen, in
              HD (max 720p, bewust geen 4K) om het klein en gratis te
              houden. Het logo van het platform zit in de video; je mag hem
              vrij downloaden en delen.
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
              Direct vanaf de telefoon
            </p>
            <p className="mt-2">
              Iedereen kan op elk moment live gaan, zonder account. Eén knop
              op /live/start en je bent in de lucht.
            </p>
          </li>
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
              waar hij vandaan komt als hij gedeeld wordt. Vrij te
              downloaden.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
