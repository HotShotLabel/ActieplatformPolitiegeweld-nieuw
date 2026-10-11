"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { btnGhost, btnPrimary } from "@/lib/ui";
import { SOORT_LABEL } from "@/lib/meldingen";

interface BeheerMelding {
  id: string;
  soort: string;
  datum: string;
  plaats: string;
  beschrijving: string;
  opKaart: boolean;
  contactEmail: string;
  createdAt: string;
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
