import Link from "next/link";
import { Reveal } from "@/components/site/reveal";

const ITEMS = [
  {
    n: "01",
    title: "Incident melden",
    body: "Vertel wat er is gebeurd. Anoniem kan, met beelden kan, en je houdt zelf de regie over wat je deelt.",
    href: "/melden",
  },
  {
    n: "02",
    title: "Meldingenkaart",
    body: "Zie waar incidenten zich voordoen. Alleen afgeronde locaties, nooit je verhaal.",
    href: "/kaart",
  },
  {
    n: "03",
    title: "Rechterlijke uitspraken",
    body: "Zaken waarin het optreden van de politie is onderzocht of veroordeeld, doorzoekbaar op één plek.",
    href: "/uitspraken",
  },
  {
    n: "04",
    title: "Modelbrieven en wegwijzers",
    body: "Kant-en-klare brieven en uitleg per stap, in gewone taal.",
    href: "/juridisch",
  },
  {
    n: "05",
    title: "Vraagbaak",
    body: "Stel je vraag in gewone taal. De vraagbaak wijst je de weg.",
    href: "/chat",
  },
  {
    n: "06",
    title: "Beelden",
    body: "Verzamelde video's van politiegeweld in Nederland, met de bron erbij. Tik er zelf ook een aan.",
    href: "/beelden",
  },
  {
    n: "07",
    title: "Meedoen",
    body: "Als jurist, onderzoeker, vertaler of vrijwilliger. Of deel je verhaal, ook als je geen zaak wilt starten.",
    href: "/meedoen",
  },
];

export function Tools() {
  return (
    <section
      id="mogelijkheden"
      className="mx-auto w-full max-w-[1200px] px-6 py-24 md:py-32 lg:px-10"
    >
      <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Wat je hier kunt doen
          </h2>
          <p className="mt-5 max-w-[40ch] leading-relaxed text-muted">
            Van melden tot meedoen. Elk onderdeel brengt je verder in hetzelfde
            dossier.
          </p>
        </div>

        <div className="border-t border-line">
          {ITEMS.map((item, index) => (
            <Reveal key={item.n} delay={index * 0.04}>
              <Link
                href={item.href}
                className="group grid gap-3 border-b border-line py-9 transition-colors hover:bg-white/[0.02] md:grid-cols-[84px_200px_1fr_24px] md:gap-8 md:py-10"
              >
                <span className="font-mono text-sm text-muted-2 transition-colors group-hover:text-accent">
                  {item.n}
                </span>
                <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  {item.title}
                </h3>
                <p className="max-w-[52ch] leading-relaxed text-muted">
                  {item.body}
                </p>
                <span
                  aria-hidden="true"
                  className="hidden self-center text-sm text-muted-2 transition-colors group-hover:text-accent md:block"
                >
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
