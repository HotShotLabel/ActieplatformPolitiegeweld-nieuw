"use client";

import { useEffect, useState } from "react";
import { platformVan, youtubeId, type Beeld } from "@/lib/beelden";

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
          {beelden.map((beeld) => {
            const ytId = youtubeId(beeld.url);
            return (
              <a
                key={beeld.id}
                href={beeld.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent/60"
              >
                {ytId ? (
                  // Omslagfoto van YouTube zelf; wij hosten geen bestanden.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                ) : null}
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
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                      {beeld.toelichting}
                    </p>
                  ) : null}
                  <p className="mt-auto pt-3 text-xs text-muted-2 underline underline-offset-4 group-hover:text-foreground">
                    Bekijk bij de bron
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
