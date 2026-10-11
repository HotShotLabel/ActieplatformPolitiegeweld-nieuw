"use client";

/* Reageren tijdens een live-uitzending: berichten en hartjes, zoals bij
   een livestream op TikTok. De berichten gaan rechtstreeks door de
   uitzending (LiveKit), niet via de database. */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface LiveBericht {
  id: string;
  naam: string;
  tekst: string;
}

export interface LiveHart {
  id: string;
  links: number; // horizontale plek in procenten
  groot: boolean;
}

export function maakId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* Zwevende hartjes over het beeld. */
export function HartjesLaag({ harten }: { harten: LiveHart[] }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-4 z-10 h-0"
    >
      {harten.map((hart) => (
        <span
          key={hart.id}
          className={cn(
            "hart-zweef absolute bottom-0 text-accent",
            hart.groot ? "text-3xl" : "text-xl"
          )}
          style={{ left: `${hart.links}%` }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

export function LiveChat({
  berichten,
  naam,
  zetNaam,
  onVerstuur,
  onHart,
}: {
  berichten: LiveBericht[];
  naam: string;
  zetNaam: (waarde: string) => void;
  onVerstuur: (tekst: string) => void;
  onHart: () => void;
}) {
  const [tekst, setTekst] = useState("");
  const lijstRef = useRef<HTMLDivElement | null>(null);
  const laatsteChatRef = useRef(0);
  const laatsteHartRef = useRef(0);

  useEffect(() => {
    const lijst = lijstRef.current;
    if (lijst) lijst.scrollTop = lijst.scrollHeight;
  }, [berichten]);

  const verstuur = () => {
    const schoon = tekst.trim().slice(0, 200);
    const nu = Date.now();
    if (!schoon || nu - laatsteChatRef.current < 1200) return;
    laatsteChatRef.current = nu;
    onVerstuur(schoon);
    setTekst("");
  };

  return (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2">
          Reageren ({berichten.length})
        </p>
        <input
          type="text"
          value={naam}
          onChange={(gebeurtenis) => zetNaam(gebeurtenis.target.value)}
          maxLength={30}
          placeholder="Je naam"
          aria-label="Je naam voor de reacties"
          className="h-8 w-36 rounded-lg border border-line-strong bg-transparent px-2.5 text-xs outline-none focus:border-muted-2"
        />
      </div>

      <div
        ref={lijstRef}
        className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {berichten.length === 0 && (
          <p className="text-xs text-muted-2">
            Nog geen reacties. Zeg iets tegen de uitzender.
          </p>
        )}
        {berichten.map((bericht) => (
          <p key={bericht.id} className="text-sm leading-snug">
            <span className="font-medium text-foreground">
              {bericht.naam}
            </span>{" "}
            <span className="text-muted">{bericht.tekst}</span>
          </p>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(gebeurtenis) => {
          gebeurtenis.preventDefault();
          verstuur();
        }}
      >
        <input
          type="text"
          value={tekst}
          onChange={(gebeurtenis) => setTekst(gebeurtenis.target.value)}
          maxLength={200}
          placeholder="Typ een reactie..."
          aria-label="Reactie typen"
          className="h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-muted-2"
        />
        <button
          type="button"
          onClick={() => {
            const nu = Date.now();
            if (nu - laatsteHartRef.current < 250) return;
            laatsteHartRef.current = nu;
            onHart();
          }}
          aria-label="Stuur een hartje"
          className="flex h-10 w-11 items-center justify-center rounded-lg border border-line-strong text-lg text-accent transition-colors hover:bg-white/5"
        >
          ♥
        </button>
        <button
          type="submit"
          className="h-10 rounded-lg bg-accent-deep px-4 text-sm font-medium text-white transition-colors hover:bg-[#c0333a]"
        >
          Stuur
        </button>
      </form>
    </div>
  );
}
