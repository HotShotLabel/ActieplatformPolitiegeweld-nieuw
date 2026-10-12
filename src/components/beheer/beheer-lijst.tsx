"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { btnGhost, btnPrimary } from "@/lib/ui";
import { SOORT_LABEL } from "@/lib/meldingen";
import { uploadNaarYouTube } from "@/lib/youtube-client";

interface BeheerMelding {
  id: string;
  soort: string;
  datum: string;
  plaats: string;
  beschrijving: string;
  opKaart: boolean;
  contactEmail: string;
  agentGeslacht: string;
  agentLeeftijd: string;
  agentNaam: string;
  eenheid: string;
  voertuig: string;
  kentekens: string;
  dienstnummers: string;
  soortAgent: string;
  aantalAgenten: string;
  agentBeschrijving: string;
  createdAt: string;
}

function agentRijen(melding: BeheerMelding): [string, string][] {
  const rijen: [string, string][] = [
    ["Aantal agenten", melding.aantalAgenten],
    ["Geslacht", melding.agentGeslacht],
    ["Leeftijd (schatting)", melding.agentLeeftijd],
    ["Naam", melding.agentNaam],
    ["Eenheid", melding.eenheid],
    ["Soort agent", melding.soortAgent],
    ["Voertuig", melding.voertuig],
    ["Kenteken(s)", melding.kentekens],
    ["Dienstnummer(s)", melding.dienstnummers],
  ];
  return rijen.filter((rij) => rij[1] !== "");
}

interface BeheerUitzending {
  id: string;
  titel: string;
  url: string;
  grootteMb: number;
  duurSec: number;
  dagenOver: number;
  youtubeUrl: string;
}

interface BeheerLink {
  id: string;
  url: string;
  host: string;
  titel: string;
  naam: string;
}

const datumFormatter = new Intl.DateTimeFormat("nl-NL", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Amsterdam",
});

