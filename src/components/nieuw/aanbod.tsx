import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { WordReveal } from "@/components/site/word-reveal";

const ITEMS = [
  ["01", "Melding doen", "Anoniem kan, met beelden kan. Jij bepaalt wat je deelt.", "/melden"],
  ["02", "Meldingenkaart", "Waar het gebeurt, met afgeronde locaties.", "/kaart"],
  ["03", "Overleden", "Dodelijke zaken na politieoptreden, met bron.", "/overleden"],
  ["04", "Agenten", "Wie vervolgd of veroordeeld werd, per zaak.", "/agenten"],
  ["05", "Uitspraken", "Wat de rechter besliste, doorzoekbaar.", "/uitspraken"],
  ["06", "Beelden", "Video's met bron en context.", "/beelden"],
  ["07", "Cijfers", "Patronen en aantallen, met uitleg.", "/cijfers"],
  ["08", "Nieuws", "Actualiteit, archief en officiële bronnen.", "/nieuws"],
  ["09", "Live", "Uitzendingen en wat er nu gebeurt.", "/live"],
  ["10", "Juridisch", "Brieven, stappen en wegwijzers in gewone taal.", "/juridisch"],
  ["11", "Meedoen", "Als jurist, onderzoeker, vertaler of vrijwilliger.", "/meedoen"],
  ["12", "Steunen", "Houd de feeds, het onderzoek en de techniek draaiende.", "/steun"],
] as const;

export function Aanbod() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-24 md:py-32 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-blue">
            Alles wat het platform doet
          </p>
          <h2 className="mt-4 max-w-[12ch] font-display text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl">
            <WordReveal text="Eén plek voor melden, bewijs en gevolg." />
          </h2>
          <p className="mt-5 max-w-[44ch] leading-relaxed text-muted">
            Niet alleen een kaart of een nieuwslijst. Je kunt hier melden, lezen
            wat er al ligt, de uitspraak vinden en zelf meedoen.
          </p>
        </div>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {ITEMS.map(([nummer, titel, tekst, href], index) => (
            <Reveal key={nummer} delay={Math.min(index * 0.04, 0.24)}>
              <Link
                href={href}
                className="group grid grid-cols-[28px_1fr_14px] gap-3 border-b border-line py-4 transition-colors hover:border-line-strong"
              >
              <span className="pt-0.5 font-mono text-[10px] text-brand-blue">{nummer}</span>
              <span>
                <span className="block font-display text-lg font-semibold leading-tight tracking-tight transition-colors group-hover:text-accent">
                  {titel}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{tekst}</span>
              </span>
                <span className="pt-0.5 text-sm text-muted-2">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
