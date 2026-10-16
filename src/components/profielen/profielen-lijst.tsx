"use client";

import { useEffect, useState } from "react";

interface ProfielBron {
  label: string;
  url: string;
}

interface ProfielItem {
  url: string;
  titel: string;
}

interface Profiel {
  id: string;
  label: string;
  kenmerk: string;
  eenheid: string;
  notities: string;
  bronnen: ProfielBron[];
  items: ProfielItem[];
  status: string;
}

export function ProfielenLijst() {
  const [profielen, setProfielen] = useState<Profiel[] | null>(null);
  const [fout, setFout] = useState(false);

  useEffect(() => {
    let gestopt = false;
    async function laad() {
      try {
        const antwoord = await fetch("/api/profielen");
        if (!antwoord.ok) throw new Error("mislukt");
        const data = (await antwoord.json()) as { profielen: Profiel[] };
        if (!gestopt) {
          setProfielen(Array.isArray(data.profielen) ? data.profielen : []);
          setFout(false);
        }
      } catch {
        if (!gestopt) setFout(true);
      }
    }
    void laad();
    const timer = window.setInterval(laad, 5 * 60 * 1000);
    return () => {
      gestopt = true;
      window.clearInterval(timer);
    };
  }, []);

  if (fout && profielen === null) {
    return (
      <p className="mt-4 rounded-xl border border-line bg-surface p-6 text-sm text-muted">
        De profielen konden niet worden geladen. Probeer het later opnieuw.
      </p>
    );
  }

  if (profielen === null) {
    return (
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        Profielen laden…
      </p>
    );
  }

  if (profielen.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-display text-lg font-semibold tracking-tight">
          Er staan nog geen profielen op de pagina.
        </p>
        <p className="mt-2 text-sm text-muted">
          Profielen verschijnen hier nadat ze met bronnen zijn bevestigd en
          zichtbaar gemaakt.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      {profielen.map((profiel) => (
        <article
          key={profiel.id}
          className="flex flex-col rounded-xl border border-line bg-surface p-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                profiel.status === "bevestigd"
                  ? "rounded-full border border-accent/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent"
                  : "rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
              }
            >
              {profiel.status === "bevestigd"
                ? "bevestigd met bron"
                : "mogelijk dezelfde"}
            </span>
            {profiel.eenheid ? (
              <span className="text-xs text-muted-2">{profiel.eenheid}</span>
            ) : null}
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
            {profiel.label}
          </h2>
          {profiel.kenmerk ? (
            <p className="mt-1 font-mono text-xs text-muted-2">
              Kenmerk: {profiel.kenmerk}
            </p>
          ) : null}
          {profiel.notities ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {profiel.notities}
            </p>
          ) : null}
          {profiel.items.length > 0 ? (
            <div className="mt-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                Terugkerend in ({profiel.items.length})
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {profiel.items.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted underline underline-offset-4 hover:text-foreground"
                    >
                      {item.titel || item.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {profiel.bronnen.length > 0 ? (
            <div className="mt-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                Bronnen
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {profiel.bronnen.map((bron) => (
                  <li key={bron.url}>
                    <a
                      href={bron.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted underline underline-offset-4 hover:text-foreground"
                    >
                      {bron.label || bron.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