function formatDatum(iso: string): string {
  if (!iso) return "onbekend";
  try {
    return datumFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
}

export function BeheerLijst() {
  const [token, setToken] = useState("");
  const [meldingen, setMeldingen] = useState<BeheerMelding[] | null>(null);
  const [status, setStatus] = useState<"login" | "laden" | "klaar" | "fout">(
    "login"
  );
  const [foutmelding, setFoutmelding] = useState("");
  const [verwijderBezig, setVerwijderBezig] = useState("");
  const [liveStand, setLiveStand] = useState<{
    live: boolean;
    titel: string;
    kijkers: number;
  } | null>(null);
  const [stopBezig, setStopBezig] = useState(false);
  const [liveMelding, setLiveMelding] = useState("");
  const [uitzendingen, setUitzendingen] = useState<BeheerUitzending[]>([]);
  const [opnameBezig, setOpnameBezig] = useState("");
  const [uitzendingMelding, setUitzendingMelding] = useState("");
  const [links, setLinks] = useState<BeheerLink[]>([]);
  const [linkBezig, setLinkBezig] = useState("");
  const [linkMelding, setLinkMelding] = useState("");

  const laadLive = useCallback(async () => {
    try {
      const antwoord = await fetch("/api/live", { cache: "no-store" });
      if (!antwoord.ok) return;
      const data = await antwoord.json();
      setLiveStand({
        live: Boolean(data?.live?.live),
        titel: String(data?.live?.titel ?? ""),
        kijkers: Number(data?.live?.kijkers ?? 0),
      });
      setUitzendingen(
        Array.isArray(data?.uitzendingen) ? data.uitzendingen : []
      );
      setLinks(Array.isArray(data?.links) ? data.links : []);
    } catch {
      // stil blijven; het is een hulpmiddel
    }
  }, []);

  useEffect(() => {
    if (status !== "klaar") return;
    laadLive();
    const timer = window.setInterval(laadLive, 15 * 1000);
    return () => window.clearInterval(timer);
  }, [status, laadLive]);

  async function stopUitzending() {
    if (!window.confirm("De live-uitzending meteen stoppen voor iedereen?")) {
      return;
    }
    setStopBezig(true);
    setLiveMelding("");
    try {
      const antwoord = await fetch("/api/beheer/live-stop", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await antwoord.json().catch(() => ({}));
      if (antwoord.ok) {
        setLiveMelding("De uitzending is gestopt.");
        await laadLive();
      } else {
        setLiveMelding(data.fout ?? "Stoppen mislukte.");
      }
    } catch {
      setLiveMelding("Stoppen mislukte. Probeer het opnieuw.");
    } finally {
      setStopBezig(false);
    }
  }

  async function verwijderUitzending(id: string) {
    if (
      !window.confirm(
        "Deze uitzending voorgoed verwijderen? Het bestand en de registratie verdwijnen."
      )
    ) {
      return;
    }
    setOpnameBezig(id);
    setUitzendingMelding("");
    try {
      const antwoord = await fetch("/api/beheer/uitzending", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await antwoord.json().catch(() => ({}));
      if (antwoord.ok) {
        setUitzendingMelding("De uitzending is verwijderd.");
        await laadLive();
      } else {
        setUitzendingMelding(data.fout ?? "Verwijderen mislukte.");
      }
    } catch {
      setUitzendingMelding("Verwijderen mislukte. Probeer het opnieuw.");
    } finally {
      setOpnameBezig("");
    }
  }

  async function naarYouTubeBeheer(uitzending: BeheerUitzending) {
    setOpnameBezig(uitzending.id);
    setUitzendingMelding("");
    try {
      const tokenAntwoord = await fetch("/api/live/youtube-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: uitzending.id }),
      });
      const tokenData = await tokenAntwoord.json();
      if (!tokenAntwoord.ok || !tokenData.token) {
        throw new Error(tokenData.fout ?? "Geen YouTube-toegang.");
      }
      const bestand = await fetch(uitzending.url);
      if (!bestand.ok) throw new Error("Het bestand kon niet worden geladen.");
      const blob = await bestand.blob();
      const videoId = await uploadNaarYouTube(
        blob,
        String(tokenData.token),
        `${uitzending.titel} - ${new Date().toLocaleDateString("nl-NL")}`
      );
      if (!videoId) throw new Error("Geen video-id van YouTube.");
      const klaar = await fetch("/api/live/youtube-klaar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: uitzending.id, youtubeId: videoId }),
      });
      if (!klaar.ok) throw new Error("Opslaan van de YouTube-status mislukte.");
      setUitzendingMelding("Privé op YouTube gezet.");
      await laadLive();
    } catch (fout) {
      setUitzendingMelding(
        (fout as Error).message || "De YouTube-upload mislukte."
      );
    } finally {
      setOpnameBezig("");
    }
  }

  async function verwijderLink(id: string) {
    if (!window.confirm("Deze ingestuurde link verwijderen?")) return;
    setLinkBezig(id);
    setLinkMelding("");
    try {
      const antwoord = await fetch("/api/beheer/livelink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await antwoord.json().catch(() => ({}));
      if (antwoord.ok) {
        setLinkMelding("De link is verwijderd.");
        await laadLive();
      } else {
        setLinkMelding(data.fout ?? "Verwijderen mislukte.");
      }
    } catch {
      setLinkMelding("Verwijderen mislukte. Probeer het opnieuw.");
    } finally {
      setLinkBezig("");
    }
  }

  async function laadMeldingen(gebruikToken: string) {
    setStatus("laden");
    setFoutmelding("");
    try {
      const antwoord = await fetch("/api/beheer/meldingen", {
        headers: { Authorization: `Bearer ${gebruikToken}` },
      });
      if (antwoord.status === 401) {
        setStatus("fout");
        setFoutmelding("Onjuist wachtwoord.");
        return;
      }
      if (!antwoord.ok) {
        setStatus("fout");
        setFoutmelding("Meldingen konden niet worden geladen.");
        return;
      }
      const data = (await antwoord.json()) as { meldingen: BeheerMelding[] };
      setMeldingen(data.meldingen);
      setStatus("klaar");
      try {
        sessionStorage.setItem("beheer-token", gebruikToken);
      } catch {
        // geen sessionStorage, geen probleem
      }
    } catch {
      setStatus("fout");
      setFoutmelding("Meldingen konden niet worden geladen.");
    }
  }

  async function verwijder(melding: BeheerMelding) {
    if (
      !window.confirm(
        "Weet je zeker dat je deze melding definitief wilt verwijderen? Een gekoppeld kaartpunt gaat ook weg."
      )
    ) {
      return;
    }
    setVerwijderBezig(melding.id);
    try {
      const antwoord = await fetch(
        `/api/beheer/meldingen?id=${encodeURIComponent(melding.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (antwoord.ok) {
        setMeldingen((huidig) =>
          huidig ? huidig.filter((item) => item.id !== melding.id) : huidig
        );
      } else {
        setFoutmelding("Verwijderen mislukte. Probeer het opnieuw.");
      }
    } catch {
      setFoutmelding("Verwijderen mislukte. Probeer het opnieuw.");
    } finally {
      setVerwijderBezig("");
    }
  }

  function uitloggen() {
    setToken("");
    setMeldingen(null);
    setStatus("login");
    try {
      sessionStorage.removeItem("beheer-token");
    } catch {
      // niets
    }
  }

  if (status !== "klaar" || !meldingen) {
    return (
      <div className="max-w-md rounded-xl border border-line bg-surface p-7">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Inloggen
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Vul het beheerderswachtwoord in om de binnengekomen meldingen te
          bekijken.
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (token.trim()) laadMeldingen(token.trim());
          }}
        >
          <div>
            <label htmlFor="beheer-token" className="mb-1.5 block text-sm text-muted">
              Wachtwoord
            </label>
            <input
              id="beheer-token"
              type="password"
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground focus:border-accent focus:outline-none"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </div>
          {foutmelding ? (
            <p
              aria-live="polite"
              className="rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm"
            >
              {foutmelding}
            </p>
          ) : null}
          <button
            type="submit"
            className={btnPrimary}
            disabled={status === "laden" || !token.trim()}
          >
            {status === "laden" ? "Laden…" : "Open beheer"}
          </button>
        </form>
      </div>
    );
  }

  const totaleOpslagMb = uitzendingen.reduce(
    (som, uitzending) => som + (Number(uitzending.grootteMb) || 0),
    0
  );

  return (
    <div>
      {/* Live-uitzending: status en noodstop */}
      <section
        aria-label="Live-uitzending"
        className={cn(
          "mb-8 rounded-xl border p-6",
          liveStand?.live
            ? "border-accent/50 bg-accent-soft"
            : "border-line bg-surface"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              {liveStand?.live ? "Er is nu een uitzending live" : "Geen live-uitzending"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {liveStand?.live
                ? `${liveStand.titel || "Live-uitzending"} · ${liveStand.kijkers} ${
                    liveStand.kijkers === 1 ? "kijker" : "kijkers"
                  }`
                : "Zodra iemand vanaf /live/start uitzendt, verschijnt dat hier."}
            </p>
            {liveMelding ? (
              <p aria-live="polite" className="mt-2 text-sm">
                {liveMelding}
              </p>
            ) : null}
          </div>
          {liveStand?.live ? (
            <button
              type="button"
              onClick={stopUitzending}
              disabled={stopBezig}
              className={cn(
                btnPrimary,
                "bg-foreground text-background hover:bg-foreground/90",
                stopBezig && "opacity-60"
              )}
            >
              {stopBezig ? "Stoppen…" : "Stop de uitzending"}
            </button>
          ) : null}
        </div>
      </section>

      {/* Uitzendingen: verwijderen of alsnog naar YouTube */}
      <section
        aria-label="Uitzendingen"
        className="mb-8 rounded-xl border border-line bg-surface p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-lg font-semibold tracking-tight">
            Uitzendingen
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            {uitzendingen.length} online · opslag{" "}
            <span
              className={cn(totaleOpslagMb > 700 && "text-accent")}
              title="De gratis opslag is ongeveer 1000 MB. Ruim op wanneer je er dicht bij zit."
            >
              {Math.round(totaleOpslagMb)} MB / ±1000 MB
            </span>
          </p>
        </div>
        {uitzendingen.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Er staan nu geen opnames online.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {uitzendingen.map((uitzending) => {
              const youtubeId = uitzending.youtubeUrl
                ? uitzending.youtubeUrl.split("/").pop() ?? ""
                : "";
              return (
                <li
                  key={uitzending.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {uitzending.titel}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-2">
                      nog {uitzending.dagenOver}{" "}
                      {uitzending.dagenOver === 1 ? "dag" : "dagen"} ·{" "}
                      {uitzending.grootteMb.toLocaleString("nl-NL")} MB ·{" "}
                      {uitzending.youtubeUrl
                        ? "privé op YouTube"
                        : "nog niet op YouTube"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {youtubeId ? (
                      <a
                        href={`https://studio.youtube.com/video/${youtubeId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(btnGhost, "h-9 px-4 text-xs")}
                      >
                        YouTube Studio
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => naarYouTubeBeheer(uitzending)}
                        disabled={opnameBezig === uitzending.id}
                        className={cn(
                          btnGhost,
                          "h-9 px-4 text-xs",
                          opnameBezig === uitzending.id && "opacity-60"
                        )}
                      >
                        {opnameBezig === uitzending.id
                          ? "Bezig…"
                          : "Naar YouTube"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => verwijderUitzending(uitzending.id)}
                      disabled={opnameBezig === uitzending.id}
                      className={cn(
                        btnGhost,
                        "h-9 px-4 text-xs text-accent hover:text-accent",
                        opnameBezig === uitzending.id && "opacity-60"
                      )}
                    >
                      Verwijder
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {uitzendingMelding ? (
          <p aria-live="polite" className="mt-3 text-sm">
            {uitzendingMelding}
          </p>
        ) : null}
      </section>

      {/* Ingestuurde live-links */}
      <section
        aria-label="Live-links van bezoekers"
        className="mb-8 rounded-xl border border-line bg-surface p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-display text-lg font-semibold tracking-tight">
            Live-links van bezoekers
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
            {links.length} online
          </p>
        </div>
        {links.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Er staan nu geen ingestuurde links.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{link.titel}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-2">
                    {link.host}
                    {link.naam ? ` · ${link.naam}` : ""} · {link.url}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(btnGhost, "h-9 px-4 text-xs")}
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => verwijderLink(link.id)}
                    disabled={linkBezig === link.id}
                    className={cn(
                      btnGhost,
                      "h-9 px-4 text-xs text-accent hover:text-accent",
                      linkBezig === link.id && "opacity-60"
                    )}
                  >
                    {linkBezig === link.id ? "Bezig…" : "Verwijder"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {linkMelding ? (
          <p aria-live="polite" className="mt-3 text-sm">
            {linkMelding}
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {meldingen.length}{" "}
          {meldingen.length === 1 ? "melding" : "meldingen"} (nieuwste eerst,
          max. 200)
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className={btnGhost}
            onClick={() => laadMeldingen(token)}
          >
            Verversen
          </button>
          <button type="button" className={btnGhost} onClick={uitloggen}>
            Uitloggen
          </button>
        </div>
      </div>

      {foutmelding ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm"
        >
          {foutmelding}
        </p>
      ) : null}

      {meldingen.length === 0 ? (
        <div className="mt-8 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold tracking-tight">
            Nog geen meldingen.
          </p>
          <p className="mt-2 text-sm text-muted">
            Nieuwe meldingen verschijnen hier automatisch na verversen.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {meldingen.map((melding) => (
            <article
              key={melding.id}
              className="rounded-xl border border-line bg-surface p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {SOORT_LABEL[melding.soort] ?? melding.soort}
                  </p>
                  <p className="mt-1 font-mono text-xs tracking-wide text-muted-2">
                    binnen: {formatDatum(melding.createdAt)}
                    {melding.datum ? ` · gebeurd: ${melding.datum}` : ""}
                    {melding.plaats ? ` · ${melding.plaats}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {melding.opKaart ? (
                    <span className="rounded-full border border-accent/50 bg-accent-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]">
                      op de kaart
                    </span>
                  ) : null}
                  {melding.contactEmail ? (
                    <a
                      href={`mailto:${melding.contactEmail}`}
                      className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] tracking-wide text-muted hover:text-foreground"
                    >
                      {melding.contactEmail}
                    </a>
                  ) : (
                    <span className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      anoniem
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {melding.beschrijving}
              </p>
              {(() => {
                const rijen = agentRijen(melding);
                if (rijen.length === 0 && !melding.agentBeschrijving) {
                  return null;
                }
                return (
                  <div className="mt-4 rounded-lg border border-line bg-surface-2 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                      Over de agent(en)
                    </p>
                    {rijen.length > 0 ? (
                      <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm text-muted sm:grid-cols-2">
                        {rijen.map(([label, waarde]) => (
                          <div key={label} className="flex gap-2">
                            <dt className="shrink-0 text-muted-2">{label}:</dt>
                            <dd>{waarde}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    {melding.agentBeschrijving ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                        {melding.agentBeschrijving}
                      </p>
                    ) : null}
                  </div>
                );
              })()}
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-2">
                  id: {melding.id}
                </span>
                <button
                  type="button"
                  onClick={() => verwijder(melding)}
                  disabled={verwijderBezig === melding.id}
                  className={cn(
                    "rounded-lg border border-line-strong px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground",
                    verwijderBezig === melding.id && "opacity-50"
                  )}
                >
                  {verwijderBezig === melding.id
                    ? "Verwijderen…"
                    : "Verwijderen"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
