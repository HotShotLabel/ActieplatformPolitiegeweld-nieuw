"use client";

import { useEffect, useState } from "react";
import { embedVan, platformVan, type Beeld } from "@/lib/beelden";

function Speler({ beeld }: { beeld: Beeld }) {
  const embed = embedVan(beeld.url);
  const [laden, setLaden] = useState(false);

  if (embed.soort === "youtube") {
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          src={embed.src}
          title={beeld.titel}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  if (embed.soort === "tiktok" || embed.soort === "instagram") {
    if (laden) {
      return (
        <div className="flex justify-center bg-black py-2">
          <iframe
            src={embed.src}
            title={beeld.titel}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-[540px] w-[320px] max-w-full"
          />
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setLaden(true)}
        aria-label={`Video laden: ${beeld.titel}`}
        className="flex aspect-video w-full items-center justify-center bg-surface-2 transition-colors hover:bg-surface"
      >
        <span className="rounded-full border border-line-strong bg-background/80 px-5 py-2.5 text-sm font-medium">
          Bekijk de video
        </span>
      </button>
    );
  }

  if (embed.soort === "facebook") {
    if (laden) {
      return (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={embed.src}
            title={beeld.titel}
            loading="lazy"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setLaden(true)}
        aria-label={`Video laden: ${beeld.titel}`}
        className="flex aspect-video w-full items-center justify-center bg-surface-2 transition-colors hover:bg-surface"
      >
        <span className="rounded-full border border-line-strong bg-background/80 px-5 py-2.5 text-sm font-medium">
          Bekijk de video
        </span>
      </button>
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center bg-surface-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
        {platformVan(beeld.url)}
      </span>
    </div>
  );
}

export function BeeldenLijst() {
  const [beelden, setBeelden] = useState<Beeld[] | null>(null);
  const [fout, setFout] = useState(false);

  useEffect(() => {
    let gestopt = false;
    async function laad() {
      try {
        const antwoord = await fetch("/api/beelden");
        if (!antwoord.ok) throw new Error("mislukt");
        const data = (await antwoord.json()) as { beelden: Beeld[] };
        if (!gestopt) {
          setBeelden(Array.isArray(data.beelden) ? data.beelden : []);
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

  if (fout && beelden === null) {
    return (
      <p className="mt-4 rounded-xl border border-line bg-surface p-6 text-sm text-muted">
        De beelden konden niet worden geladen. Probeer het later opnieuw.
      </p>
    );
  }

  if (beelden === null) {
    return (
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        Beelden laden…
      </p>
    );
  }

  return (
    <div>
      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
        {beelden.length} {beelden.length === 1 ? "video" : "video's"} op de
        pagina
      </p>

      {beelden.length === 0 ? (
        <div className="mt-4 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="font-display text-lg font-semibold tracking-tight">
            Er staan nog geen beelden op de pagina.
          </p>
          <p className="mt-2 text-sm text-muted">
            Nieuwe beelden verschijnen hier na controle. Tip hieronder een
            video die erbij hoort.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {beelden.map((beeld) => (
            <article
              key={beeld.id}
              className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface"
            >
              <Speler beeld={beeld} />
              <div className="flex flex-1 flex-col p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                  {beeld.platform || platformVan(beeld.url)}
                  {beeld.bron && beeld.bron !== "tip" ? ` · ${beeld.bron}` : ""}
                </p>
                <h2 className="mt-2 font-medium leading-snug">
                  {beeld.titel}
                </h2>
                {beeld.plaats || beeld.datum ? (
                  <p className="mt-1.5 text-xs text-muted-2">
                    {[beeld.plaats, beeld.datum].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {beeld.toelichting ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {beeld.toelichting}
                  </p>
                ) : null}
                <a
                  href={beeld.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-3 text-xs text-muted-2 underline underline-offset-4 hover:text-foreground"
                >
                  Bekijk bij de bron: {beeld.platform || platformVan(beeld.url)}
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
