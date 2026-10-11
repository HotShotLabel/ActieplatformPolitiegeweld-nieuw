"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { btnGhost, btnPrimary } from "@/lib/ui";
import {
  legeVelden,
  maakBrief,
  ROUTES,
  type BriefVelden,
  type ModelbriefType,
} from "@/lib/modelbrieven";

const inputClass =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none";

const textareaClass =
  "min-h-28 w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none";

const labelClass = "mb-1.5 block text-sm text-muted";

export function ModelbriefGenerator() {
  const [type, setType] = useState<ModelbriefType>("klacht-politie");
  const [velden, setVelden] = useState<BriefVelden>(legeVelden);
  const [gekopieerd, setGekopieerd] = useState(false);

  function zet(veld: keyof BriefVelden, waarde: string) {
    setVelden((huidig) => ({ ...huidig, [veld]: waarde }));
  }

  const brief = useMemo(() => maakBrief(type, velden), [type, velden]);
  const route = ROUTES.find((item) => item.id === type) ?? ROUTES[0];

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(brief);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2500);
    } catch {
      setGekopieerd(false);
    }
  }

  function download() {
    const blob = new Blob([brief], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `modelbrief-${type}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const toonGebeurtenis = type !== "woo";

  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        {ROUTES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setType(item.id)}
            aria-pressed={type === item.id}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              type === item.id
                ? "border-accent bg-accent-soft text-foreground"
                : "border-line-strong text-muted hover:border-muted-2 hover:text-foreground"
            )}
          >
            {item.titel}
          </button>
        ))}
      </div>

      <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-muted">
        {route.kort} Vul hieronder je gegevens in; de brief wordt direct
        opgebouwd. Alles blijft in je eigen browser, wij slaan niets op.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="datumBrief" className={labelClass}>
            Datum van de brief
          </label>
          <div className="flex gap-2">
            <input
              id="datumBrief"
              type="text"
              className={inputClass}
              placeholder="Bijv. 11 oktober 2026"
              value={velden.vandaag}
              onChange={(event) => zet("vandaag", event.target.value)}
            />
            <button
              type="button"
              onClick={() =>
                setVelden((huidig) => ({
                  ...huidig,
                  vandaag: new Date().toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                }))
              }
              className="h-11 shrink-0 rounded-lg border border-line-strong px-4 text-sm text-muted transition-colors hover:text-foreground"
            >
              Vandaag
            </button>
          </div>
        </div>
        {toonGebeurtenis ? (
          <div>
            <label htmlFor="datumGebeurtenis" className={labelClass}>
              Datum van de gebeurtenis
            </label>
            <input
              id="datumGebeurtenis"
              type="date"
              className={inputClass}
              value={velden.datumGebeurtenis}
              onChange={(event) => zet("datumGebeurtenis", event.target.value)}
            />
          </div>
        ) : null}
        {toonGebeurtenis ? (
          <>
            <div>
              <label htmlFor="plaatsGebeurtenis" className={labelClass}>
                Plaats van de gebeurtenis
              </label>
              <input
                id="plaatsGebeurtenis"
                type="text"
                className={inputClass}
                placeholder="Bijv. Amsterdam, station Bijlmer"
                value={velden.plaatsGebeurtenis}
                onChange={(event) => zet("plaatsGebeurtenis", event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="omschrijving" className={labelClass}>
                Wat is er gebeurd?
              </label>
              <textarea
                id="omschrijving"
                className={textareaClass}
                placeholder="Beschrijf kort en feitelijk wat er gebeurde: wie, wat, wanneer."
                value={velden.omschrijving}
                onChange={(event) => zet("omschrijving", event.target.value)}
              />
            </div>
          </>
        ) : null}

        {type === "klacht-politie" ? (
          <>
            <div>
              <label htmlFor="eenheid" className={labelClass}>
                Eenheid van de politie
              </label>
              <input
                id="eenheid"
                type="text"
                className={inputClass}
                placeholder="Bijv. Amsterdam, Den Haag, Oost-Nederland"
                value={velden.eenheid}
                onChange={(event) => zet("eenheid", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="doel" className={labelClass}>
                Wat wil je met de klacht bereiken?
              </label>
              <input
                id="doel"
                type="text"
                className={inputClass}
                placeholder="Bijv. erkenning, een gesprek, onderzoek"
                value={velden.doel}
                onChange={(event) => zet("doel", event.target.value)}
              />
            </div>
          </>
        ) : null}

        {type === "ombudsman" ? (
          <>
            <div>
              <label htmlFor="eenheid-ombudsman" className={labelClass}>
                Eenheid van de politie
              </label>
              <input
                id="eenheid-ombudsman"
                type="text"
                className={inputClass}
                value={velden.eenheid}
                onChange={(event) => zet("eenheid", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="klachtDatum" className={labelClass}>
                Wanneer diende je de klacht in bij de politie?
              </label>
              <input
                id="klachtDatum"
                type="date"
                className={inputClass}
                value={velden.klachtDatum}
                onChange={(event) => zet("klachtDatum", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="klachtStand" className={labelClass}>
                Wat deed de politie met je klacht?
              </label>
              <input
                id="klachtStand"
                type="text"
                className={inputClass}
                placeholder="Bijv. afgewezen op 1 maart, of nog geen reactie na zes weken"
                value={velden.klachtStand}
                onChange={(event) => zet("klachtStand", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ontevreden" className={labelClass}>
                Waarom ben je niet tevreden?
              </label>
              <textarea
                id="ontevreden"
                className={textareaClass}
                value={velden.ontevreden}
                onChange={(event) => zet("ontevreden", event.target.value)}
              />
            </div>
          </>
        ) : null}

        {type === "artikel12" ? (
          <>
            <div>
              <label htmlFor="parket" className={labelClass}>
                Parket van het Openbaar Ministerie
              </label>
              <input
                id="parket"
                type="text"
                className={inputClass}
                placeholder="Bijv. Amsterdam, Den Haag, Oost-Nederland"
                value={velden.parket}
                onChange={(event) => zet("parket", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="beslissingDatum" className={labelClass}>
                Wanneer hoorde je dat er niet vervolgd wordt?
              </label>
              <input
                id="beslissingDatum"
                type="date"
                className={inputClass}
                value={velden.beslissingDatum}
                onChange={(event) => zet("beslissingDatum", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="advocaat" className={labelClass}>
                Advocaat (als je die hebt, mag je leeg laten)
              </label>
              <input
                id="advocaat"
                type="text"
                className={inputClass}
                placeholder="Naam van je advocaat"
                value={velden.advocaat}
                onChange={(event) => zet("advocaat", event.target.value)}
              />
            </div>
          </>
        ) : null}

        {type === "woo" ? (
          <>
            <div>
              <label htmlFor="orgaan" className={labelClass}>
                Bij wie vraag je de informatie op?
              </label>
              <input
                id="orgaan"
                type="text"
                className={inputClass}
                placeholder="Bijv. Nationale Politie, eenheid Amsterdam, of het Openbaar Ministerie, parket Den Haag"
                value={velden.orgaan}
                onChange={(event) => zet("orgaan", event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="documenten" className={labelClass}>
                Welke documenten vraag je op?
              </label>
              <textarea
                id="documenten"
                className={textareaClass}
                placeholder="Wees zo gericht mogelijk: welke stukken, over welke periode, over welk onderwerp."
                value={velden.documenten}
                onChange={(event) => zet("documenten", event.target.value)}
              />
            </div>
          </>
        ) : null}

        {type === "schade" ? (
          <>
            <div>
              <label htmlFor="eenheid-schade" className={labelClass}>
                Eenheid van de politie
              </label>
              <input
                id="eenheid-schade"
                type="text"
                className={inputClass}
                value={velden.eenheid}
                onChange={(event) => zet("eenheid", event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="schadeBedrag" className={labelClass}>
                Bedrag (mag je leeg laten)
              </label>
              <input
                id="schadeBedrag"
                type="text"
                className={inputClass}
                placeholder="Bijv. 1.250 euro, of: nader op te geven"
                value={velden.schadeBedrag}
                onChange={(event) => zet("schadeBedrag", event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="schadeOmschrijving" className={labelClass}>
                Welke schade heb je?
              </label>
              <textarea
                id="schadeOmschrijving"
                className={textareaClass}
                placeholder="Bijv. letsel met medische kosten, kapotte telefoon, dagen niet kunnen werken."
                value={velden.schadeOmschrijving}
                onChange={(event) => zet("schadeOmschrijving", event.target.value)}
              />
            </div>
          </>
        ) : null}

        <div>
          <label htmlFor="naam" className={labelClass}>
            Je naam
          </label>
          <input
            id="naam"
            type="text"
            className={inputClass}
            value={velden.naam}
            onChange={(event) => zet("naam", event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="adres" className={labelClass}>
            Straat en huisnummer
          </label>
          <input
            id="adres"
            type="text"
            className={inputClass}
            value={velden.adres}
            onChange={(event) => zet("adres", event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="postcodePlaats" className={labelClass}>
            Postcode en plaats
          </label>
          <input
            id="postcodePlaats"
            type="text"
            className={inputClass}
            placeholder="1234 AB Amsterdam"
            value={velden.postcodePlaats}
            onChange={(event) => zet("postcodePlaats", event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="telefoon" className={labelClass}>
            Telefoon (mag je leeg laten)
          </label>
          <input
            id="telefoon"
            type="text"
            className={inputClass}
            value={velden.telefoon}
            onChange={(event) => zet("telefoon", event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="email" className={labelClass}>
            E-mail (mag je leeg laten)
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={velden.email}
            onChange={(event) => zet("email", event.target.value)}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Jouw brief
          </h3>
          <div className="flex gap-3">
            <button type="button" onClick={kopieer} className={btnGhost}>
              {gekopieerd ? "Gekopieerd" : "Kopieer"}
            </button>
            <button type="button" onClick={download} className={btnPrimary}>
              Download .txt
            </button>
          </div>
        </div>
        <pre className="max-h-[560px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-background p-5 font-sans text-sm leading-relaxed text-foreground">
          {brief}
        </pre>
        <p className="mt-3 max-w-[70ch] text-xs leading-relaxed text-muted-2">
          Controleer de brief voordat je hem verstuurt, vul de stukken tussen
          vierkante haken aan en pas aan waar nodig. Deze brief is een model,
          geen juridisch advies.
        </p>
      </div>
    </div>
  );
}
