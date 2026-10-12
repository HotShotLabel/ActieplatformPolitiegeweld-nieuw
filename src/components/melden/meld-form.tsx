"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { btnGhost, btnPrimary } from "@/lib/ui";
import {
  EENHEDEN,
  GESLACHTEN_AGENT,
  SOORTEN,
  SOORTEN_AGENT,
  VOERTUIGEN,
  type Soort,
  verstuurMelding,
} from "@/lib/meldingen";

const LocatieKiezer = dynamic(
  () =>
    import("@/components/melden/locatie-kiezer").then(
      (mod) => mod.LocatieKiezer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg border border-line bg-surface-2 text-sm text-muted-2">
        Kaart laden…
      </div>
    ),
  }
);

const inputClass =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none";

const textareaClass =
  "min-h-40 w-full rounded-lg border border-line-strong bg-surface px-3.5 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none";

const stapLabelClass =
  "font-mono text-[11px] uppercase tracking-[0.16em] text-muted-2";

type Status = "invullen" | "versturen" | "gelukt" | "fout";

const LEGE_AGENT_DETAILS = {
  agentGeslacht: "",
  agentLeeftijd: "",
  agentNaam: "",
  eenheid: "",
  voertuig: "",
  kentekens: "",
  dienstnummers: "",
  soortAgent: "",
  aantalAgenten: "",
  agentBeschrijving: "",
};

