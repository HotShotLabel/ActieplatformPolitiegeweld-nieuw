import Link from "next/link";
import { Reveal } from "@/components/site/reveal";

function DotMap() {
  return (
    <div
      aria-hidden
      className="relative mt-8 h-28 overflow-hidden rounded-lg border border-line bg-surface-2 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:14px_14px]"
    >
      <span className="animate-pulse-dot absolute left-[22%] top-[38%] h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="animate-pulse-dot absolute left-[54%] top-[62%] h-1.5 w-1.5 rounded-full bg-accent [animation-delay:0.9s]" />
      <span className="animate-pulse-dot absolute left-[76%] top-[30%] h-1.5 w-1.5 rounded-full bg-accent [animation-delay:1.7s]" />
    </div>
  );
}

const cellClass =
  "group flex h-full flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface p-7 transition-colors hover:border-line-strong";

const cellLinkClass =
  "mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted transition-colors group-hover:text-accent";

const DOCUMENTS = [
  "Klacht bij de politie",
  "Klacht bij de ombudsman",
  "Artikel 12 Sv",
  "Woo-verzoek",
  "Schadeclaim",
];

export function Tools() {
  return (
    <section
      id="mogelijkheden"
      className="mx-auto w-full max-w-[1200px] px-6 py-24 md:py-32 lg:px-10"
    >
      <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Wat je hier kunt doen
      </h2>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Reveal className="md:col-span-2">
          <Link href="/melden" className={cellClass}>
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-accent/10 blur-[90px] transition-opacity duration-300 group-hover:opacity-80"
              />
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Incident melden
              </h3>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-muted">
                Vertel wat er is gebeurd. Anoniem kan, met beelden kan, en je
                houdt zelf de regie over wat je deelt.
              </p>
            </div>
            <span className={cellLinkClass}>Start hier →</span>
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <Link href="/kaart" className={cellClass}>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Meldingenkaart
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Zie waar incidenten zich voordoen, zonder externe trackers.
              </p>
            </div>
            <DotMap />
            <span className={cellLinkClass}>Naar de kaart →</span>
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <Link href="/uitspraken" className={cellClass}>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Rechterlijke uitspraken
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Zaken waarin het optreden van de politie is onderzocht of
                veroordeeld, doorzoekbaar op één plek.
              </p>
            </div>
            <span className={cellLinkClass}>Bekijk uitspraken →</span>
          </Link>
        </Reveal>

        <Reveal delay={0.15} className="md:col-span-2">
          <Link href="/juridisch" className={cellClass}>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Modelbrieven en wegwijzers
              </h3>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-muted">
                Kant-en-klare brieven en uitleg per stap, in gewone taal.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {DOCUMENTS.map((document) => (
                <span
                  key={document}
                  className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
                >
                  {document}
                </span>
              ))}
            </div>
            <span className={cellLinkClass}>Naar juridische hulp →</span>
          </Link>
        </Reveal>

        <Reveal delay={0.2}>
          <Link href="/chat" className={cellClass}>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Vraagbaak
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Stel je vraag in gewone taal. De vraagbaak wijst je de weg.
              </p>
            </div>
            <div className="mt-8">
              <p className="w-fit max-w-[26ch] rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
                “Wat kan ik doen als mijn klacht niet wordt behandeld?”
              </p>
              <span
                aria-hidden
                className="mt-3 flex gap-1 pl-1"
              >
                <span className="animate-blink h-1.5 w-1.5 rounded-full bg-muted-2" />
                <span className="animate-blink h-1.5 w-1.5 rounded-full bg-muted-2 [animation-delay:0.2s]" />
                <span className="animate-blink h-1.5 w-1.5 rounded-full bg-muted-2 [animation-delay:0.4s]" />
              </span>
            </div>
            <span className={cellLinkClass}>Open de vraagbaak →</span>
          </Link>
        </Reveal>

        <Reveal delay={0.25} className="md:col-span-2">
          <Link href="/meedoen" className={cellClass}>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Meedoen
              </h3>
              <p className="mt-3 max-w-[46ch] leading-relaxed text-muted">
                Als jurist, onderzoeker, vertaler of vrijwilliger. Of deel je
                verhaal, ook als je geen zaak wilt starten.
              </p>
            </div>
            <span className={cellLinkClass}>Doe mee →</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
