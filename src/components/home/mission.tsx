import { Reveal } from "@/components/site/reveal";
import { WordReveal } from "@/components/site/word-reveal";

const ITEMS = [
  {
    n: "01",
    title: "Documenteren",
    body: "Meldingen, beelden en locaties komen in één systeem terecht. Wat vastligt, kan niet meer worden weggeschoven.",
  },
  {
    n: "02",
    title: "Ondersteunen",
    body: "We wijzen de weg naar klachten, artikel 12 Sv, schadevergoeding en juristen die het dossier kunnen overnemen.",
  },
  {
    n: "03",
    title: "Verantwoording",
    body: "Uitspraken en patronen komen bij elkaar. Zo wordt zichtbaar waar toezicht en recht tekortschieten.",
  },
  {
    n: "04",
    title: "Verbinden",
    body: "Gedupeerden, juristen en onderzoekers vinden elkaar op één plek. Alleen samen wordt het patroon zichtbaar.",
  },
];

export function Mission() {
  return (
    <section
      id="wat-wij-doen"
      className="mx-auto w-full max-w-[1200px] px-6 py-24 md:py-32 lg:px-10"
    >
      <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            <WordReveal text="Wat wij doen" />
          </h2>
          <p className="mt-5 max-w-[40ch] leading-relaxed text-muted">
            Van één melding naar een dossier dat blijft staan. Zo bouwen we aan
            verantwoording die niet afhankelijk is van nieuws of aandacht.
          </p>
        </div>

        <div className="border-t border-line">
          {ITEMS.map((item, index) => (
            <Reveal key={item.n} delay={index * 0.05}>
              <div className="group grid gap-3 border-b border-line py-9 transition-colors hover:bg-white/[0.02] md:grid-cols-[84px_200px_1fr] md:gap-8 md:py-10">
                <span className="font-mono text-sm text-muted-2 transition-colors group-hover:text-accent">
                  {item.n}
                </span>
                <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                  {item.title}
                </h3>
                <p className="max-w-[52ch] leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