export function MeldForm() {
  const [soort, setSoort] = useState<Soort | "">("");
  const [datum, setDatum] = useState("");
  const [plaats, setPlaats] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [opKaart, setOpKaart] = useState(false);
  const [positie, setPositie] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [contactWijze, setContactWijze] = useState<"geen" | "email">("geen");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("invullen");
  const [foutmelding, setFoutmelding] = useState("");
  const [agentDetails, setAgentDetails] = useState(LEGE_AGENT_DETAILS);

  function zetAgent(veld: keyof typeof LEGE_AGENT_DETAILS, waarde: string) {
    setAgentDetails((huidig) => ({ ...huidig, [veld]: waarde }));
  }

  function valideer(): string {
    if (!soort) return "Kies wat er is gebeurd.";
    if (beschrijving.trim().length < 10)
      return "Vertel kort wat er is gebeurd (minimaal 10 tekens).";
    if (opKaart && !positie)
      return "Kies de plek op de kaart, of zet de kaartoptie uit.";
    if (contactWijze === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return "Vul een geldig e-mailadres in, of kies dat we geen contact opnemen.";
    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "versturen") return;

    const fout = valideer();
    if (fout) {
      setFoutmelding(fout);
      setStatus("fout");
      return;
    }

    // Honeypot: alleen bots vullen dit verborgen veld in.
    if (honeypot) {
      setStatus("gelukt");
      return;
    }

    setStatus("versturen");
    setFoutmelding("");

    try {
      await verstuurMelding({
        soort: soort as Soort,
        datum,
        plaats,
        beschrijving,
        opKaart,
        contactEmail: contactWijze === "email" ? email : "",
        ...agentDetails,
        lat: positie?.lat,
        lng: positie?.lng,
        website: honeypot,
      });
      setStatus("gelukt");
    } catch (foutje) {
      setStatus("fout");
      setFoutmelding(
        foutje instanceof Error && foutje.message
          ? foutje.message
          : "Er ging iets mis bij het versturen. Probeer het nog een keer, of mail ons op label@hot-shot.com."
      );
    }
  }

  function opnieuw() {
    setSoort("");
    setDatum("");
    setPlaats("");
    setBeschrijving("");
    setOpKaart(false);
    setPositie(null);
    setContactWijze("geen");
    setEmail("");
    setAgentDetails(LEGE_AGENT_DETAILS);
    setStatus("invullen");
    setFoutmelding("");
  }

  if (status === "gelukt") {
    return (
      <div className="rounded-xl border border-line bg-surface p-7 md:p-9">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Verstuurd
        </p>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Je melding is binnen.
        </h2>
        <p className="mt-4 max-w-[58ch] leading-relaxed text-muted">
          We bekijken elke melding en bewaren hem zorgvuldig.{" "}
          {opKaart
            ? "Er staat nu ook een afgerond punt op de kaart."
            : "Je melding komt niet op de kaart, zoals je koos."}{" "}
          {contactWijze === "email"
            ? "Als er iets nodig is, nemen we contact op via het adres dat je gaf."
            : "Je blijft anoniem: we hebben geen contactgegevens van je."}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className={btnPrimary}>
            Terug naar home
          </Link>
          <button type="button" className={btnGhost} onClick={opnieuw}>
            Nog een melding doen
          </button>
        </div>
      </div>
    );
  }

  const bezig = status === "versturen";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section className="rounded-xl border border-line bg-surface p-7">
        <p className={stapLabelClass}>Stap 1 · Wat is er gebeurd</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SOORTEN.map((optie) => (
            <label key={optie.waarde} className="cursor-pointer">
              <input
                type="radio"
                name="soort"
                className="peer sr-only"
                checked={soort === optie.waarde}
                onChange={() => setSoort(optie.waarde)}
                disabled={bezig}
              />
              <span className="flex min-h-12 items-center rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm text-muted transition-colors peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                {optie.label}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5">
          <label
            htmlFor="beschrijving"
            className="mb-2 block text-sm text-muted"
          >
            Wat is er gebeurd?
          </label>
          <textarea
            id="beschrijving"
            className={textareaClass}
            placeholder="Beschrijf in je eigen woorden wat je zag of meemaakte. Wie, wat, hoe. Alles wat je kwijt wilt."
            value={beschrijving}
            onChange={(event) => setBeschrijving(event.target.value)}
            maxLength={4000}
            disabled={bezig}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="datum" className="mb-2 block text-sm text-muted">
              Wanneer was het? (mag je leeg laten)
            </label>
            <input
              id="datum"
              type="date"
              className={inputClass}
              value={datum}
              onChange={(event) => setDatum(event.target.value)}
              disabled={bezig}
            />
          </div>
          <div>
            <label htmlFor="plaats" className="mb-2 block text-sm text-muted">
              Waar was het? (straat, wijk of stad)
            </label>
            <input
              id="plaats"
              type="text"
              className={inputClass}
              placeholder="Bijv. station Amsterdam, of alleen de stad"
              value={plaats}
              onChange={(event) => setPlaats(event.target.value)}
              maxLength={120}
              disabled={bezig}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-7">
        <p className={stapLabelClass}>
          Stap 2 · Over de agent(en) (optioneel)
        </p>
        <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-muted">
          Alles in deze stap mag je overslaan. Hoe meer je weet, hoe scherper
          het beeld wordt. Laat leeg wat je niet weet.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="agentGeslacht"
              className="mb-2 block text-sm text-muted"
            >
              Was het een man of een vrouw?
            </label>
            <select
              id="agentGeslacht"
              className={inputClass}
              value={agentDetails.agentGeslacht}
              onChange={(event) => zetAgent("agentGeslacht", event.target.value)}
              disabled={bezig}
            >
              <option value="">Kies of laat leeg</option>
              {GESLACHTEN_AGENT.map((optie) => (
                <option key={optie} value={optie}>
                  {optie}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="agentLeeftijd"
              className="mb-2 block text-sm text-muted"
            >
              Leeftijd (schatting)
            </label>
            <input
              id="agentLeeftijd"
              type="text"
              className={inputClass}
              placeholder="Bijv. rond 30, of 45 tot 50"
              value={agentDetails.agentLeeftijd}
              onChange={(event) => zetAgent("agentLeeftijd", event.target.value)}
              maxLength={60}
              disabled={bezig}
            />
          </div>
          <div>
            <label htmlFor="eenheid" className="mb-2 block text-sm text-muted">
              Welke eenheid of regio?
            </label>
            <select
              id="eenheid"
              className={inputClass}
              value={agentDetails.eenheid}
              onChange={(event) => zetAgent("eenheid", event.target.value)}
              disabled={bezig}
            >
              <option value="">Kies of laat leeg</option>
              {EENHEDEN.map((optie) => (
                <option key={optie} value={optie}>
                  {optie}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="soortAgent"
              className="mb-2 block text-sm text-muted"
            >
              Soort agent
            </label>
            <select
              id="soortAgent"
              className={inputClass}
              value={agentDetails.soortAgent}
              onChange={(event) => zetAgent("soortAgent", event.target.value)}
              disabled={bezig}
            >
              <option value="">Kies of laat leeg</option>
              {SOORTEN_AGENT.map((optie) => (
                <option key={optie} value={optie}>
                  {optie}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="voertuig" className="mb-2 block text-sm text-muted">
              Waar kwamen ze mee?
            </label>
            <select
              id="voertuig"
              className={inputClass}
              value={agentDetails.voertuig}
              onChange={(event) => zetAgent("voertuig", event.target.value)}
              disabled={bezig}
            >
              <option value="">Kies of laat leeg</option>
              {VOERTUIGEN.map((optie) => (
                <option key={optie} value={optie}>
                  {optie}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="aantalAgenten"
              className="mb-2 block text-sm text-muted"
            >
              Hoeveel agenten waren erbij?
            </label>
            <input
              id="aantalAgenten"
              type="text"
              className={inputClass}
              placeholder="Bijv. 2"
              value={agentDetails.aantalAgenten}
              onChange={(event) => zetAgent("aantalAgenten", event.target.value)}
              maxLength={20}
              disabled={bezig}
            />
          </div>
          <div>
            <label htmlFor="kentekens" className="mb-2 block text-sm text-muted">
              Kenteken(s) van het voertuig
            </label>
            <input
              id="kentekens"
              type="text"
              className={inputClass}
              placeholder="Bijv. 1-ABC-23 (meerdere mag, met komma)"
              value={agentDetails.kentekens}
              onChange={(event) => zetAgent("kentekens", event.target.value)}
              maxLength={200}
              disabled={bezig}
            />
          </div>
          <div>
            <label
              htmlFor="dienstnummers"
              className="mb-2 block text-sm text-muted"
            >
              Dienstnummer of nummer op het uniform
            </label>
            <input
              id="dienstnummers"
              type="text"
              className={inputClass}
              placeholder="Bijv. het nummer op het schouderstuk"
              value={agentDetails.dienstnummers}
              onChange={(event) => zetAgent("dienstnummers", event.target.value)}
              maxLength={200}
              disabled={bezig}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="agentNaam" className="mb-2 block text-sm text-muted">
              Naam van de agent (als je die weet)
            </label>
            <input
              id="agentNaam"
              type="text"
              className={inputClass}
              placeholder="Mag je leeg laten"
              value={agentDetails.agentNaam}
              onChange={(event) => zetAgent("agentNaam", event.target.value)}
              maxLength={120}
              disabled={bezig}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="agentBeschrijving"
              className="mb-2 block text-sm text-muted"
            >
              Beschrijf hoe de agent(en) eruitzagen
            </label>
            <textarea
              id="agentBeschrijving"
              className={textareaClass}
              placeholder="Lengte (schatting), haar, baard, bril, tattoo, dialect, onderscheidingen. Alles wat opviel helpt."
              value={agentDetails.agentBeschrijving}
              onChange={(event) =>
                zetAgent("agentBeschrijving", event.target.value)
              }
              maxLength={2000}
              disabled={bezig}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-7">
        <p className={stapLabelClass}>Stap 3 · Op de kaart?</p>
        <div className="mt-4 flex items-start gap-4">
          <button
            type="button"
            role="switch"
            aria-checked={opKaart}
            aria-label="Melding als afgerond punt op de kaart zetten"
            onClick={() => setOpKaart((waarde) => !waarde)}
            disabled={bezig}
            className={cn(
              "mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors",
              opKaart
                ? "border-accent bg-accent-deep"
                : "border-line-strong bg-surface-2"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "h-4 w-4 rounded-full bg-white transition-transform",
                opKaart && "translate-x-5"
              )}
            />
          </button>
          <div>
            <p className="text-sm text-foreground">
              Zet een punt op de kaart voor deze melding
            </p>
            <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-muted">
              Op de kaart komt alleen een afgerond punt van ongeveer een
              kilometer, met het soort incident en de maand. Nooit je verhaal,
              nooit je naam.
            </p>
          </div>
        </div>

        {opKaart ? (
          <div className="mt-5">
            <LocatieKiezer
              positie={positie}
              onKies={(lat, lng) => setPositie({ lat, lng })}
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-2">
                {positie
                  ? "Punt gekozen. Je kunt opnieuw klikken om te verplaatsen."
                  : "Klik op de plek waar het gebeurde."}
              </p>
              {positie ? (
                <button
                  type="button"
                  onClick={() => setPositie(null)}
                  disabled={bezig}
                  className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
                >
                  Punt wissen
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-2">
              Lukt klikken niet met toetsenbord of op dit apparaat? Laat het
              punt dan leeg en beschrijf de plek hierboven. Wij zetten het punt
              dan later voorzichtig neer.
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-line bg-surface p-7">
        <p className={stapLabelClass}>Stap 4 · Contact (optioneel)</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="contact"
              className="peer sr-only"
              checked={contactWijze === "geen"}
              onChange={() => setContactWijze("geen")}
              disabled={bezig}
            />
            <span className="flex min-h-12 items-center rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm text-muted transition-colors peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
              Liever geen contact: ik blijf anoniem
            </span>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="contact"
              className="peer sr-only"
              checked={contactWijze === "email"}
              onChange={() => setContactWijze("email")}
              disabled={bezig}
            />
            <span className="flex min-h-12 items-center rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm text-muted transition-colors peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
              Ja, jullie mogen mij mailen
            </span>
          </label>
        </div>

        {contactWijze === "email" ? (
          <div className="mt-5">
            <label htmlFor="email" className="mb-2 block text-sm text-muted">
              Je e-mailadres
            </label>
            <input
              id="email"
              type="email"
              className={inputClass}
              placeholder="naam@voorbeeld.nl"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              disabled={bezig}
            />
            <p className="mt-2 text-xs text-muted-2">
              We gebruiken dit alleen om contact op te nemen over deze melding.
            </p>
          </div>
        ) : null}
      </section>

      {/* Honeypot tegen bots; voor mensen onzichtbaar. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Laat dit veld leeg</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {status === "fout" && foutmelding ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-foreground"
        >
          {foutmelding}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className={btnPrimary} disabled={bezig}>
          {bezig ? "Versturen…" : "Melding versturen"}
        </button>
        <p className="max-w-[46ch] text-xs leading-relaxed text-muted-2">
          Je melding is alleen voor ons en staat in een afgesloten database in
          de EU. Lees meer op de{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-muted"
          >
            privacypagina
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
