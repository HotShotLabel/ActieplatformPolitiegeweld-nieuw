"use client";

import { useState } from "react";
import { btnGhost, btnPrimary } from "@/lib/ui";

const inputClass =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-line-strong bg-surface px-3.5 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none";

export function BeeldenTip() {
  const [url, setUrl] = useState("");
  const [titel, setTitel] = useState("");
  const [toelichting, setToelichting] = useState("");
  const [plaats, setPlaats] = useState("");
  const [datum, setDatum] = useState("");
  const [honing, setHoning] = useState("");
  const [status, setStatus] = useState<"leeg" | "bezig" | "klaar" | "fout">(
    "leeg"
  );
  const [melding, setMelding] = useState("");

  async function verstuur(gebeurtenis: React.FormEvent) {
    gebeurtenis.preventDefault();
    if (status === "bezig") return;
    setStatus("bezig");
    setMelding("");
    try {
      const antwoord = await fetch("/api/beelden/tip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, titel, toelichting, plaats, datum, honing }),
      });
      const data = await antwoord.json().catch(() => ({}));
      if (!antwoord.ok) {
        setStatus("fout");
        setMelding(data.fout ?? "Er ging iets mis. Probeer het opnieuw.");
        return;
      }
      setStatus("klaar");
      setUrl("");
      setTitel("");
      setToelichting("");
      setPlaats("");
      setDatum("");
    } catch {
      setStatus("fout");
      setMelding("Er ging iets mis. Probeer het opnieuw.");
    }
  }

  if (status === "klaar") {
    return (
      <div className="rounded-xl border border-line bg-surface p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Bedankt
        </p>
        <p className="mt-3 max-w-[58ch] leading-relaxed text-muted">
          We kijken de video na en zetten hem daarna op de pagina. Wij bewaren
          geen bestanden, alleen de link naar de originele bron.
        </p>
        <button
          type="button"
          className={`${btnGhost} mt-6`}
          onClick={() => setStatus("leeg")}
        >
          Nog een tip insturen
        </button>
      </div>
    );
  }

  const bezig = status === "bezig";

  return (
    <form onSubmit={verstuur} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="beeld-url" className="mb-2 block text-sm text-muted">
            Link naar de video (verplicht)
          </label>
          <input
            id="beeld-url"
            type="url"
            className={inputClass}
            placeholder="https://www.tiktok.com/... of youtube.com/... of t.me/..."
            value={url}
            onChange={(gebeurtenis) => setUrl(gebeurtenis.target.value)}
            maxLength={500}
            disabled={bezig}
          />
        </div>
        <div>
          <label
            htmlFor="beeld-titel"
            className="mb-2 block text-sm text-muted"
          >
            Korte titel (verplicht)
          </label>
          <input
            id="beeld-titel"
            type="text"
            className={inputClass}
            placeholder="Wat is er te zien?"
            value={titel}
            onChange={(gebeurtenis) => setTitel(gebeurtenis.target.value)}
            maxLength={150}
            disabled={bezig}
          />
        </div>
        <div>
          <label
            htmlFor="beeld-plaats"
            className="mb-2 block text-sm text-muted"
          >
            Plaats (mag je leeg laten)
          </label>
          <input
            id="beeld-plaats"
            type="text"
            className={inputClass}
            placeholder="Stad of wijk"
            value={plaats}
            onChange={(gebeurtenis) => setPlaats(gebeurtenis.target.value)}
            maxLength={120}
            disabled={bezig}
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="beeld-toelichting"
            className="mb-2 block text-sm text-muted"
          >
            Toelichting (mag je leeg laten)
          </label>
          <textarea
            id="beeld-toelichting"
            className={textareaClass}
            placeholder="Wat is er te zien, wanneer was het, en wat weten we van de bron?"
            value={toelichting}
            onChange={(gebeurtenis) => setToelichting(gebeurtenis.target.value)}
            maxLength={1000}
            disabled={bezig}
          />
        </div>
        <div>
          <label
            htmlFor="beeld-datum"
            className="mb-2 block text-sm text-muted"
          >
            Datum (mag je leeg laten)
          </label>
          <input
            id="beeld-datum"
            type="text"
            className={inputClass}
            placeholder="Bijv. maart 2025"
            value={datum}
            onChange={(gebeurtenis) => setDatum(gebeurtenis.target.value)}
            maxLength={40}
            disabled={bezig}
          />
        </div>
      </div>

      {/* Honingpot tegen bots; voor mensen onzichtbaar. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="beeld-honing">Laat dit veld leeg</label>
        <input
          id="beeld-honing"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honing}
          onChange={(gebeurtenis) => setHoning(gebeurtenis.target.value)}
        />
      </div>

      {status === "fout" && melding ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm"
        >
          {melding}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={btnPrimary} disabled={bezig}>
          {bezig ? "Versturen…" : "Tip versturen"}
        </button>
        <p className="max-w-[48ch] text-xs leading-relaxed text-muted-2">
          Tips worden nagelopen voordat ze op de pagina komen. We bewaren geen
          videobestanden, alleen de link.
        </p>
      </div>
    </form>
  );
}
