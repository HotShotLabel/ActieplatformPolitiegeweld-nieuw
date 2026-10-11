"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { btnPrimary } from "@/lib/ui";

type Bericht = { rol: "gebruiker" | "assistent"; tekst: string };

const SUGGESTIES = [
  "Mijn klacht bij de politie wordt niet behandeld",
  "Wat is artikel 12 Sv?",
  "Kan ik anoniem melden?",
  "Wat doet het Actieplatform?",
];

export function Vraagbaak() {
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [berichten]);

  async function verstuur(tekstVanGebruiker: string) {
    const schoon = tekstVanGebruiker.trim();
    if (!schoon || bezig) return;

    setFout("");
    const geschiedenis = [
      ...berichten,
      { rol: "gebruiker" as const, tekst: schoon },
    ];
    setBerichten([...geschiedenis, { rol: "assistent", tekst: "" }]);
    setInvoer("");
    setBezig(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let inhoud = "";

    try {
      const antwoord = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          berichten: geschiedenis.map((bericht) => ({
            rol: bericht.rol === "assistent" ? "model" : "user",
            tekst: bericht.tekst,
          })),
        }),
        signal: controller.signal,
      });

      if (!antwoord.ok || !antwoord.body) {
        let boodschap = "De vraagbaak is even niet bereikbaar. Probeer het zo nog eens.";
        try {
          const data = await antwoord.json();
          if (data?.fout) boodschap = data.fout;
        } catch {
          // geen json, standaardboodschap
        }
        throw new Error(boodschap);
      }

      const lezer = antwoord.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await lezer.read();
        if (done) break;
        inhoud += decoder.decode(value, { stream: true });
        const momentopname = inhoud;
        setBerichten((huidig) => {
          const kopie = [...huidig];
          kopie[kopie.length - 1] = { rol: "assistent", tekst: momentopname };
          return kopie;
        });
      }

      if (!inhoud.trim()) throw new Error("Leeg antwoord ontvangen.");
    } catch (foutje) {
      const isAfgebroken =
        foutje instanceof DOMException && foutje.name === "AbortError";
      if (!isAfgebroken) {
        setFout(
          foutje instanceof Error && foutje.message
            ? foutje.message
            : "Er ging iets mis. Probeer het zo nog eens."
        );
      }
      if (!inhoud.trim()) {
        setBerichten((huidig) => huidig.slice(0, -1));
      }
    } finally {
      setBezig(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const laatste = berichten[berichten.length - 1];
  const wachtOpEersteTeken =
    bezig && laatste?.rol === "assistent" && laatste.tekst === "";

  return (
    <div>
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Gesprek met de vraagbaak"
        className="h-[54vh] min-h-[360px] space-y-4 overflow-y-auto rounded-xl border border-line bg-surface p-5 md:p-7"
      >
        {berichten.length === 0 ? (
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">
              Waar wil je mee verder?
            </p>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-muted">
              Stel je vraag in gewone taal. Ik wijs je de weg naar de juiste
              stappen. Voorbeelden:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIES.map((suggestie) => (
                <button
                  key={suggestie}
                  type="button"
                  onClick={() => verstuur(suggestie)}
                  className="rounded-full border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  {suggestie}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {berichten.map((bericht, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[85%] rounded-xl px-4 py-3 text-[15px] leading-relaxed",
              bericht.rol === "gebruiker"
                ? "ml-auto bg-accent-soft text-foreground"
                : "border border-line bg-surface-2 text-foreground"
            )}
          >
            {bericht.rol === "assistent" ? (
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-2">
                Vraagbaak
              </p>
            ) : null}
            {bericht.tekst ? (
              <p className="whitespace-pre-wrap">{bericht.tekst}</p>
            ) : (
              <span aria-hidden className="flex gap-1 py-1">
                <span className="animate-blink h-1.5 w-1.5 rounded-full bg-muted-2" />
                <span className="animate-blink h-1.5 w-1.5 rounded-full bg-muted-2 [animation-delay:0.2s]" />
                <span className="animate-blink h-1.5 w-1.5 rounded-full bg-muted-2 [animation-delay:0.4s]" />
              </span>
            )}
          </div>
        ))}

        {wachtOpEersteTeken ? (
          <p className="sr-only">De vraagbaak denkt na.</p>
        ) : null}
      </div>

      {fout ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm"
        >
          {fout}
        </p>
      ) : null}

      <form
        className="mt-4 flex items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          verstuur(invoer);
        }}
      >
        <div className="flex-1">
          <label htmlFor="vraag" className="sr-only">
            Je vraag
          </label>
          <textarea
            id="vraag"
            rows={2}
            className="w-full resize-none rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
            placeholder="Typ je vraag…"
            value={invoer}
            maxLength={2000}
            onChange={(event) => setInvoer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                verstuur(invoer);
              }
            }}
            disabled={bezig}
          />
        </div>
        {bezig ? (
          <button
            type="button"
            onClick={stop}
            className="h-11 rounded-lg border border-line-strong px-4 text-sm text-muted transition-colors hover:text-foreground"
          >
            Stop
          </button>
        ) : (
          <button type="submit" className={btnPrimary} disabled={!invoer.trim()}>
            Verstuur
          </button>
        )}
      </form>

      <p className="mt-3 max-w-[70ch] text-xs leading-relaxed text-muted-2">
        De vraagbaak geeft algemene informatie en is geen advocaat. Je gesprek
        wordt niet opgeslagen. Deel geen namen, adressen of andere
        persoonsgegevens. Bij spoed bel je 112.
      </p>
    </div>
  );
}
